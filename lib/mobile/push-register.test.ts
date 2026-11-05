import test from "node:test";
import assert from "node:assert/strict";

import { enabledOnRegister } from "./push-register";

const TOKEN = "ExponentPushToken[abc123]";

test("a register with muted: true keeps alerts off", () => {
  assert.equal(enabledOnRegister({ token: TOKEN, platform: "ios", muted: true }), false);
});

test("a register without muted is an older build and turns alerts on", () => {
  assert.equal(enabledOnRegister({ token: TOKEN, platform: "ios" }), true);
});

test("only a real boolean true mutes", () => {
  assert.equal(enabledOnRegister({ token: TOKEN, muted: false }), true);
  assert.equal(enabledOnRegister({ token: TOKEN, muted: "true" }), true);
  assert.equal(enabledOnRegister({ token: TOKEN, muted: 1 }), true);
  assert.equal(enabledOnRegister({ token: TOKEN, muted: null }), true);
});
