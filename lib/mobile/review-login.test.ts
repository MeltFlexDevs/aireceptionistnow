import test from "node:test";
import assert from "node:assert/strict";

import {
  MIN_MISS_MS,
  isReviewEmail,
  normalizeCode,
  normalizeEmail,
  reviewCredentials,
  reviewCredentialsMatch,
  reviewLogin,
  safeEqual,
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
