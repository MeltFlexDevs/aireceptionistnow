import assert from "node:assert/strict";
import { test } from "node:test";

import { composeSystemPrompt } from "./sync";
import type { Assistant } from "../../dashboard/db";

/**
 * The composed system prompt is what the model is actually told on every call.
 * It has two failure modes that nothing else catches:
 *
 * 1. A `{{placeholder}}` the call-start webhook does not fill. It reaches the
 *    live model as literal braces, and the instruction around it becomes
 *    nonsense - "you are told which on each call. {{transfer_policy}}".
 * 2. Two instructions that contradict each other, so which one wins is a coin
 *    flip per call.
 *
 * Both are invisible to tsc and to the build.
 */

/** Every variable app/api/agent/init/route.ts sends, on EVERY code path. */
const ALWAYS_SENT = new Set(["transfer_policy", "caller_context"]);
/** Variables the ElevenLabs platform substitutes itself. */
const PLATFORM = new Set(["system__time_utc"]);

const BASE: Assistant = {
  id: "a1",
  name: "Front desk",
  greeting: "Hello, thanks for calling.",
  system_prompt: "",
  voice_id: "v1",
  language: "multi",
  enabled: true,
  routing: {},
  knowledge: {},
  owner_id: "u1",
  elevenlabs_agent_id: null,
} as unknown as Assistant;

const withRouting = (routing: Record<string, unknown>): Assistant =>
  ({ ...BASE, routing }) as unknown as Assistant;

const ALL_TOOLS = new Set(["check_availability", "book_appointment", "take_message"]);

function placeholders(prompt: string): string[] {
  return [...prompt.matchAll(/\{\{([a-z0-9_]+)\}\}/gi)].map((m) => m[1]);
}

test("every placeholder in the prompt is one the call-start webhook fills", () => {
  // The richest configuration, so every conditional block is present at once.
  const prompt = composeSystemPrompt(
    withRouting({
      escalation: {
        targets: [
          { id: "a", label: "Front desk", number: "+14155550199" },
          {
            id: "b",
            label: "On call",
            number: "+14155550100",
            hours: { timezone: "UTC", days: [null, { start: "18:00", end: "07:00" }, null, null, null, null, null] },
          },
        ],
        triggers: ["a burst pipe"],
        callbackSlaMinutes: 30,
      },
      guardrails: { neverDiscuss: ["refunds"], alwaysEscalate: ["legal disputes"] },
      customTools: [
        {
          id: "t1",
          name: "check_stock",
          description: "Check stock levels.",
          url: "https://api.example.com/stock",
        },
      ],
    }),
    "Acme",
    new Set([...ALL_TOOLS, "check_stock"]),
    true,
    "Europe/Bratislava",
    true,
  );

  for (const name of placeholders(prompt)) {
    assert.ok(
      ALWAYS_SENT.has(name) || PLATFORM.has(name),
      `{{${name}}} is in the prompt but app/api/agent/init/route.ts never sends it - ` +
        "it would reach a live call unsubstituted",
    );
  }
  // And the two we rely on are actually there, so this test cannot pass vacuously.
  assert.ok(placeholders(prompt).includes("transfer_policy"));
  assert.ok(placeholders(prompt).includes("caller_context"));
});

test("the transfer-policy placeholder appears only when availability varies", () => {
  const always = composeSystemPrompt(
    withRouting({ transferTo: "+14155550199" }),
    "Acme",
    ALL_TOOLS,
  );
  assert.ok(!placeholders(always).includes("transfer_policy"));
  // Without the placeholder the prompt must still say a hand-off is possible.
  assert.match(always, /transfer_to_number/);

  const scheduled = composeSystemPrompt(
    withRouting({
      transferTo: "+14155550199",
      transferHours: {
        timezone: "UTC",
        days: [null, { start: "09:00", end: "17:00" }, null, null, null, null, null],
      },
    }),
    "Acme",
    ALL_TOOLS,
  );
  assert.ok(placeholders(scheduled).includes("transfer_policy"));
});

test("caller recognition can be turned off, and then leaves no placeholder", () => {
  const off = composeSystemPrompt(withRouting({ recognizeCallers: false }), "Acme", ALL_TOOLS);
  assert.ok(!placeholders(off).includes("caller_context"));
});

test("the prompt never both denies and admits being an AI", () => {
  // The old prompt hard-coded a denial. If that line ever comes back alongside
  // the honest default, which one the model follows is a coin flip.
  const honest = composeSystemPrompt(BASE, "Acme", ALL_TOOLS);
  assert.match(honest, /tell them the truth/);
  assert.doesNotMatch(honest, /Never introduce yourself as an AI/);

  const deflecting = composeSystemPrompt(withRouting({ disclosure: "deflect" }), "Acme", ALL_TOOLS);
  assert.doesNotMatch(deflecting, /tell them the truth/);
});

test("the prompt only promises tools that were actually provisioned", () => {
  // createAgentTools tolerates a partial failure, so toolNames is the truth.
  // A prompt that describes booking when book_appointment does not exist makes
  // the agent promise something it then cannot do, on air.
  const noTools = composeSystemPrompt(BASE, "Acme", new Set());
  assert.doesNotMatch(noTools, /book_appointment/);
  assert.doesNotMatch(noTools, /take_message/);
  assert.doesNotMatch(noTools, /check_availability/);

  const customNotCreated = composeSystemPrompt(
    withRouting({
      customTools: [
        { id: "t1", name: "check_stock", description: "Check stock.", url: "https://api.example.com/s" },
      ],
    }),
    "Acme",
    new Set(["take_message"]), // the custom tool failed to create
    true,
  );
  assert.doesNotMatch(customNotCreated, /check_stock/);
});

test("a callback promise is only made when the operator set one", () => {
  const none = composeSystemPrompt(withRouting({ transferTo: "+14155550199" }), "Acme", ALL_TOOLS);
  assert.doesNotMatch(none, /promise a callback within/i);

  const promised = composeSystemPrompt(
    withRouting({ transferTo: "+14155550199", escalation: { callbackSlaMinutes: 90 } }),
    "Acme",
    ALL_TOOLS,
  );
  assert.match(promised, /1\.5 hours/, "spoken form, not '90 minutes'");
});

test("with no destination at all the agent still has somewhere to send people", () => {
  // The worst outcome is a caller who needs a person, is offered nothing, and
  // is not even offered a message.
  const prompt = composeSystemPrompt(BASE, "Acme", new Set(["take_message"]));
  assert.doesNotMatch(prompt, /transfer_to_number/);
  assert.match(prompt, /take_message/);
  assert.match(prompt, /urgency high/);
});
