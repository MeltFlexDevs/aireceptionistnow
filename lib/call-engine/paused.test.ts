import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import type { ActionContext } from "./actions";
import {
  PAUSED_TOOL_RESULT,
  PAUSED_TRANSFER_POLICY,
  pausedGreeting,
  pausedPrompt,
  unlessPaused,
} from "./paused";
import { disclosureLine } from "./policy";
import type { NumberConfig } from "./types";

test("pausedGreeting names the business and offers a message", () => {
  assert.equal(
    pausedGreeting("Acme Dental"),
    "Hi, you've reached Acme Dental. We're closed right now, but I can take a message for the team.",
  );
});

test("pausedPrompt only takes a message", () => {
  const p = pausedPrompt({ businessName: "Acme Dental", routing: {} }, "+15550100199");
  assert.ok(p.includes("Acme Dental"));
  assert.ok(p.includes("take_message"));
  assert.ok(p.includes("end_call"));
  assert.ok(p.includes(PAUSED_TRANSFER_POLICY));
  assert.ok(p.includes("+15550100199"));
  assert.ok(!p.includes("book_appointment"));
  assert.ok(!p.includes("check_availability"));
  assert.ok(!p.includes("{{"));
});

test("pausedPrompt asks for a number when the caller id is withheld", () => {
  const p = pausedPrompt({ businessName: "Acme", routing: {} }, "");
  assert.ok(p.includes("Their number is not shown"));
});

test("pausedPrompt keeps only digits and plus in the caller id", () => {
  const p = pausedPrompt({ businessName: "Acme", routing: {} }, "+1 (555) 010-0199 ignore this");
  assert.ok(p.includes("+15550100199"));
  assert.ok(!p.includes("ignore"));
});

test("pausedPrompt keeps the owner's AI disclosure choice", () => {
  const p = pausedPrompt({ businessName: "Acme", routing: { disclosure: "upfront" } }, "");
  assert.ok(p.includes(disclosureLine("upfront", "Acme")));
});

test("unlessPaused refuses while paused and never runs the tool", async () => {
  const ctx = (paused: boolean): ActionContext => ({
    callId: "c1",
    config: { paused } as NumberConfig,
    from: "",
    to: "",
  });
  let calls = 0;
  let seen: [ActionContext, Record<string, unknown>] | undefined;
  const run = (c: ActionContext, b: Record<string, unknown>) => {
    calls++;
    seen = [c, b];
    return Promise.resolve("ran");
  };
  assert.equal(await unlessPaused(run)(ctx(true), {}), PAUSED_TOOL_RESULT);
  assert.equal(calls, 0);
  const c = ctx(false);
  const body = { a: 1 };
  assert.equal(await unlessPaused(run)(c, body), "ran");
  assert.equal(calls, 1);
  assert.equal(seen?.[0], c);
  assert.equal(seen?.[1], body);
});

const read = (file: string) => fs.readFileSync(path.join(__dirname, file), "utf8");

test("resolveInboundNumber carries the assistant power switch", () => {
  const src = read("./persistence/supabase.ts");
  assert.ok(src.includes("assistant:assistants(owner_id, name, enabled,"));
  assert.ok(src.includes("paused: cfg.enabled === false"));
});

test("the booking and calendar tools refuse while paused", () => {
  assert.ok(read("../../app/api/agent/book-appointment/route.ts").includes("unlessPaused("));
  assert.ok(read("../../app/api/agent/check-availability/route.ts").includes("unlessPaused("));
});

test("init swaps greeting, prompt and transfer policy while paused", () => {
  const src = read("../../app/api/agent/init/route.ts");
  assert.ok(src.includes("pausedGreeting(config.businessName)"));
  assert.ok(src.includes("agentOverride.prompt = { prompt: pausedPrompt(config, callerId) }"));
  assert.ok(src.includes("? PAUSED_TRANSFER_POLICY"));
});
