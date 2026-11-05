import test from "node:test";
import assert from "node:assert/strict";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  MIN_MISS_MS,
  REVIEW_SAMPLE_CALLS,
  isReviewEmail,
  normalizeCode,
  normalizeEmail,
  reviewCredentials,
  reviewCredentialsMatch,
  reviewLogin,
  safeEqual,
  seedReviewAccount,
} from "./review-login";

const expected = { email: "review@example.com", code: "123456" };

test("normalizeEmail trims and lowercases, and rejects non-strings", () => {
  assert.equal(normalizeEmail("  Review@Example.COM "), "review@example.com");
  assert.equal(normalizeEmail(42), "");
  assert.equal(normalizeEmail(undefined), "");
});

test("normalizeCode trims but keeps case", () => {
  assert.equal(normalizeCode(" 123456 "), "123456");
  assert.equal(normalizeCode("AbC"), "AbC");
  assert.equal(normalizeCode(null), "");
});

test("safeEqual compares values of different lengths without throwing", () => {
  assert.equal(safeEqual("abc", "abc"), true);
  assert.equal(safeEqual("abc", "abcd"), false);
  assert.equal(safeEqual("", "x"), false);
});

test("isReviewEmail ignores case and whitespace, and never matches empty", () => {
  assert.equal(isReviewEmail(" REVIEW@example.com ", expected), true);
  assert.equal(isReviewEmail("someone@example.com", expected), false);
  assert.equal(isReviewEmail("", expected), false);
  assert.equal(isReviewEmail(undefined, expected), false);
});

test("reviewCredentialsMatch needs both the email and the code", () => {
  assert.equal(reviewCredentialsMatch({ email: "review@example.com", code: "123456" }, expected), true);
  assert.equal(reviewCredentialsMatch({ email: "Review@Example.com", code: " 123456 " }, expected), true);
  assert.equal(reviewCredentialsMatch({ email: "review@example.com", code: "654321" }, expected), false);
  assert.equal(reviewCredentialsMatch({ email: "other@example.com", code: "123456" }, expected), false);
  assert.equal(reviewCredentialsMatch({ email: "review@example.com", code: "" }, expected), false);
  assert.equal(reviewCredentialsMatch({ email: "review@example.com", code: 123456 }, expected), false);
});

test("reviewCredentials is null unless both env vars are set", () => {
  const saved = { email: process.env.APP_REVIEW_EMAIL, code: process.env.APP_REVIEW_CODE };
  try {
    delete process.env.APP_REVIEW_EMAIL;
    delete process.env.APP_REVIEW_CODE;
    assert.equal(reviewCredentials(), null);

    process.env.APP_REVIEW_EMAIL = "Review@Example.com";
    assert.equal(reviewCredentials(), null, "code missing");

    process.env.APP_REVIEW_CODE = " 123456 ";
    assert.deepEqual(reviewCredentials(), { email: "review@example.com", code: "123456" });
  } finally {
    if (saved.email === undefined) delete process.env.APP_REVIEW_EMAIL;
    else process.env.APP_REVIEW_EMAIL = saved.email;
    if (saved.code === undefined) delete process.env.APP_REVIEW_CODE;
    else process.env.APP_REVIEW_CODE = saved.code;
  }
});

test("reviewCredentials rejects a code that is not exactly 6 digits and never logs it", (t) => {
  const saved = { email: process.env.APP_REVIEW_EMAIL, code: process.env.APP_REVIEW_CODE };
  const logged = t.mock.method(console, "error", () => {});
  try {
    process.env.APP_REVIEW_EMAIL = "review@example.com";
    for (const bad of ["12345", "1234567", "12a456", "12 3456", "abcdef"]) {
      process.env.APP_REVIEW_CODE = bad;
      assert.equal(reviewCredentials(), null, bad);
    }
    assert.equal(logged.mock.callCount(), 5);
    for (const call of logged.mock.calls) {
      assert.deepEqual(call.arguments, ["[review-login] APP_REVIEW_CODE must be exactly 6 digits"]);
    }

    process.env.APP_REVIEW_CODE = "654321";
    assert.deepEqual(reviewCredentials(), { email: "review@example.com", code: "654321" });
    assert.equal(logged.mock.callCount(), 5);
  } finally {
    if (saved.email === undefined) delete process.env.APP_REVIEW_EMAIL;
    else process.env.APP_REVIEW_EMAIL = saved.email;
    if (saved.code === undefined) delete process.env.APP_REVIEW_CODE;
    else process.env.APP_REVIEW_CODE = saved.code;
  }
});

test("reviewLogin answers 404, not 429, on the 21st attempt in an hour", async () => {
  const keys = ["APP_REVIEW_EMAIL", "APP_REVIEW_CODE", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;
  const saved = keys.map((key) => process.env[key]);
  const realFetch = globalThis.fetch;
  const methods: string[] = [];
  process.env.APP_REVIEW_EMAIL = "review@example.com";
  process.env.APP_REVIEW_CODE = "123456";
  process.env.SUPABASE_URL = "http://supabase.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
  // recordAttempt inserts this attempt, then counts the last hour: 21 rows
  // means 20 attempts before this one.
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = init?.method ?? "GET";
    methods.push(method);
    if (method === "POST") return Response.json({ id: 21 }, { status: 201 });
    if (method === "HEAD") return new Response(null, { status: 200, headers: { "content-range": "*/21" } });
    throw new Error(`unexpected fetch ${method} ${String(input)}`);
  }) as typeof fetch;
  try {
    // The right code on purpose: a spent budget must look like any miss.
    assert.deepEqual(await reviewLogin({ email: "review@example.com", code: "123456" }), { status: 404 });
    assert.deepEqual(methods, ["POST", "HEAD"], "stops after the count, before any sign-in call");
  } finally {
    globalThis.fetch = realFetch;
    keys.forEach((key, i) => {
      const value = saved[i];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
});

test("reviewLogin waits until MIN_MISS_MS before a 404 for another email", async () => {
  const saved = { email: process.env.APP_REVIEW_EMAIL, code: process.env.APP_REVIEW_CODE };
  try {
    process.env.APP_REVIEW_EMAIL = "review@example.com";
    process.env.APP_REVIEW_CODE = "123456";
    const waits: number[] = [];
    const clock = {
      now: () => 1000,
      sleep: async (ms: number) => {
        waits.push(ms);
      },
    };
    const result = await reviewLogin({ email: "someone@example.com", code: "123456" }, clock);
    assert.deepEqual(result, { status: 404 });
    assert.deepEqual(waits, [MIN_MISS_MS]);
  } finally {
    if (saved.email === undefined) delete process.env.APP_REVIEW_EMAIL;
    else process.env.APP_REVIEW_EMAIL = saved.email;
    if (saved.code === undefined) delete process.env.APP_REVIEW_CODE;
    else process.env.APP_REVIEW_CODE = saved.code;
  }
});

test("reviewLogin only waits for the rest of the floor, and not at all once it has passed", async () => {
  const saved = { email: process.env.APP_REVIEW_EMAIL, code: process.env.APP_REVIEW_CODE };
  const makeClock = (elapsed: number) => {
    const waits: number[] = [];
    let calls = 0;
    const clock = {
      now: () => (calls++ === 0 ? 1000 : 1000 + elapsed),
      sleep: async (ms: number) => {
        waits.push(ms);
      },
    };
    return { clock, waits };
  };
  try {
    process.env.APP_REVIEW_EMAIL = "review@example.com";
    process.env.APP_REVIEW_CODE = "123456";
    const first = makeClock(120);
    await reviewLogin({ email: "someone@example.com", code: "123456" }, first.clock);
    assert.deepEqual(first.waits, [MIN_MISS_MS - 120]);

    const second = makeClock(MIN_MISS_MS + 1);
    await reviewLogin({ email: "someone@example.com", code: "123456" }, second.clock);
    assert.deepEqual(second.waits, []);
  } finally {
    if (saved.email === undefined) delete process.env.APP_REVIEW_EMAIL;
    else process.env.APP_REVIEW_EMAIL = saved.email;
    if (saved.code === undefined) delete process.env.APP_REVIEW_CODE;
    else process.env.APP_REVIEW_CODE = saved.code;
  }
});

type Row = Record<string, unknown>;

/** In-memory stand-in for the service-role client: only what seedReviewAccount calls. */
function fakeAdmin(users: { id: string; email: string }[] = []) {
  const tables: Record<string, Row[]> = {
    organizations: [],
    assistants: [],
    account_settings: [],
    onboarding_profiles: [],
    calls: [],
    call_turns: [],
  };
  const billing: Row[] = [];
  const rpcCalls: string[] = [];
  let next = 0;
  const newId = () => `id-${++next}`;

  function from(table: string) {
    const rows = tables[table];
    if (!rows) throw new Error(`unexpected table ${table}`);
    const filters: [string, unknown][] = [];
    let limit = Infinity;
    let written: Row[] | null = null;
    const result = () => ({
      data: written ?? rows.filter((row) => filters.every(([key, value]) => (row[key] ?? null) === value)).slice(0, limit),
      error: null,
    });
    const builder = {
      select: () => builder,
      order: () => builder,
      eq: (key: string, value: unknown) => {
        filters.push([key, value]);
        return builder;
      },
      is: (key: string, value: unknown) => {
        filters.push([key, value]);
        return builder;
      },
      limit: (count: number) => {
        limit = count;
        return builder;
      },
      insert: (input: Row | Row[]) => {
        written = (Array.isArray(input) ? input : [input]).map((row) => ({ id: newId(), ...row }));
        rows.push(...written);
        return builder;
      },
      upsert: (row: Row, options: { onConflict: string }) => {
        const index = rows.findIndex((existing) => existing[options.onConflict] === row[options.onConflict]);
        if (index >= 0) rows[index] = { ...rows[index], ...row };
        else rows.push({ ...row });
        written = [];
        return builder;
      },
      single: async () => ({ data: written?.[0] ?? null, error: null }),
      then: (resolve: (value: { data: Row[]; error: null }) => unknown) => Promise.resolve(result()).then(resolve),
    };
    return builder;
  }

  const auth = {
    admin: {
      listUsers: async ({ page, perPage }: { page: number; perPage: number }) => ({
        data: { users: users.slice((page - 1) * perPage, page * perPage) },
        error: null,
      }),
      createUser: async ({ email }: { email: string }) => {
        const user = { id: newId(), email };
        users.push(user);
        return { data: { user }, error: null };
      },
    },
  };

  async function rpc(name: string, params: Row) {
    rpcCalls.push(name);
    if (name === "get_billing") {
      return { data: billing.filter((row) => row.user_id === params.p_user), error: null };
    }
    if (name === "set_subscription") {
      const row: Row = {
        user_id: params.p_user,
        stripe_customer_id: params.p_customer,
        plan: params.p_plan,
        status: params.p_status,
        current_period_end: params.p_current_period_end,
      };
      const index = billing.findIndex((existing) => existing.user_id === params.p_user);
      if (index >= 0) billing[index] = row;
      else billing.push(row);
      return { data: null, error: null };
    }
    throw new Error(`unexpected rpc ${name}`);
  }

  const client = { from, auth, rpc } as unknown as SupabaseClient;
  return { client, tables, users, billing, rpcCalls };
}

test("seedReviewAccount fills an empty account with a receptionist, a plan and sample calls", async () => {
  const fake = fakeAdmin();
  const now = new Date("2026-11-04T10:00:00Z");
  const turnCount = REVIEW_SAMPLE_CALLS.reduce((sum, call) => sum + call.turns.length, 0);

  const result = await seedReviewAccount(fake.client, " Review@Example.com ", now);

  assert.deepEqual(result, {
    userCreated: true,
    organizationCreated: true,
    assistantCreated: true,
    subscriptionSet: true,
    callsInserted: REVIEW_SAMPLE_CALLS.length,
    turnsInserted: turnCount,
  });
  assert.ok(REVIEW_SAMPLE_CALLS.length >= 3 && REVIEW_SAMPLE_CALLS.length <= 5);

  const [user] = fake.users;
  const [org] = fake.tables.organizations;
  const [assistant] = fake.tables.assistants;
  const [profile] = fake.tables.onboarding_profiles;
  const [plan] = fake.billing;
  assert.ok(user && org && assistant && profile && plan);
  assert.equal(fake.users.length, 1);
  assert.equal(user.email, "review@example.com");
  assert.equal(org.owner_id, user.id);
  assert.equal(assistant.owner_id, user.id);
  assert.equal(assistant.organization_id, org.id);
  assert.equal(assistant.elevenlabs_agent_id, undefined);
  assert.equal(profile.user_id, user.id);
  assert.equal(profile.status, "done");
  assert.deepEqual(profile.result, { orgId: org.id, assistantId: assistant.id });
  assert.equal(fake.tables.account_settings[0]?.user_id, user.id);
  assert.equal(plan.user_id, user.id);
  assert.equal(plan.stripe_customer_id, `comp:${user.id}`);
  assert.equal(plan.plan, "solo");
  assert.equal(plan.status, "active");

  const calls = fake.tables.calls;
  assert.equal(calls.length, REVIEW_SAMPLE_CALLS.length);
  for (const call of calls) {
    assert.equal(call.owner_id, user.id);
    assert.equal(call.assistant_id, assistant.id);
    assert.equal(call.status, "completed");
    assert.ok(Number(call.duration_seconds) > 0);
    assert.ok(Date.parse(String(call.started_at)) < now.getTime());
    assert.equal(call.twilio_call_sid, undefined);
    assert.equal(call.elevenlabs_conversation_id, undefined);
  }
  const callIds = new Set(calls.map((call) => call.id));
  assert.equal(fake.tables.call_turns.length, turnCount);
  for (const turn of fake.tables.call_turns) {
    assert.ok(callIds.has(turn.call_id));
    assert.ok(turn.role === "caller" || turn.role === "assistant");
  }
});

test("seedReviewAccount adds nothing on a second run", async () => {
  const fake = fakeAdmin();
  await seedReviewAccount(fake.client, "review@example.com");
  const counts = () => Object.fromEntries(Object.entries(fake.tables).map(([name, rows]) => [name, rows.length]));
  const before = counts();

  const second = await seedReviewAccount(fake.client, "review@example.com");

  assert.deepEqual(second, {
    userCreated: false,
    organizationCreated: false,
    assistantCreated: false,
    subscriptionSet: false,
    callsInserted: 0,
    turnsInserted: 0,
  });
  assert.deepEqual(counts(), before);
  assert.equal(fake.users.length, 1);
  assert.equal(fake.rpcCalls.filter((name) => name === "set_subscription").length, 1);
});

test("seedReviewAccount finds the user on a later page and keeps an active plan", async () => {
  const others = Array.from({ length: 1000 }, (_, i) => ({ id: `other-${i}`, email: `user${i}@example.com` }));
  const fake = fakeAdmin([...others, { id: "user-1", email: "Review@Example.com" }]);
  const plan = { user_id: "user-1", plan: "solo", status: "active", stripe_customer_id: "cus_test" };
  fake.billing.push({ ...plan });

  const result = await seedReviewAccount(fake.client, "review@example.com");

  assert.equal(result.userCreated, false);
  assert.equal(result.subscriptionSet, false);
  assert.equal(fake.users.length, 1001);
  assert.equal(fake.tables.organizations[0]?.owner_id, "user-1");
  assert.deepEqual(fake.billing, [plan]);
  assert.deepEqual(fake.rpcCalls, ["get_billing"]);
});
