import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

// Source guard for WCAG AA text contrast (part C2): faint grays and -600 status colors
// were replaced by the next darker shade. The repo has no component test runner.
const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const read = (file: string) => readFileSync(join(ROOT, file), "utf8");

// [file, [old text, new text][]]: the new text is present, the old text is gone.
const EDITS: [string, [string, string][]][] = [
  [
    "app/(main)/dashboard/components/card.ts",
    [
      ["\"mb-3 text-[13px] font-semibold tracking-wide text-neutral-400 uppercase\";", "\"mb-3 text-[13px] font-semibold tracking-wide text-neutral-600 uppercase\";"],
    ],
  ],
  [
    "app/(main)/dashboard/components/UserMenu.tsx",
    [
      ["<span className=\"block max-w-[160px] truncate text-xs text-neutral-400\">{user.email}</span>", "<span className=\"block max-w-[160px] truncate text-xs text-neutral-500\">{user.email}</span>"],
    ],
  ],
  [
    "app/(main)/dashboard/components/NotificationsBell.tsx",
    [
      ["<div className=\"px-4 py-10 text-center text-sm text-neutral-400\">", "<div className=\"px-4 py-10 text-center text-sm text-neutral-500\">"],
      ["<span className=\"shrink-0 text-xs text-neutral-400\">{relTimeOf(i.at, locale)}</span>", "<span className=\"shrink-0 text-xs text-neutral-500\">{relTimeOf(i.at, locale)}</span>"],
    ],
  ],
  [
    "app/(main)/dashboard/components/ActivityFeed.tsx",
    [
      ["<p className=\"text-xs text-neutral-400\">{row.when}</p>", "<p className=\"text-xs text-neutral-500\">{row.when}</p>"],
    ],
  ],
  [
    "app/(main)/dashboard/components/TranslatedText.tsx",
    [
      ["className=\"press mt-1.5 text-[11px] font-medium text-neutral-400 transition-colors hover:text-neutral-900\"", "className=\"press mt-1.5 text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-900\""],
    ],
  ],
  [
    "app/(main)/dashboard/components/BarChart.tsx",
    [
      ["<span key={i} className=\"flex-1 text-center text-[10px] text-neutral-400\">", "<span key={i} className=\"flex-1 text-center text-[10px] text-neutral-500\">"],
    ],
  ],
  [
    "app/(main)/dashboard/components/PlanUsage.tsx",
    [
      ["<span className=\"text-neutral-400\"> / {fmtLimit(limit)}</span>", "<span className=\"text-neutral-500\"> / {fmtLimit(limit)}</span>"],
    ],
  ],
  [
    "app/(main)/dashboard/components/StatusBadge.tsx",
    [
      ["ok: \"text-emerald-600\",", "ok: \"text-emerald-700\","],
      ["warn: \"text-amber-600\",", "warn: \"text-amber-700\","],
      ["error: \"text-rose-600\",", "error: \"text-rose-700\","],
    ],
  ],
  [
    "app/(main)/dashboard/components/UpcomingAppointments.tsx",
    [
      ["? { tone: \"ok\" as const, text: \"text-emerald-600\", label: c.statusDone }", "? { tone: \"ok\" as const, text: \"text-emerald-700\", label: c.statusDone }"],
      ["? { tone: \"error\" as const, text: \"text-rose-600\", label: c.statusFailed }", "? { tone: \"error\" as const, text: \"text-rose-700\", label: c.statusFailed }"],
      [": { tone: \"warn\" as const, text: \"text-amber-600\", label: c.statusPending };", ": { tone: \"warn\" as const, text: \"text-amber-700\", label: c.statusPending };"],
    ],
  ],
  [
    "app/(main)/dashboard/page.tsx",
    [
      ["<span className=\"shrink-0 text-xs font-medium text-neutral-400\">{issue.action} →</span>", "<span className=\"shrink-0 text-xs font-medium text-neutral-500\">{issue.action} →</span>"],
    ],
  ],
  [
    "app/(main)/dashboard/calls/CallTable.tsx",
    [
      ["<span className=\"shrink-0 whitespace-nowrap text-xs tabular-nums text-neutral-400\">", "<span className={`shrink-0 whitespace-nowrap text-xs tabular-nums ${selected ? \"text-neutral-600\" : \"text-neutral-500\"}`}>"],
    ],
  ],
  [
    "app/(main)/dashboard/calls/CallDetailBody.tsx",
    [
      ["negative: \"bg-rose-50 text-rose-600\",", "negative: \"bg-rose-50 text-rose-700\","],
      ["angry: \"bg-rose-50 text-rose-600\",", "angry: \"bg-rose-50 text-rose-700\","],
      ["{metaLine && <p className=\"mt-1.5 pl-8 text-xs tabular-nums text-neutral-400\">{metaLine}</p>}", "{metaLine && <p className=\"mt-1.5 pl-8 text-xs tabular-nums text-neutral-500\">{metaLine}</p>}"],
    ],
  ],
  [
    "app/(main)/dashboard/calls/[id]/ActionItems.tsx",
    [
      ["{notes && <p className=\"text-xs text-neutral-400\">{notes}</p>}", "{notes && <p className=\"text-xs text-neutral-500\">{notes}</p>}"],
      ["<span className=\"ml-1.5 rounded-full bg-rose-50 px-1.5 py-0.5 text-[11px] font-medium text-rose-600\">", "<span className=\"ml-1.5 rounded-full bg-rose-50 px-1.5 py-0.5 text-[11px] font-medium text-rose-700\">"],
    ],
  ],
  [
    "app/(main)/dashboard/calls/[id]/TranscriptView.tsx",
    [
      ["className=\"press -m-1.5 p-1.5 text-[11px] font-medium text-neutral-400 transition-colors hover:text-neutral-900\"", "className=\"press -m-1.5 p-1.5 text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-900\""],
      ["<div className={`mb-1 flex items-center gap-2 text-[11px] text-neutral-400 ${turn.caller ? \"\" : \"justify-end\"}`}>", "<div className={`mb-1 flex items-center gap-2 text-[11px] text-neutral-500 ${turn.caller ? \"\" : \"justify-end\"}`}>"],
    ],
  ],
  [
    "app/(main)/dashboard/calendar/page.tsx",
    [
      ["<p className=\"text-[11px] leading-4 tabular-nums text-neutral-400\">{atTime(b.endTime)}</p>", "<p className=\"text-[11px] leading-4 tabular-nums text-neutral-500\">{atTime(b.endTime)}</p>"],
      ["<span className=\"text-neutral-400\">{c.bookedBy}</span> {b.assistant ?? c.unknownAssistant}", "<span className=\"text-neutral-500\">{c.bookedBy}</span> {b.assistant ?? c.unknownAssistant}"],
      ["<span className=\"text-neutral-400\">{c.addedOn}</span>{\" \"}", "<span className=\"text-neutral-500\">{c.addedOn}</span>{\" \"}"],
      ["<p className=\"text-[11px] font-medium uppercase leading-5 tracking-wide text-neutral-400\">", "<p className=\"text-[11px] font-medium uppercase leading-5 tracking-wide text-neutral-500\">"],
      ["className={`text-sm font-medium leading-5 tabular-nums ${past ? \"text-neutral-400\" : \"text-neutral-900\"}`}", "className={`text-sm font-medium leading-5 tabular-nums ${past ? \"text-neutral-500\" : \"text-neutral-900\"}`}"],
      ["<p className=\"text-[11px] leading-4 tabular-nums text-neutral-400\">{atTime(e.end)}</p>", "<p className=\"text-[11px] leading-4 tabular-nums text-neutral-500\">{atTime(e.end)}</p>"],
      ["className={`text-sm font-medium ${past ? \"text-neutral-400\" : \"text-neutral-900\"}`}", "className={`text-sm font-medium ${past ? \"text-neutral-500\" : \"text-neutral-900\"}`}"],
      ["className=\"pb-1 text-center text-[10px] font-medium uppercase tracking-wide text-neutral-400\"", "className=\"pb-1 text-center text-[10px] font-medium uppercase tracking-wide text-neutral-500\""],
      [": \"text-neutral-300\"", ": \"text-neutral-500\""],
    ],
  ],
  [
    "app/(main)/dashboard/calendar/CancelBooking.tsx",
    [
      ["<p className=\"mt-1.5 text-[11px] leading-relaxed text-neutral-400\">{c.cancelExplainer}</p>", "<p className=\"mt-1.5 text-[11px] leading-relaxed text-neutral-500\">{c.cancelExplainer}</p>"],
    ],
  ],
  [
    "app/(main)/dashboard/knowledge/UploadDropzone.tsx",
    [
      ["<span className=\"text-xs text-neutral-400\">{t.knowledge.dropPdfHint}</span>", "<span className=\"text-xs text-neutral-500\">{t.knowledge.dropPdfHint}</span>"],
    ],
  ],
  [
    "app/(main)/dashboard/settings/AlertsForm.tsx",
    [
      ["<span className=\"block text-xs text-neutral-400\">{row.body}</span>", "<span className=\"block text-xs text-neutral-500\">{row.body}</span>"],
    ],
  ],
  [
    "app/(main)/dashboard/settings/BusinessForm.tsx",
    [
      ["<span className=\"block text-xs text-neutral-400\">{s.shareBody}</span>", "<span className=\"block text-xs text-neutral-500\">{s.shareBody}</span>"],
    ],
  ],
  [
    "app/(main)/dashboard/settings/TimezoneSelect.tsx",
    [
      ["<p className=\"mt-1 text-xs text-neutral-400\">", "<p className=\"mt-1 text-xs text-neutral-500\">"],
      ["<span className=\"text-amber-600\">", "<span className=\"text-amber-700\">"],
    ],
  ],
  [
    "app/(main)/dashboard/numbers/VoiceSelect.tsx",
    [
      ["<li className=\"px-3 py-3 text-sm text-neutral-400\">Loading voices…</li>", "<li className=\"px-3 py-3 text-sm text-neutral-500\">Loading voices…</li>"],
      ["<li className=\"px-3 py-3 text-sm text-neutral-400\">", "<li className=\"px-3 py-3 text-sm text-neutral-500\">"],
    ],
  ],
];

for (const [file, pairs] of EDITS) {
  test(`${file} uses readable text colors`, () => {
    const src = read(file);
    for (const [oldText, newText] of pairs) {
      assert.ok(src.includes(newText), `missing: ${newText}`);
      assert.ok(!src.includes(oldText), `still there: ${oldText}`);
    }
  });
}

