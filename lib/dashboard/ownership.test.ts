import test, { afterEach } from "node:test";
import assert from "node:assert/strict";

import { isOwnedBy } from "./ownership";

// authConfigured() / devDashboardBypass() read the environment on every call,
// so each case stubs exactly the variables they look at and restores them.
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

const AUTH = { NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon" };

test("auth on: only the named owner matches", () => {
  stub({ ...AUTH, NODE_ENV: "production" });
  assert.equal(isOwnedBy("u1", "u1"), true);
  assert.equal(isOwnedBy("u1", "u2"), false);
});

test("auth on: a row with no owner belongs to nobody (SEC-1)", () => {
  stub({ ...AUTH, NODE_ENV: "production" });
  assert.equal(isOwnedBy(null, "u1"), false);
  assert.equal(isOwnedBy(undefined, "u1"), false);
  assert.equal(isOwnedBy("", "u1"), false);
});

test("auth on: no signed-in user owns anything, not even a null-owner row", () => {
  stub({ ...AUTH, NODE_ENV: "production" });
  assert.equal(isOwnedBy("u1", null), false);
  assert.equal(isOwnedBy(null, null), false);
  assert.equal(isOwnedBy(undefined, undefined), false);
});

test("DEV_DASHBOARD=1 is inert outside development", () => {
  stub({ ...AUTH, NODE_ENV: "production", DEV_DASHBOARD: "1" });
  assert.equal(isOwnedBy(null, "u1"), false);
  assert.equal(isOwnedBy("u1", null), false);
});

test("auth off is inert outside development: no Supabase env in production allows nothing (prod-web-03)", () => {
  stub({ NODE_ENV: "production" });
  assert.equal(isOwnedBy(null, "u1"), false);
  assert.equal(isOwnedBy("u1", null), false);
  assert.equal(isOwnedBy(null, null), false);
  assert.equal(isOwnedBy("u1", "u1"), true);
});

test("auth off (local dev): a null owner or a null user is allowed", () => {
  stub({ NODE_ENV: "development" });
  assert.equal(isOwnedBy(null, "u1"), true);
  assert.equal(isOwnedBy("u1", null), true);
  assert.equal(isOwnedBy(null, null), true);
});

test("dev dashboard preview: a null owner or a null user is allowed", () => {
  stub({ ...AUTH, NODE_ENV: "development", DEV_DASHBOARD: "1" });
  assert.equal(isOwnedBy(null, "u1"), true);
  assert.equal(isOwnedBy("u1", null), true);
});

test("dev mode never lets two different real ids match", () => {
  stub({ NODE_ENV: "development" });
  assert.equal(isOwnedBy("u1", "u2"), false);
  stub({ ...AUTH, NODE_ENV: "development", DEV_DASHBOARD: "1" });
  assert.equal(isOwnedBy("u1", "u2"), false);
});
