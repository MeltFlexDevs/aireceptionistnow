import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import {
  SetupMissingError,
  isSetupMissing,
  twilioConfigured,
  voiceConfigured,
} from "./setup-check";

test("twilioConfigured needs a SID and a token or API key pair", () => {
  assert.equal(twilioConfigured({}), false);
  assert.equal(twilioConfigured({ TWILIO_ACCOUNT_SID: "AC1" }), false);
  assert.equal(
    twilioConfigured({ TWILIO_ACCOUNT_SID: "AC1", TWILIO_AUTH_TOKEN: "t" }),
    true,
  );
  assert.equal(
    twilioConfigured({ TWILIO_ACCOUNT_SID: "AC1", TWILIO_API_KEY_SID: "SK1" }),
    false,
  );
  assert.equal(
    twilioConfigured({
      TWILIO_ACCOUNT_SID: "AC1",
      TWILIO_API_KEY_SID: "SK1",
      TWILIO_API_KEY_SECRET: "s",
    }),
    true,
  );
  assert.equal(
    twilioConfigured({ TWILIO_ACCOUNT_SID: "", TWILIO_AUTH_TOKEN: "t" }),
    false,
  );
});

test("voiceConfigured needs an ElevenLabs key", () => {
  assert.equal(voiceConfigured({}), false);
  assert.equal(voiceConfigured({ ELEVENLABS_API_KEY: "" }), false);
  assert.equal(voiceConfigured({ ELEVENLABS_API_KEY: "k" }), true);
});

test("isSetupMissing detects only SetupMissingError", () => {
  const err = new SetupMissingError("x");
  assert.equal(isSetupMissing(err), true);
  assert.equal(err.code, "setup_missing");
  assert.equal(err.name, "SetupMissingError");
  assert.equal(isSetupMissing(new Error("x")), false);
  assert.equal(isSetupMissing("x"), false);
  assert.equal(isSetupMissing(null), false);
});

const read = (file: string) => fs.readFileSync(path.join(__dirname, file), "utf8");

test("assistant actions say contact support when setup is missing", () => {
  const actions = read("../../app/(main)/dashboard/assistant/actions.ts");
  assert.ok(actions.includes("if (!agentPhoneNumberId) return fail(a.testCallUnavailable);"));
  assert.ok(actions.includes("isSetupMissing(err) ? a.numberUnavailable : a.numberFailed"));
  assert.ok(actions.includes("if (!voiceConfigured()) return fail(a.testCallUnavailable);"));
  assert.ok(actions.includes("if (!voiceConfigured()) return fail(a.numberUnavailable);"));
  const en = read("../i18n/dictionaries/en.ts");
  assert.ok(en.includes("testCallUnavailable:"));
  assert.ok(en.includes("numberUnavailable:"));
});

test("mobile text-back says contact support when Twilio is not set up", () => {
  const route = read("../../app/api/mobile/calls/[id]/text/route.ts");
  assert.ok(route.includes('code: "sms_unavailable"'));
  assert.ok(route.includes("status: 503"));
  assert.ok(route.includes("if (!twilioConfigured())"));
  assert.ok(route.includes('"That did not send. Try again."'));
  assert.ok(route.indexOf("if (!twilioConfigured())") < route.indexOf("await sendSms("));
});
