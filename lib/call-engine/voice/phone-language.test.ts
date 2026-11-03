import { test } from "node:test";
import assert from "node:assert/strict";

import { isSupportedLanguageBase } from "./phone-language";

test("a regional code counts by its base language", () => {
  assert.equal(isSupportedLanguageBase("en-US"), true);
  assert.equal(isSupportedLanguageBase("pt-BR"), true);
  assert.equal(isSupportedLanguageBase("DE"), true);
});

test("a language ElevenLabs speaks counts even when no phone prefix maps to it", () => {
  // The per-language voice picker offers Hindi; SUPPORTED_LANGUAGES has no "hi".
  assert.equal(isSupportedLanguageBase("hi"), true);
});

test("unknown, empty and the multi sentinel are not supported", () => {
  assert.equal(isSupportedLanguageBase("xx"), false);
  assert.equal(isSupportedLanguageBase(""), false);
  assert.equal(isSupportedLanguageBase("multi"), false);
});
