import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";

import { updateSession } from "./proxy";

// Same env stub as lib/dashboard/ownership.test.ts.
const KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NODE_ENV",
  "DEV_DASHBOARD",
] as const;
const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
const env = process.env as Record<string, string | undefined>;

function stub(vars: Partial<Record<(typeof KEYS)[number], string>>): void {
  for (const k of KEYS) delete env[k];
  Object.assign(env, vars);
}

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete env[k];
    else env[k] = saved[k];
  }
});

const dashboardRequest = () => new NextRequest("https://aireceptionistnow.com/dashboard");

test("no public Supabase env in production: /dashboard answers 503 and never opens (prod-web-03)", async () => {
  stub({ NODE_ENV: "production" });
  const res = await updateSession(dashboardRequest());
  assert.equal(res.status, 503);
  assert.equal(res.headers.get("x-middleware-next"), null);
});

test("no public Supabase env in local development: auth-off mode lets the request through", async () => {
  stub({ NODE_ENV: "development" });
  const res = await updateSession(dashboardRequest());
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("x-middleware-next"), "1");
});
