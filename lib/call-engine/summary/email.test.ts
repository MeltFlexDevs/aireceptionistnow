import test, { mock } from "node:test";
import assert from "node:assert/strict";

import { isTranscriptEmail, readEmailConfig, sendTranscriptEmail, type TranscriptEmailInput } from "./email";

const input = {
  config: { businessName: "Acme", label: "Main" },
  summary: { summary: "Hi", outcome: "info", actionItems: [] },
  turns: [],
} as unknown as TranscriptEmailInput;

test("half-set email env logs a masked owner address, never the clear one", async () => {
  const savedKey = process.env.RESEND_API_KEY;
  const savedFrom = process.env.EMAIL_FROM;
  process.env.RESEND_API_KEY = "re_test_placeholder";
  delete process.env.EMAIL_FROM;
  const error = mock.method(console, "error", () => {});
  try {
    const res = await sendTranscriptEmail({ enabled: true, to: "owner@example.com" }, input);
    assert.deepEqual(res, { ok: false, skipped: true });
    const logged = error.mock.calls.map((c) => String(c.arguments[0])).join("\n");
    assert.ok(logged.includes("o***@example.com"), logged);
    assert.ok(!logged.includes("owner@example.com"), logged);
  } finally {
    error.mock.restore();
    if (savedKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = savedKey;
    if (savedFrom === undefined) delete process.env.EMAIL_FROM; else process.env.EMAIL_FROM = savedFrom;
  }
});

test("a transcript address needs a name, an @ and a domain with a dot", () => {
  for (const ok of ["owner@example.com", "a.b+c@mail.example.co.uk"]) {
    assert.equal(isTranscriptEmail(ok), true, ok);
  }
  for (const bad of ["owner@", "owner@localhost", "@example.com", "owner x@example.com", ""]) {
    assert.equal(isTranscriptEmail(bad), false, bad);
  }
  assert.equal(readEmailConfig({ emailTranscripts: { enabled: true, to: "owner@localhost" } }), null);
  assert.deepEqual(readEmailConfig({ emailTranscripts: { enabled: true, to: "owner@example.com" } }), {
    enabled: true,
    to: "owner@example.com",
  });
});
