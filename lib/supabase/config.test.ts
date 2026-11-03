import test, { afterEach } from "node:test";
import assert from "node:assert/strict";

import { authConfigured, authOff } from "./config";

// Same env stub as lib/dashboard/ownership.test.ts.
const KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NODE_ENV",
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

const AUTH = { NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon" };

test("auth off: no public Supabase env during local development", () => {
  stub({ NODE_ENV: "development" });
  assert.equal(authOff(), true);
  assert.equal(authConfigured(), false);
});

test("no public Supabase env outside development is a broken deploy, not auth off (prod-web-03)", () => {
  for (const nodeEnv of ["production", "test", undefined]) {
    stub(nodeEnv ? { NODE_ENV: nodeEnv } : {});
    assert.equal(authOff(), false, String(nodeEnv));
    assert.equal(authConfigured(), true, String(nodeEnv));
  }
});

test("with the public Supabase env, sign-in is enforced in every mode", () => {
  for (const nodeEnv of ["development", "production"]) {
    stub({ ...AUTH, NODE_ENV: nodeEnv });
    assert.equal(authOff(), false, nodeEnv);
    assert.equal(authConfigured(), true, nodeEnv);
  }
});
