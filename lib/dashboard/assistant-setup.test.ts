import assert from "node:assert/strict";
import { test } from "node:test";

import { ENGLISH_AMERICA_VOICES } from "@/app/(main)/dashboard/numbers/voices";
import {
  buildSetupItems,
  greetingWordCount,
  setupProgress,
  voiceName,
  type SetupInputs,
} from "./assistant-setup";

const BLANK: SetupInputs = {
  voiceId: "",
  greeting: "",
  transferTo: "",
  calendarsConnected: 0,
  calendarAccessCount: 0,
  systemPrompt: "",
};

const CONFIGURED: SetupInputs = {
  voiceId: ENGLISH_AMERICA_VOICES[0].voiceId,
  greeting: "Hi, thanks for calling Acme.",
  transferTo: "+14155550199",
  calendarsConnected: 1,
  calendarAccessCount: 1,
  systemPrompt: "You are the front desk for Acme.",
};

test("a brand new assistant has nothing done", () => {
  const items = buildSetupItems(BLANK);
  assert.equal(items.length, 5);
  assert.ok(items.every((i) => !i.done));
  assert.deepEqual(setupProgress(items), { done: 0, total: 5, percent: 0 });
});

test("a fully configured assistant reads 100%", () => {
  const items = buildSetupItems(CONFIGURED);
  assert.ok(items.every((i) => i.done));
  assert.deepEqual(setupProgress(items), { done: 5, total: 5, percent: 100 });
});

test("whitespace is not configuration", () => {
  // Guards the difference between "" and "   ", which a plain truthiness check
  // would call configured.
  const items = buildSetupItems({
    ...BLANK,
    voiceId: "  ",
    greeting: "\n\t ",
    transferTo: " ",
    systemPrompt: "   ",
  });
  assert.ok(items.every((i) => !i.done));
});

test("a connected calendar with no access does not count as set up", () => {
  // The card promises the assistant can book. A calendar it cannot touch does
  // not deliver that, so it must still read as unfinished.
  const items = buildSetupItems({ ...BLANK, calendarsConnected: 3, calendarAccessCount: 0 });
  assert.equal(items.find((i) => i.key === "calendar")?.done, false);

  const withAccess = buildSetupItems({ ...BLANK, calendarsConnected: 3, calendarAccessCount: 1 });
  assert.equal(withAccess.find((i) => i.key === "calendar")?.done, true);
});

test("progress is rounded, never fractional or NaN", () => {
  const items = buildSetupItems({ ...BLANK, voiceId: "v1", greeting: "Hi" });
  // 2 of 5 = 40%
  assert.deepEqual(setupProgress(items), { done: 2, total: 5, percent: 40 });
  assert.deepEqual(setupProgress([]), { done: 0, total: 0, percent: 0 });
});

test("greeting word count ignores padding and collapses runs of whitespace", () => {
  assert.equal(greetingWordCount(""), 0);
  assert.equal(greetingWordCount("   "), 0);
  assert.equal(greetingWordCount("Hello"), 1);
  assert.equal(greetingWordCount("  Hi   there,  friend  "), 3);
  assert.equal(greetingWordCount("Hi\nthere\tfriend"), 3);
});

test("a premade voice resolves to its name, anything else to empty", () => {
  const known = ENGLISH_AMERICA_VOICES[0];
  assert.equal(voiceName(known.voiceId), known.name);
  assert.equal(voiceName(` ${known.voiceId} `), known.name, "stored ids can carry padding");
  // A cloned or library voice: the caller must not print a raw id at the user.
  assert.equal(voiceName("some-library-voice-id"), "");
  assert.equal(voiceName(""), "");
});
