/**
 * Account deletion - everything the account owns, then the account.
 *
 * Both stores require it (App Store 5.1.1(v), Play's account-deletion policy)
 * and both reviewers press the button, so this has to actually finish. The
 * order is the whole design:
 *
 *   a. billing        cancel a Stripe subscription (BLOCKING - never delete an
 *                     account we are still charging); a store subscription
 *                     cannot be cancelled from here, so it is reported back
 *   b. assistants     release numbers to the pool, tear down ElevenLabs agents
 *   c. integrations   revoke Google calendar grants (best-effort), then the
 *                     calendar OAuth rows (tokens go with them)
 *   d. organizations
 *   e. calls          rows + cascades; ElevenLabs conversation audio (a delete that
 *                     fails or is past the inline cap is queued, and the
 *                     cancellation-sweep cron retries it)
 *   f. Apple          revoke the Sign in with Apple token
 *   g. auth user      LAST, so a failure above leaves a retryable account
 *   h. RevenueCat     drop the subscriber record (best-effort)
 *   i. revalidate
 *
 * Every step tolerates already-missing rows, so a retry after a half-finished
 * run picks up where it stopped. Best-effort steps push a token into
 * `warnings` instead of throwing.
 *
 * The orchestration (`runAccountDeletion`) takes its collaborators as an
 * argument so the ordering and the Stripe guard are unit-testable without a
 * database; `deleteAccountData` wires the real ones. The real modules are
 * loaded lazily inside that wiring, which keeps this file importable from a
 * plain node test (several of them are `server-only`).
 */

export type StoreSubscription = "apple" | "google" | null;

export interface AccountDeletionResult {
  storeSubscription: StoreSubscription;
  warnings: string[];
}

export interface DeletionBilling {
  customerId: string | null;
  subscriptionId: string | null;
  status: string | null;
  /** Added by the store-billing migration; absent on older rows. */
  provider?: string | null;
}

export interface DeletionAssistant {
  id: string;
  elevenlabs_agent_id: string | null;
  elevenlabs_kb?: { id: string; name: string }[];
  elevenlabs_tools?: { id: string; name: string }[];
}

export interface AccountDeletionDeps {
  getBilling(userId: string): Promise<DeletionBilling | null>;
  isCompCustomerId(customerId: string | null): boolean;
  /**
   * Cancel now. Resolves "canceled" when Stripe cancelled it, "gone" when the
   * subscription was already cancelled or does not exist, and throws for any
   * other failure - that throw is what stops the deletion.
   */
  cancelStripeSubscription(subscriptionId: string): Promise<"canceled" | "gone">;
  listAssistants(userId: string): Promise<DeletionAssistant[]>;
  getOwnedNumbers(userId: string): Promise<{ e164: string }[]>;
  releaseNumber(e164: string): Promise<void>;
  deleteAssistant(id: string): Promise<void>;
  freeAssistantNumbers(id: string): Promise<void>;
  deleteAssistantAgent(assistant: DeletionAssistant): Promise<void>;
  purgeAssistants(userId: string): Promise<void>;
  /**
   * Best-effort: asks Google to revoke each Google calendar grant of the owner.
   * A failed revoke only logs its status; throws only when the rows cannot be read.
   */
  revokeIntegrations(userId: string): Promise<void>;
  deleteIntegrations(userId: string): Promise<void>;
  deleteOrganizations(userId: string): Promise<void>;
  /** Every conversation id of the owner's calls (all pages); throws on a database error. */
  listConversationIds(userId: string): Promise<string[]>;
  /** Throws on failure; an error with statusCode 404 means the conversation is already gone. */
  deleteConversation(conversationId: string): Promise<void>;
  /** Saves ids for the retry sweep, skipping ones already queued; throws on a database error. */
  queueRecordingDeletions(conversationIds: string[]): Promise<void>;
  deleteCalls(userId: string): Promise<void>;
  /** Resolves false when the user had no Apple token; throws when the revoke failed. */
  revokeAppleToken(userId: string): Promise<boolean>;
  /**
   * True when the auth user has an identity with provider "apple". Read only
   * when no token was revoked, and before the auth user goes. False for a user
   * that is already gone; throws on any other error.
   */
  hasAppleIdentity(userId: string): Promise<boolean>;
  deleteAuthUser(userId: string): Promise<void>;
  /** Best-effort; throws on anything but "done" / "already gone". */
  deleteRevenueCatSubscriber(userId: string): Promise<void>;
  revalidate(): void;
}

/**
 * Statuses under which a store subscription still exists at the store and can
 * bill again (lib/store-billing/status.ts writes active | past_due | paused |
 * canceled; a paused Play subscription auto-resumes). The app sends the user
 * to the store to cancel it; only "canceled" and an expired row need nothing.
 */
const STORE_LIVE = new Set(["active", "trialing", "past_due", "paused"]);

/**
 * Stripe statuses that are terminal: nothing bills again and Stripe refuses to
 * cancel the subscription. The webhook stores `sub.status` as Stripe sends it,
 * so a row can hold either one.
 */
const STRIPE_ENDED = new Set(["canceled", "incomplete_expired"]);

/** Conversation audio deletes run this many at a time; one at a time is too slow for a busy account. */
const CONVERSATION_BATCH = 10;

/** PostgREST returns at most this many rows per select (max_rows), so longer lists are read in pages. */
const PAGE_SIZE = 1000;

/**
 * At most this many conversations are deleted inside the deletion request, so a
 * huge account stays inside the function time limit. The rest are queued and
 * the cron sweep deletes them.
 */
const INLINE_RECORDING_LIMIT = 1000;

/** A queued recording delete is tried this many times, then the row stays for a manual look. */
const MAX_RECORDING_ATTEMPTS = 10;

/** One cron run retries at most this many queued deletes, oldest first. */
const RECORDING_RETRY_LIMIT = 100;

/** After a failed retry the row waits this long before the next try. */
const RECORDING_RETRY_SPACING_MS = 60 * 60_000;

/** Same budget as the Apple revoke and Expo push calls. */
const REVENUECAT_TIMEOUT_MS = 10_000;

/** Google's OAuth revoke endpoint. Revoking the refresh token ends the whole grant. */
const GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke";

/** A Google revoke is best-effort, so it gets a shorter budget. */
const GOOGLE_REVOKE_TIMEOUT_MS = 5_000;

/**
 * Request options for every ElevenLabs conversation delete. The SDK default
 * (240 s, 2 retries) lets a hung API outlive the cron run before markFailed
 * counts the attempt; a short budget turns a hang into a normal failure.
 */
export const ELEVEN_DELETE_OPTIONS = { timeoutInSeconds: 10, maxRetries: 0 } as const;

/**
 * Ask Google to revoke the calendar grant behind one integration row (pass the
 * row's `config`), so the app leaves the user's Google account permissions.
 * The refresh token is preferred, the access token is the fallback. Never
 * throws: a failure logs the HTTP status only, never a token.
 */
export async function revokeGoogleGrant(config: unknown, fetchImpl: typeof fetch = fetch): Promise<void> {
  const stored = (config ?? {}) as { refresh_token?: unknown; access_token?: unknown };
  const token = [stored.refresh_token, stored.access_token].find(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
  if (!token) return;
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), GOOGLE_REVOKE_TIMEOUT_MS);
  try {
    const res = await fetchImpl(GOOGLE_REVOKE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }).toString(),
      signal: abort.signal,
    });
    // 400 is also what Google answers for a token that is already revoked.
    if (!res.ok) console.warn("[account-deletion] google revoke failed", res.status);
  } catch {
    // A network error or the timeout: there is no status to log.
    console.warn("[account-deletion] google revoke failed", "no response");
  } finally {
    clearTimeout(timer);
  }
}

function billingProvider(billing: DeletionBilling, isComp: (id: string | null) => boolean): string {
  if (billing.provider) return billing.provider;
  // Rows written before the store-billing migration carry no provider: a
  // customer id is either Stripe's or our comp prefix.
  return isComp(billing.customerId) ? "comp" : "stripe";
}

/**
 * Read every row of a query that PostgREST would cap at PAGE_SIZE rows.
 * `fetchPage(from, to)` returns rows from..to (inclusive, like `.range()`);
 * a page shorter than PAGE_SIZE is the last one.
 */
export async function readAllPages<T>(fetchPage: (from: number, to: number) => Promise<T[]>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const page = await fetchPage(from, from + PAGE_SIZE - 1);
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

/** ElevenLabs answers 404 for a conversation that is already gone. Duck-typed: no static SDK import. */
function isNotFoundError(err: unknown): boolean {
  return (err as { statusCode?: unknown } | null)?.statusCode === 404;
}

export async function runAccountDeletion(
  userId: string,
  deps: AccountDeletionDeps,
): Promise<AccountDeletionResult> {
  const warnings: string[] = [];
  let storeSubscription: StoreSubscription = null;

  // a. Billing. Invoices and the Stripe customer are kept on purpose: payment
  // records are retained per the privacy policy (Slovak accounting law).
  const billing = await deps.getBilling(userId);
  if (billing) {
    const provider = billingProvider(billing, deps.isCompCustomerId);
    if (provider === "apple" || provider === "google") {
      if (STORE_LIVE.has(billing.status ?? "")) storeSubscription = provider;
    } else if (provider === "stripe" && billing.subscriptionId && !STRIPE_ENDED.has(billing.status ?? "")) {
      // Throws when the subscription is live and Stripe refused: we must not
      // delete an account that is still being charged by us.
      const outcome = await deps.cancelStripeSubscription(billing.subscriptionId);
      if (outcome === "gone") warnings.push("stripe-subscription-already-ended");
    }
  }

  // b. Assistants. Same order as the assistant DELETE route, per assistant:
  // soft-delete, free the numbers, tear down the agent. Numbers are pooled, so
  // they go back to the pool rather than being released at Twilio.
  const [assistants, numbers] = await Promise.all([
    deps.listAssistants(userId),
    deps.getOwnedNumbers(userId).catch(() => [] as { e164: string }[]),
  ]);
  for (const n of numbers) {
    try {
      await deps.releaseNumber(n.e164);
    } catch {
      warnings.push("number-release");
    }
  }
  for (const a of assistants) {
    await deps.deleteAssistant(a.id);
    await deps.freeAssistantNumbers(a.id);
    try {
      await deps.deleteAssistantAgent(a);
    } catch {
      warnings.push("assistant-agent");
    }
  }
  // Hard-delete the rows themselves (including ones soft-deleted earlier):
  // system prompts and knowledge are account data.
  await deps.purgeAssistants(userId);

  // c. Integrations. Google calendar grants are revoked upstream first, so the
  // app leaves the user's Google account permissions. That is best-effort: a
  // failure is logged, never a stop and never a warning. Microsoft and Cal.com
  // have no simple per-token revoke. Deleting the rows (and the tokens in their
  // config) is what stops us using any of them.
  // Trade-off: Google keeps one grant per Google account and OAuth client, so
  // the revoke also ends the tokens of any other app account that connected
  // the same Google login; its calendar then fails on the next token refresh
  // until it reconnects. Skipping the revoke in that case needs the Google
  // account email, which the connect flow does not store (the scope has no
  // userinfo; the dashboard reads the email live from events.list).
  try {
    await deps.revokeIntegrations(userId);
  } catch (err) {
    console.warn("[account-deletion] google revoke failed", err instanceof Error ? err.message : String(err));
  }
  await deps.deleteIntegrations(userId);

  // d. Organizations.
  await deps.deleteOrganizations(userId);

  // e. Calls. Transcripts, actions, receipts and demand rows cascade from the
  // call row. ElevenLabs keeps the audio and its own transcript per
  // conversation, and the call row holds our only copy of its id. So a list
  // error throws, and every id not deleted here is queued before the rows go:
  // a failed delete, and every id past INLINE_RECORDING_LIMIT. The
  // cancellation-sweep cron retries the queue (sweepQueuedRecordingDeletions).
  // A 404 means the conversation is already gone.
  const conversationIds = await deps.listConversationIds(userId);
  const inline = conversationIds.slice(0, INLINE_RECORDING_LIMIT);
  const toQueue = conversationIds.slice(INLINE_RECORDING_LIMIT);
  for (let i = 0; i < inline.length; i += CONVERSATION_BATCH) {
    const batch = inline.slice(i, i + CONVERSATION_BATCH);
    const results = await Promise.allSettled(batch.map((id) => deps.deleteConversation(id)));
    results.forEach((r, j) => {
      if (r.status === "rejected" && !isNotFoundError(r.reason)) toQueue.push(batch[j]);
    });
  }
  if (toQueue.length > 0) {
    await deps.queueRecordingDeletions(toQueue);
    warnings.push("recordings-scheduled");
  }
  await deps.deleteCalls(userId);

  // f. Sign in with Apple token. Apple requires the revoke (App Review
  // 5.1.1(v)), so a skip is never silent. No stored token for a user with an
  // Apple identity means the SIWA env was unset when they signed in, or they
  // signed in before it was set. The identity read must come before step g.
  // A failed read is a warning too, never a stop. No ids in these log lines.
  try {
    const revoked = await deps.revokeAppleToken(userId);
    if (!revoked && (await deps.hasAppleIdentity(userId))) {
      console.warn("[account-deletion] apple revoke skipped: no stored token");
      warnings.push("apple-token-revocation");
    }
  } catch (err) {
    console.warn("[account-deletion] apple revoke failed", err instanceof Error ? err.message : String(err));
    warnings.push("apple-token-revocation");
  }

  // g. The auth user, last. Cascades account_settings, user_billing,
  // onboarding_profiles, push_devices, account_devices, apple_signin_tokens.
  await deps.deleteAuthUser(userId);

  // h. RevenueCat keeps a subscriber keyed by our user id; drop it. This does
  // not cancel a Play subscription - that is what storeSubscription is for.
  try {
    await deps.deleteRevenueCatSubscriber(userId);
  } catch {
    warnings.push("revenuecat-subscriber");
  }

  // i.
  try {
    deps.revalidate();
  } catch {
    // Cache invalidation is a nicety; the account is already gone.
  }

  return { storeSubscription, warnings };
}

export interface QueuedRecordingDeletion {
  conversationId: string;
  attempts: number;
}

export interface RecordingRetryDeps {
  /** Up to `limit` queued rows that are due, oldest first; throws on a database error. */
  listQueued(limit: number): Promise<QueuedRecordingDeletion[]>;
  deleteConversation(conversationId: string): Promise<void>;
  removeQueued(conversationId: string): Promise<void>;
  /** Saves the new attempt count and a short error, and moves the next try later. */
  markFailed(conversationId: string, attempts: number, lastError: string): Promise<void>;
}

export interface RecordingRetryResult {
  checked: number;
  deleted: number;
  failed: number;
}

/** A short error text for the queue row: the HTTP status when there is one, never a response body. */
function shortError(err: unknown): string {
  const status = (err as { statusCode?: unknown } | null)?.statusCode;
  if (typeof status === "number") return `status ${status}`;
  return (err instanceof Error ? err.message : String(err)).slice(0, 200);
}

/**
 * Retry queued ElevenLabs conversation deletes (the cancellation-sweep cron
 * calls this through sweepQueuedRecordingDeletions). A delete that works, or
 * answers 404, removes the row. Any other failure adds 1 to `attempts`; the
 * failure that reaches MAX_RECORDING_ATTEMPTS logs "gave up" once, and the row
 * stays. Rows at the limit are skipped. Database errors throw.
 */
export async function retryQueuedRecordingDeletions(deps: RecordingRetryDeps): Promise<RecordingRetryResult> {
  const queued = (await deps.listQueued(RECORDING_RETRY_LIMIT)).filter(
    (row) => row.attempts < MAX_RECORDING_ATTEMPTS,
  );
  let deleted = 0;
  let failed = 0;
  for (let i = 0; i < queued.length; i += CONVERSATION_BATCH) {
    await Promise.all(
      queued.slice(i, i + CONVERSATION_BATCH).map(async ({ conversationId, attempts }) => {
        let failure: unknown = null;
        try {
          await deps.deleteConversation(conversationId);
        } catch (err) {
          if (!isNotFoundError(err)) failure = err ?? new Error("unknown error");
        }
        if (failure === null) {
          await deps.removeQueued(conversationId);
          deleted++;
          return;
        }
        failed++;
        await deps.markFailed(conversationId, attempts + 1, shortError(failure));
        if (attempts + 1 >= MAX_RECORDING_ATTEMPTS) {
          console.error("[account-deletion] recording delete gave up", conversationId);
        }
      }),
    );
  }
  return { checked: queued.length, deleted, failed };
}

/** Stripe's error shape, duck-typed so this file has no static Stripe import. */
function stripeErrorCode(err: unknown): { code?: string; status?: number } {
  const e = err as { code?: unknown; statusCode?: unknown } | null;
  return {
    code: typeof e?.code === "string" ? e.code : undefined,
    status: typeof e?.statusCode === "number" ? e.statusCode : undefined,
  };
}

async function realDeps(): Promise<AccountDeletionDeps> {
  // Loaded here rather than at module top so the pure orchestration above can
  // be imported by a node test: these pull in `server-only`, the Supabase
  // service client and the Stripe SDK.
  const [
    { getBilling },
    { isCompCustomerId },
    { getStripe },
    { deleteAssistant, freeAssistantNumbers, getOwnedNumbers, listAssistants },
    { deleteAssistantAgent },
    { releaseNumberFromAgent },
    { elevenClient },
    { serviceClient },
    { createAdminClient },
    { revokeAppleToken },
    { revalidatePath },
  ] = await Promise.all([
    import("@/lib/billing"),
    import("@/lib/comp-accounts"),
    import("@/lib/stripe"),
    import("@/lib/dashboard/db"),
    import("@/lib/call-engine/agent/sync"),
    import("@/lib/call-engine/elevenlabs"),
    import("@/lib/call-engine/agent/eleven-client"),
    import("@/lib/dashboard/supabase"),
    import("@/lib/supabase/admin"),
    import("@/lib/mobile/apple-signin"),
    import("next/cache"),
  ]);

  const sb = () => serviceClient();

  return {
    getBilling: async (userId) => {
      const row = await getBilling(userId);
      if (!row) return null;
      return {
        customerId: row.customerId,
        subscriptionId: row.subscriptionId,
        status: row.status,
        // Read defensively: the field lands with the store-billing migration.
        provider: (row as { provider?: string | null }).provider ?? null,
      };
    },
    isCompCustomerId: (id) => isCompCustomerId(id),

    cancelStripeSubscription: async (subscriptionId) => {
      const stripe = getStripe();
      try {
        await stripe.subscriptions.cancel(subscriptionId);
        return "canceled";
      } catch (err) {
        if (stripeErrorCode(err).code === "resource_missing") return "gone";
        // Anything else: only continue if Stripe itself says the subscription
        // is already over. A live subscription we failed to cancel is fatal.
        const current = await stripe.subscriptions.retrieve(subscriptionId).catch(() => null);
        if (!current || STRIPE_ENDED.has(current.status)) return "gone";
        throw err;
      }
    },

    listAssistants: (userId) => listAssistants(userId),
    getOwnedNumbers: (userId) => getOwnedNumbers(userId),
    releaseNumber: (e164) => releaseNumberFromAgent(e164),
    deleteAssistant: (id) => deleteAssistant(id),
    freeAssistantNumbers: (id) => freeAssistantNumbers(id),
    deleteAssistantAgent: (a) => deleteAssistantAgent(a),
    purgeAssistants: async (userId) => {
      const { error } = await sb().from("assistants").delete().eq("owner_id", userId);
      if (error) throw new Error(error.message);
    },

    revokeIntegrations: async (userId) => {
      const { data, error } = await sb()
        .from("integrations")
        .select("config")
        .eq("owner_id", userId)
        .eq("provider", "google");
      if (error) throw new Error(error.message);
      await Promise.all((data ?? []).map((row) => revokeGoogleGrant(row.config)));
    },
    deleteIntegrations: async (userId) => {
      const { error } = await sb().from("integrations").delete().eq("owner_id", userId);
      if (error) throw new Error(error.message);
    },
    deleteOrganizations: async (userId) => {
      const { error } = await sb().from("organizations").delete().eq("owner_id", userId);
      if (error) throw new Error(error.message);
    },

    listConversationIds: async (userId) => {
      // Pages return raw rows: readAllPages stops on a short page, so nothing
      // may be filtered out before that check.
      const rows = await readAllPages(async (from, to) => {
        const { data, error } = await sb()
          .from("calls")
          .select("elevenlabs_conversation_id")
          .eq("owner_id", userId)
          .not("elevenlabs_conversation_id", "is", null)
          .order("id")
          .range(from, to);
        if (error) throw new Error(error.message);
        return (data ?? []) as { elevenlabs_conversation_id: string | null }[];
      });
      return rows
        .map((r) => r.elevenlabs_conversation_id)
        .filter((id): id is string => Boolean(id));
    },
    deleteConversation: async (conversationId) => {
      await elevenClient().conversationalAi.conversations.delete(conversationId, ELEVEN_DELETE_OPTIONS);
    },
    queueRecordingDeletions: async (conversationIds) => {
      for (let i = 0; i < conversationIds.length; i += PAGE_SIZE) {
        const rows = conversationIds.slice(i, i + PAGE_SIZE).map((id) => ({ conversation_id: id }));
        const { error } = await sb()
          .from("pending_recording_deletions")
          .upsert(rows, { onConflict: "conversation_id", ignoreDuplicates: true });
        if (error) throw new Error(error.message);
      }
    },
    deleteCalls: async (userId) => {
      // Issue reports are keyed by reporter, and their call link only nulls
      // on delete - drop them first so the snapshot in `context` goes too.
      const reports = await sb().from("call_reports").delete().eq("reporter_id", userId);
      if (reports.error) throw new Error(reports.error.message);
      const { error } = await sb().from("calls").delete().eq("owner_id", userId);
      if (error) throw new Error(error.message);
    },

    revokeAppleToken: (userId) => revokeAppleToken(userId),

    hasAppleIdentity: async (userId) => {
      const { data, error } = await createAdminClient().auth.admin.getUserById(userId);
      if (error) {
        // A retry after a run that got past step g: the user is already gone.
        if (error.status === 404 || error.code === "user_not_found") return false;
        throw new Error(error.message);
      }
      return (data.user?.identities ?? []).some((identity) => identity.provider === "apple");
    },

    deleteAuthUser: async (userId) => {
      const { error } = await createAdminClient().auth.admin.deleteUser(userId);
      if (!error) return;
      // A retry after a run that got this far: the user is already gone.
      if (error.status === 404 || error.code === "user_not_found") return;
      throw new Error(error.message);
    },

    deleteRevenueCatSubscriber: async (userId) => {
      const key = process.env.REVENUECAT_SECRET_KEY;
      if (!key) return;
      // The auth user is already gone by now, so a hung connection here would
      // only delay the response until the app gives up and retries a deletion
      // that has in fact completed. An abort falls into the warning path.
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), REVENUECAT_TIMEOUT_MS);
      let res: Response;
      try {
        res = await fetch(
          `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
          { method: "DELETE", signal: abort.signal, headers: { authorization: `Bearer ${key}` } },
        );
      } finally {
        clearTimeout(timer);
      }
      if (res.ok || res.status === 404) return;
      throw new Error(`RevenueCat responded ${res.status}`);
    },

    revalidate: () => revalidatePath("/dashboard", "layout"),
  };
}

/**
 * Delete everything `userId` owns and then the user. Idempotent under retry.
 * Throws only when a blocking step failed (see the file header); the caller
 * answers 500 and the user tries again.
 */
export async function deleteAccountData(userId: string): Promise<AccountDeletionResult> {
  return runAccountDeletion(userId, await realDeps());
}

/**
 * retryQueuedRecordingDeletions with the real Supabase and ElevenLabs clients,
 * for the cancellation-sweep cron. Without ELEVENLABS_API_KEY (local dev) every
 * delete fails, so only `attempts` grows.
 */
export async function sweepQueuedRecordingDeletions(): Promise<RecordingRetryResult> {
  const [{ serviceClient }, { elevenClient }] = await Promise.all([
    import("@/lib/dashboard/supabase"),
    import("@/lib/call-engine/agent/eleven-client"),
  ]);
  const queue = () => serviceClient().from("pending_recording_deletions");
  return retryQueuedRecordingDeletions({
    listQueued: async (limit) => {
      const { data, error } = await queue()
        .select("conversation_id, attempts")
        .lt("attempts", MAX_RECORDING_ATTEMPTS)
        .lte("next_attempt_at", new Date().toISOString())
        .order("created_at")
        .limit(limit);
      if (error) throw new Error(error.message);
      return ((data ?? []) as { conversation_id: string; attempts: number }[]).map((r) => ({
        conversationId: r.conversation_id,
        attempts: r.attempts,
      }));
    },
    deleteConversation: async (conversationId) => {
      await elevenClient().conversationalAi.conversations.delete(conversationId, ELEVEN_DELETE_OPTIONS);
    },
    removeQueued: async (conversationId) => {
      const { error } = await queue().delete().eq("conversation_id", conversationId);
      if (error) throw new Error(error.message);
    },
    markFailed: async (conversationId, attempts, lastError) => {
      const { error } = await queue()
        .update({
          attempts,
          last_error: lastError,
          next_attempt_at: new Date(Date.now() + RECORDING_RETRY_SPACING_MS).toISOString(),
        })
        .eq("conversation_id", conversationId);
      if (error) throw new Error(error.message);
    },
  });
}
