import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { de } from "../i18n/dictionaries/de";
import { en } from "../i18n/dictionaries/en";
import { es } from "../i18n/dictionaries/es";
import { fr } from "../i18n/dictionaries/fr";
import { it as itDict } from "../i18n/dictionaries/it";
import { nl } from "../i18n/dictionaries/nl";
import { pt } from "../i18n/dictionaries/pt";
import { sk } from "../i18n/dictionaries/sk";

// Source guard: the repo has no component test runner, so this pins the call
// report and transcript fixes on the call detail.
const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const DETAIL = read("app/(main)/dashboard/calls/CallDetailBody.tsx");
const REPORT = read("app/(main)/dashboard/calls/[id]/ReportIssue.tsx");
const TRANSCRIPT = read("app/(main)/dashboard/calls/[id]/Transcript.tsx");
const TRANSCRIPT_VIEW = read("app/(main)/dashboard/calls/[id]/TranscriptView.tsx");
const MOBILE_DETAIL = read("app/api/mobile/calls/[id]/route.ts");
const DICTS = { en, sk, de, es, fr, it: itDict, nl, pt };

test("the call detail counts the reports already on file for the call", () => {
  assert.ok(DETAIL.includes('.from("call_reports")'));
  assert.ok(DETAIL.includes('.select("id", { count: "exact", head: true })'));
  assert.ok(DETAIL.includes('.eq("call_id", call.id)'));
  assert.ok(DETAIL.includes("alreadyReported={(reportCount ?? 0) > 0}"));
});

test("the mobile call detail says whether a report is on file", () => {
  assert.ok(MOBILE_DETAIL.includes('.from("call_reports")'));
  assert.ok(MOBILE_DETAIL.includes('.select("id", { count: "exact", head: true })'));
  assert.ok(MOBILE_DETAIL.includes('.eq("call_id", id)'));
  assert.ok(MOBILE_DETAIL.includes("reported: (count ?? 0) > 0"));
});

test("a report on file shows the sent pill, and a blank message cannot be sent", () => {
  assert.ok(REPORT.includes("if (state.ok || alreadyReported) {"));
  assert.ok(REPORT.includes("value={message}"));
  assert.ok(REPORT.includes("onChange={(e) => setMessage(e.target.value)}"));
  assert.ok(REPORT.includes("disabled={!valid || blank}"));
  assert.ok(REPORT.includes("blank={!message.trim()}"));
});

test("a failed report request becomes an inline error, not a page error", () => {
  assert.ok(!REPORT.includes("useActionState<ReportState, FormData>(reportCallIssue,"));
  assert.ok(REPORT.includes("return await reportCallIssue(prev, formData);"));
  assert.ok(REPORT.includes("return { ok: false, error: d.reportErrorNetwork };"));
});

test("every locale has its own network error text for a call report", () => {
  for (const [locale, dict] of Object.entries(DICTS)) {
    const text = dict.calls.detail.reportErrorNetwork;
    assert.ok(text.trim().length > 0, `${locale} reportErrorNetwork is empty`);
    if (locale !== "en") assert.notEqual(text, en.calls.detail.reportErrorNetwork, `${locale} is not translated`);
  }
});

test("an ended call without turns does not promise a transcript", () => {
  assert.ok(DETAIL.includes("<Transcript turns={call.turns} live={call.isLive} />"));
  assert.ok(TRANSCRIPT.includes("live={live}"));
  assert.ok(TRANSCRIPT_VIEW.includes("live ? t.data.noTranscript : t.data.noTranscriptEnded"));
});

test("every locale has its own text for an ended call without a transcript", () => {
  for (const [locale, dict] of Object.entries(DICTS)) {
    const text = dict.data.noTranscriptEnded;
    assert.ok(text.trim().length > 0, `${locale} noTranscriptEnded is empty`);
    assert.notEqual(text, dict.data.noTranscript, `${locale} reuses the live text`);
    if (locale !== "en") assert.notEqual(text, en.data.noTranscriptEnded, `${locale} is not translated`);
  }
});
