import type { ElevenLabs } from "@elevenlabs/elevenlabs-js";
import { elevenClient } from "./eleven-client";
import { findAgentPhoneNumberId, importTwilioNumber } from "../elevenlabs";
import {
  listNumbersMissingElevenLabsId,
  setNumberElevenLabsId,
} from "../../dashboard/db";

// One-time workspace wiring for the ElevenLabs Conversational AI integration.
// Agents are per-assistant (see sync.ts), but two settings are workspace-global:
//   • the conversation-initiation client-data webhook - lets every call fetch our
//     per-caller greeting/language/voice overrides from /api/agent/init.
//   • the post-call webhook - where transcripts are delivered after each call.
// This applies both from code so setup is a single API call, not dashboard
// clicking. Idempotent: re-running just re-asserts the same settings.

export interface WorkspaceSetupResult {
  conversationInitiationWebhook: string;
  postCallWebhookId: string | null;
}

/** Point the workspace's conversation-init webhook at our /api/agent/init, and
 *  (if ELEVENLABS_POST_CALL_WEBHOOK_ID is set) wire the post-call transcript
 *  webhook. Auth differs per webhook: the post-call webhook is HMAC-signed by
 *  ElevenLabs (ELEVENLABS_WEBHOOK_SECRET), but the conversation-init webhook is
 *  NOT signed - it's secured by the custom request header we attach here, the
 *  same shared secret the tool webhooks present (AGENT_WEBHOOK_SECRET). */
export async function configureWorkspaceWebhooks(): Promise<WorkspaceSetupResult> {
  const base = (process.env.APP_BASE_URL ?? "").replace(/\/$/, "");
  if (!base) throw new Error("APP_BASE_URL is not set.");
  const secret = process.env.AGENT_WEBHOOK_SECRET;
  if (!secret) throw new Error("AGENT_WEBHOOK_SECRET is not set.");
  const initUrl = `${base}/api/agent/init`;

  const request: ElevenLabs.conversationalAi.PatchConvAiSettingsRequest = {
    conversationInitiationClientDataWebhook: {
      url: initUrl,
      requestHeaders: { "x-agent-secret": secret },
    },
  };

  // Post-call webhooks are referenced by a workspace webhook id (create the
  // webhook object once in the ElevenLabs dashboard, then set its id here).
  const postCallId = process.env.ELEVENLABS_POST_CALL_WEBHOOK_ID;
  if (postCallId) {
    request.webhooks = { postCallWebhookId: postCallId, events: ["transcript"] };
  }

  await elevenClient().conversationalAi.settings.update(request);
  return { conversationInitiationWebhook: initUrl, postCallWebhookId: postCallId ?? null };
}

// Wiring the init webhook was a manual, once-after-deploy curl to
// /api/agent/setup - and if it was never run (or APP_BASE_URL later changed),
// EVERY caller silently got the agent's English default greeting instead of one
// in their own language. Nothing surfaced it: the feature just quietly did
// nothing, because ElevenLabs had no URL to call. So assistant sync now asserts
// it too, and the greeting localization can't be left unplugged.
let ensured: Promise<void> | null = null;

/**
 * Best-effort: make sure ElevenLabs points its conversation-init webhook at THIS
 * deployment, so /api/agent/init can translate the greeting per caller.
 *
 * Only ever fills in a MISSING url - it never repoints one that's already set.
 * The setting is workspace-global while deployments are not: a preview build
 * auto-repointing it would hijack production's calls. A mismatch is loud instead,
 * and /api/agent/setup remains the explicit way to take ownership.
 *
 * Memoized per warm instance; a failure clears the memo so the next sync retries.
 */
export function ensureInitWebhook(): Promise<void> {
  ensured ??= wireInitWebhookOnce().catch((err) => {
    console.warn("[workspace] could not verify the conversation-init webhook", err);
    ensured = null;
  });
  return ensured;
}

async function wireInitWebhookOnce(): Promise<void> {
  const base = (process.env.APP_BASE_URL ?? "").replace(/\/$/, "");
  const secret = process.env.AGENT_WEBHOOK_SECRET;
  // Nothing to point at / no way to authenticate it. /api/agent/setup reports
  // this properly; a sync shouldn't fail over it.
  if (!base || !secret) return;
  const want = `${base}/api/agent/init`;

  const settings = (await elevenClient().conversationalAi.settings.get()) as unknown as {
    conversationInitiationClientDataWebhook?: { url?: string };
  };
  const current = settings.conversationInitiationClientDataWebhook?.url ?? "";
  if (current === want) return;

  if (current) {
    console.warn(
      `[workspace] conversation-init webhook points at ${current}, not ${want} - leaving it. ` +
        `Callers get this deployment's default greeting, not one in their language. ` +
        `POST /api/agent/setup from the deployment that should own it.`,
    );
    return;
  }

  await elevenClient().conversationalAi.settings.update({
    conversationInitiationClientDataWebhook: {
      url: want,
      requestHeaders: { "x-agent-secret": secret },
    },
  });
  console.log(`[workspace] conversation-init webhook was unset - wired it to ${want}`);
}

/**
 * Import every DB pool number that isn't in ElevenLabs yet and backfill its
 * ElevenLabs phone-number id. Numbers are imported UNASSIGNED (no inbound agent)
 * - they stay free for assistants to claim, and outbound demo calls address them
 * by id with an explicit agent. Idempotent: already-imported numbers are matched
 * by a lookup instead of re-imported, and each success is persisted immediately,
 * so a re-run only touches what's still missing. Best-effort per number.
 */
export async function importPoolNumbersToElevenLabs(): Promise<{
  imported: number;
  failed: number;
}> {
  const rows = await listNumbersMissingElevenLabsId();
  let imported = 0;
  let failed = 0;
  for (const row of rows) {
    try {
      const id =
        (await findAgentPhoneNumberId(row.e164)) ??
        (await importTwilioNumber(row.e164));
      if (!id) throw new Error("ElevenLabs returned no phone_number_id");
      await setNumberElevenLabsId(row.id, id);
      imported++;
    } catch (err) {
      failed++;
      console.error("[agent/setup] number import failed", row.e164, err);
    }
  }
  return { imported, failed };
}
