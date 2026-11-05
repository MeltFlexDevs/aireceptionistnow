import test from "node:test";
import assert from "node:assert/strict";

import {
  ELEVEN_DELETE_OPTIONS,
  readAllPages,
  retryQueuedRecordingDeletions,
  revokeGoogleGrant,
  runAccountDeletion,
  type AccountDeletionDeps,
  type DeletionBilling,
  type QueuedRecordingDeletion,
  type RecordingRetryDeps,
} from "./account-deletion";

const USER = "user-1";

interface Fakes {
  deps: AccountDeletionDeps;
  log: string[];
}

function fakes(overrides: Partial<AccountDeletionDeps> = {}, billing: DeletionBilling | null = null): Fakes {
  const log: string[] = [];
  const step =
    <T>(name: string, value?: T) =>
    async () => {
      log.push(name);
      return value as T;
    };
  const deps: AccountDeletionDeps = {
    getBilling: async () => {
      log.push("billing");
      return billing;
    },
    isCompCustomerId: (id) => Boolean(id && id.startsWith("comp:")),
    cancelStripeSubscription: async (id) => {
      log.push(`stripe-cancel:${id}`);
      return "canceled";
    },
    listAssistants: async () => {
      log.push("list-assistants");
      return [{ id: "a1", elevenlabs_agent_id: "agent-1" }];
    },
    getOwnedNumbers: async () => {
      log.push("owned-numbers");
      return [{ e164: "+15550001" }];
    },
    releaseNumber: async (e164) => {
      log.push(`release:${e164}`);
    },
    deleteAssistant: async (id) => {
      log.push(`delete-assistant:${id}`);
    },
    freeAssistantNumbers: async (id) => {
      log.push(`free-numbers:${id}`);
    },
    deleteAssistantAgent: async (a) => {
      log.push(`delete-agent:${a.id}`);
    },
    purgeAssistants: step("purge-assistants"),
    revokeIntegrations: step("revoke-integrations"),
    deleteIntegrations: step("delete-integrations"),
    deleteOrganizations: step("delete-organizations"),
    listConversationIds: async () => {
      log.push("list-conversations");
      return ["conv-1", "conv-2"];
    },
    deleteConversation: async (id) => {
      log.push(`delete-conversation:${id}`);
    },
    queueRecordingDeletions: async (ids) => {
      log.push(`queue-recordings:${ids.join(",")}`);
    },
    deleteCalls: step("delete-calls"),
    revokeAppleToken: async () => {
      log.push("revoke-apple");
      return true;
    },
    hasAppleIdentity: step("apple-identity", false),
    deleteAuthUser: step("delete-auth-user"),
    deleteRevenueCatSubscriber: step("revenuecat"),
    revalidate: () => {
      log.push("revalidate");
    },
    ...overrides,
  };
  return { deps, log };
}

test("runs every step in order and the auth user goes last", async () => {
  const { deps, log } = fakes({}, {
    customerId: "cus_1",
    subscriptionId: "sub_1",
    status: "active",
    provider: "stripe",
  });

  const result = await runAccountDeletion(USER, deps);

  assert.deepEqual(result, { storeSubscription: null, warnings: [] });
  assert.deepEqual(log, [
    "billing",
    "stripe-cancel:sub_1",
    "list-assistants",
    "owned-numbers",
    "release:+15550001",
    "delete-assistant:a1",
    "free-numbers:a1",
    "delete-agent:a1",
    "purge-assistants",
    "revoke-integrations",
    "delete-integrations",
    "delete-organizations",
    "list-conversations",
    "delete-conversation:conv-1",
    "delete-conversation:conv-2",
    "delete-calls",
    "revoke-apple",
    "delete-auth-user",
    "revenuecat",
    "revalidate",
  ]);
  // The auth user must never be deleted before the data that hangs off it.
  assert.ok(log.indexOf("delete-auth-user") > log.indexOf("delete-calls"));
  assert.ok(log.indexOf("delete-auth-user") > log.indexOf("revoke-apple"));
});

test("a live Stripe subscription that will not cancel stops the deletion before any data goes", async () => {
  const { deps, log } = fakes(
    {
      cancelStripeSubscription: async () => {
        throw new Error("stripe down");
      },
    },
    { customerId: "cus_1", subscriptionId: "sub_1", status: "active", provider: "stripe" },
  );

  await assert.rejects(() => runAccountDeletion(USER, deps), /stripe down/);
  assert.deepEqual(log, ["billing"], "nothing after billing may run");
});

test("an already-ended Stripe subscription is a warning, not a stop", async () => {
  const { deps, log } = fakes(
    { cancelStripeSubscription: async () => "gone" },
    { customerId: "cus_1", subscriptionId: "sub_1", status: "past_due", provider: "stripe" },
  );

  const result = await runAccountDeletion(USER, deps);

  assert.deepEqual(result.warnings, ["stripe-subscription-already-ended"]);
  assert.ok(log.includes("delete-auth-user"));
});

test("an ended Stripe row and a comp account are not cancelled again", async () => {
  for (const billing of [
    { customerId: "cus_1", subscriptionId: "sub_1", status: "canceled", provider: "stripe" },
    // Terminal at Stripe too: the webhook stores it raw and Stripe refuses to cancel it.
    { customerId: "cus_1", subscriptionId: "sub_1", status: "incomplete_expired", provider: "stripe" },
    { customerId: "comp:user-1", subscriptionId: null, status: "active" },
  ]) {
    const { deps, log } = fakes({}, billing);
    await runAccountDeletion(USER, deps);
    assert.ok(!log.some((l) => l.startsWith("stripe-cancel")), JSON.stringify(billing));
  }
});

test("a legacy row without provider is treated as Stripe", async () => {
  const { deps, log } = fakes({}, { customerId: "cus_1", subscriptionId: "sub_9", status: "active" });
  await runAccountDeletion(USER, deps);
  assert.ok(log.includes("stripe-cancel:sub_9"));
});

test("a live store subscription is reported, never cancelled here", async () => {
  for (const provider of ["apple", "google"] as const) {
    const { deps, log } = fakes({}, {
      customerId: null,
      subscriptionId: "store-sub",
      status: "active",
      provider,
    });
    const result = await runAccountDeletion(USER, deps);
    assert.equal(result.storeSubscription, provider);
    assert.ok(!log.some((l) => l.startsWith("stripe-cancel")));
    assert.ok(log.includes("delete-auth-user"), "the account is still deleted");
  }
});

test("a paused Play subscription is still reported - it can resume and bill", async () => {
  const { deps } = fakes({}, {
    customerId: null,
    subscriptionId: "store-sub",
    status: "paused",
    provider: "google",
  });
  const result = await runAccountDeletion(USER, deps);
  assert.equal(result.storeSubscription, "google");
});

test("a canceled or expired store subscription is not reported", async () => {
  for (const status of ["canceled", "expired"]) {
    const { deps } = fakes({}, {
      customerId: null,
      subscriptionId: "store-sub",
      status,
      provider: "apple",
    });
    const result = await runAccountDeletion(USER, deps);
    assert.equal(result.storeSubscription, null, status);
  }
});

test("best-effort steps turn into warnings and the run completes", async () => {
  const { deps, log } = fakes({
    releaseNumber: async () => {
      throw new Error("elevenlabs");
    },
    deleteAssistantAgent: async () => {
      throw new Error("elevenlabs");
    },
    deleteConversation: async () => {
      throw new Error("elevenlabs");
    },
    revokeAppleToken: async () => {
      throw new Error("apple");
    },
    deleteRevenueCatSubscriber: async () => {
      throw new Error("revenuecat");
    },
    revalidate: () => {
      throw new Error("no request scope");
    },
  });

  const result = await runAccountDeletion(USER, deps);

  assert.deepEqual(result.warnings, [
    "number-release",
    "assistant-agent",
    "recordings-scheduled",
    "apple-token-revocation",
    "revenuecat-subscriber",
  ]);
  assert.ok(log.includes("delete-auth-user"));
  // The failed recording deletes are queued before the call rows go.
  assert.ok(log.includes("queue-recordings:conv-1,conv-2"));
  assert.ok(log.indexOf("queue-recordings:conv-1,conv-2") < log.indexOf("delete-calls"));
});

test("a blocking data step still throws", async () => {
  const { deps, log } = fakes({
    deleteCalls: async () => {
      throw new Error("db");
    },
  });
  await assert.rejects(() => runAccountDeletion(USER, deps), /db/);
  assert.ok(!log.includes("delete-auth-user"), "the account survives so the user can retry");
});

test("an account with nothing in it deletes cleanly", async () => {
  const { deps } = fakes({
    listAssistants: async () => [],
    getOwnedNumbers: async () => [],
    listConversationIds: async () => [],
    revokeAppleToken: async () => false,
  });
  const result = await runAccountDeletion(USER, deps);
  assert.deepEqual(result, { storeSubscription: null, warnings: [] });
});

test("an Apple sign-in user with no stored token is a logged warning, read before the auth user goes", async (t) => {
  const warns = t.mock.method(console, "warn", () => {});
  const { deps, log } = fakes({
    revokeAppleToken: async () => {
      log.push("revoke-apple");
      return false;
    },
    hasAppleIdentity: async (userId) => {
      log.push(`apple-identity:${userId}`);
      return true;
    },
  });

  const result = await runAccountDeletion(USER, deps);

  assert.deepEqual(result, { storeSubscription: null, warnings: ["apple-token-revocation"] });
  assert.deepEqual(log.slice(log.indexOf("revoke-apple"), log.indexOf("delete-auth-user") + 1), [
    "revoke-apple",
    `apple-identity:${USER}`,
    "delete-auth-user",
  ]);
  assert.deepEqual(
    warns.mock.calls.map((c) => c.arguments),
    [["[account-deletion] apple revoke skipped: no stored token"]],
  );
});

test("no token and no Apple identity is no warning and no log", async (t) => {
  const warns = t.mock.method(console, "warn", () => {});
  const { deps, log } = fakes({
    revokeAppleToken: async () => {
      log.push("revoke-apple");
      return false;
    },
  });

  const result = await runAccountDeletion(USER, deps);

  assert.deepEqual(result.warnings, []);
  assert.deepEqual(log.slice(log.indexOf("revoke-apple"), log.indexOf("delete-auth-user") + 1), [
    "revoke-apple",
    "apple-identity",
    "delete-auth-user",
  ]);
  assert.equal(warns.mock.callCount(), 0);
});

test("a failed Apple identity read is a logged warning, not a stop", async (t) => {
  const warns = t.mock.method(console, "warn", () => {});
  const { deps, log } = fakes({
    revokeAppleToken: async () => false,
    hasAppleIdentity: async () => {
      throw new Error("auth admin down");
    },
  });

  const result = await runAccountDeletion(USER, deps);

  assert.deepEqual(result.warnings, ["apple-token-revocation"]);
  assert.ok(log.includes("delete-auth-user"));
  assert.deepEqual(
    warns.mock.calls.map((c) => c.arguments),
    [["[account-deletion] apple revoke failed", "auth admin down"]],
  );
});

test("a failed conversation list stops the deletion before the call rows go", async () => {
  const { deps, log } = fakes({
    listConversationIds: async () => {
      throw new Error("db");
    },
  });
  await assert.rejects(() => runAccountDeletion(USER, deps), /db/);
  assert.ok(!log.includes("delete-calls"), "the call rows hold the only copy of the ids");
  assert.ok(!log.includes("delete-auth-user"));
});

test("only the conversations that failed to delete are queued, before the call rows go", async () => {
  const { deps, log } = fakes({
    listConversationIds: async () => ["conv-1", "conv-2", "conv-3"],
    deleteConversation: async (id) => {
      if (id !== "conv-2") throw new Error("elevenlabs");
    },
  });

  const result = await runAccountDeletion(USER, deps);

  assert.deepEqual(result.warnings, ["recordings-scheduled"]);
  assert.deepEqual(
    log.filter((l) => l.startsWith("queue-recordings")),
    ["queue-recordings:conv-1,conv-3"],
  );
  assert.ok(log.indexOf("queue-recordings:conv-1,conv-3") < log.indexOf("delete-calls"));
  assert.ok(log.includes("delete-auth-user"));
});

test("a conversation ElevenLabs no longer has (404) counts as deleted", async () => {
  const { deps, log } = fakes({
    deleteConversation: async () => {
      throw Object.assign(new Error("not found"), { statusCode: 404 });
    },
  });

  const result = await runAccountDeletion(USER, deps);

  assert.deepEqual(result.warnings, []);
  assert.ok(!log.some((l) => l.startsWith("queue-recordings")));
  assert.ok(log.includes("delete-calls"));
});

test("a failed queue write stops the deletion before the call rows go", async () => {
  const { deps, log } = fakes({
    deleteConversation: async () => {
      throw new Error("elevenlabs");
    },
    queueRecordingDeletions: async () => {
      throw new Error("queue db");
    },
  });
  await assert.rejects(() => runAccountDeletion(USER, deps), /queue db/);
  assert.ok(!log.includes("delete-calls"));
  assert.ok(!log.includes("delete-auth-user"));
});

test("past the inline cap the other conversations are queued, not deleted inline", async () => {
  const ids = Array.from({ length: 1003 }, (_, i) => `conv-${i}`);
  const { deps, log } = fakes({ listConversationIds: async () => ids });

  const result = await runAccountDeletion(USER, deps);

  assert.equal(log.filter((l) => l.startsWith("delete-conversation:")).length, 1000);
  assert.ok(!log.includes("delete-conversation:conv-1000"));
  assert.deepEqual(
    log.filter((l) => l.startsWith("queue-recordings")),
    ["queue-recordings:conv-1000,conv-1001,conv-1002"],
  );
  assert.deepEqual(result.warnings, ["recordings-scheduled"]);
});

test("readAllPages reads pages until a short one", async () => {
  const ranges: [number, number][] = [];
  const sizes = [1000, 1000, 3];
  const rows = await readAllPages(async (from, to) => {
    ranges.push([from, to]);
    return Array.from({ length: sizes[ranges.length - 1] }, (_, i) => from + i);
  });
  assert.equal(rows.length, 2003);
  assert.equal(rows[2002], 2002);
  assert.deepEqual(ranges, [
    [0, 999],
    [1000, 1999],
    [2000, 2999],
  ]);
});

function retryFakes(queued: QueuedRecordingDeletion[], fail: Record<string, unknown> = {}) {
  const log: string[] = [];
  const deps: RecordingRetryDeps = {
    listQueued: async (limit) => {
      log.push(`list:${limit}`);
      return queued;
    },
    deleteConversation: async (id) => {
      log.push(`delete:${id}`);
      if (id in fail) throw fail[id];
    },
    removeQueued: async (id) => {
      log.push(`removed:${id}`);
    },
    markFailed: async (id, attempts, lastError) => {
      log.push(`failed:${id}:${attempts}:${lastError}`);
    },
  };
  return { deps, log };
}

test("a queued delete that works, or finds the conversation gone, removes the row", async () => {
  const { deps, log } = retryFakes(
    [
      { conversationId: "conv-1", attempts: 0 },
      { conversationId: "conv-2", attempts: 3 },
    ],
    { "conv-2": Object.assign(new Error("not found"), { statusCode: 404 }) },
  );

  const result = await retryQueuedRecordingDeletions(deps);

  assert.deepEqual(result, { checked: 2, deleted: 2, failed: 0 });
  assert.equal(log[0], "list:100");
  assert.ok(log.includes("removed:conv-1"));
  assert.ok(log.includes("removed:conv-2"));
});

test("a failed queued delete adds 1 to attempts, and a row at 10 attempts is skipped", async (t) => {
  const errors = t.mock.method(console, "error", () => {});
  const { deps, log } = retryFakes(
    [
      { conversationId: "conv-1", attempts: 2 },
      { conversationId: "conv-old", attempts: 10 },
    ],
    { "conv-1": Object.assign(new Error("Service Unavailable"), { statusCode: 503 }) },
  );

  const result = await retryQueuedRecordingDeletions(deps);

  assert.deepEqual(result, { checked: 1, deleted: 0, failed: 1 });
  assert.ok(log.includes("failed:conv-1:3:status 503"));
  assert.ok(!log.some((l) => l.includes("conv-old")), "a row that gave up is not tried again");
  assert.equal(errors.mock.callCount(), 0);
});

test("the tenth failed try logs that the delete gave up, with the id only", async (t) => {
  const errors = t.mock.method(console, "error", () => {});
  const { deps, log } = retryFakes([{ conversationId: "conv-1", attempts: 9 }], {
    "conv-1": new Error("timeout"),
  });

  await retryQueuedRecordingDeletions(deps);

  assert.ok(log.includes("failed:conv-1:10:timeout"));
  assert.equal(errors.mock.callCount(), 1);
  assert.deepEqual(errors.mock.calls[0].arguments, ["[account-deletion] recording delete gave up", "conv-1"]);
});

test("a failed Google revoke is logged and the deletion still finishes", async (t) => {
  const warns = t.mock.method(console, "warn", () => {});
  const { deps, log } = fakes({
    revokeIntegrations: async () => {
      log.push("revoke-integrations");
      throw new Error("db");
    },
  });

  const result = await runAccountDeletion(USER, deps);

  assert.deepEqual(result, { storeSubscription: null, warnings: [] });
  assert.ok(log.indexOf("revoke-integrations") < log.indexOf("delete-integrations"));
  assert.ok(log.includes("delete-auth-user"));
  assert.deepEqual(warns.mock.calls.map((c) => c.arguments), [["[account-deletion] google revoke failed", "db"]]);
});

test("revokeGoogleGrant posts the refresh token as a form body to Google's revoke URL", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return new Response(null, { status: 200 });
  }) as typeof fetch;

  await revokeGoogleGrant({ access_token: "at-1", refresh_token: "rt-1" }, fetchImpl);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://oauth2.googleapis.com/revoke");
  assert.equal(calls[0].init?.method, "POST");
  assert.deepEqual(calls[0].init?.headers, { "Content-Type": "application/x-www-form-urlencoded" });
  assert.equal(calls[0].init?.body, "token=rt-1");
  assert.ok(calls[0].init?.signal instanceof AbortSignal, "the call has a timeout");
});

test("revokeGoogleGrant falls back to the access token and skips a row without tokens", async () => {
  const bodies: unknown[] = [];
  const fetchImpl = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    bodies.push(init?.body);
    return new Response(null, { status: 200 });
  }) as typeof fetch;

  await revokeGoogleGrant({ access_token: "at-1" }, fetchImpl);
  await revokeGoogleGrant({ access_token: "", refresh_token: null }, fetchImpl);
  await revokeGoogleGrant(null, fetchImpl);

  assert.deepEqual(bodies, ["token=at-1"]);
});

test("revokeGoogleGrant does not throw on a 400 or a network error, and logs no token", async (t) => {
  const warns = t.mock.method(console, "warn", () => {});
  const rejected = (async () => new Response('{"error":"invalid_token"}', { status: 400 })) as typeof fetch;
  const offline = (async () => {
    throw new TypeError("fetch failed");
  }) as typeof fetch;

  await revokeGoogleGrant({ refresh_token: "rt-secret" }, rejected);
  await revokeGoogleGrant({ refresh_token: "rt-secret" }, offline);

  const logged = warns.mock.calls.map((c) => c.arguments);
  assert.deepEqual(logged, [
    ["[account-deletion] google revoke failed", 400],
    ["[account-deletion] google revoke failed", "no response"],
  ]);
  assert.ok(!JSON.stringify(logged).includes("rt-secret"));
});

test("ElevenLabs deletes use a short timeout and no SDK retries", () => {
  assert.deepEqual(ELEVEN_DELETE_OPTIONS, { timeoutInSeconds: 10, maxRetries: 0 });
});
