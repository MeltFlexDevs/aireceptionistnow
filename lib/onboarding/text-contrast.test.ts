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
    "app/(main)/onboarding/steps/MeetAssistant.tsx",
    [
      ["<span className=\"text-xs font-medium uppercase tracking-wide text-neutral-400\">", "<span className=\"text-xs font-medium uppercase tracking-wide text-neutral-500\">"],
      ["className=\"mb-1.5 flex items-center justify-center gap-1.5 text-xs font-medium text-neutral-400\"", "className=\"mb-1.5 flex items-center justify-center gap-1.5 text-xs font-medium text-neutral-500\""],
      ["<p className=\"mt-2 text-center text-xs leading-snug text-neutral-400\">", "<p className=\"mt-2 text-center text-xs leading-snug text-neutral-500\">"],
      ["className=\"press text-sm font-medium text-neutral-400 hover:text-neutral-700 disabled:opacity-40\"", "className=\"press text-sm font-medium text-neutral-500 hover:text-neutral-700 disabled:opacity-40\""],
      ["? \"text-neutral-400 group-hover:text-neutral-700\"", "? \"text-neutral-500 group-hover:text-neutral-700\""],
    ],
  ],
  [
    "app/(main)/onboarding/steps/PlanStep.tsx",
    [
      ["<p className=\"mt-1.5 text-xs text-neutral-400\">{o.numberChangeHint}</p>", "<p className=\"mt-1.5 text-xs text-neutral-500\">{o.numberChangeHint}</p>"],
      ["<span className={`ml-1.5 text-[11px] ${cycle === c ? \"text-neutral-300\" : \"text-emerald-600\"}`}>", "<span className={`ml-1.5 text-[11px] ${cycle === c ? \"text-neutral-300\" : \"text-emerald-700\"}`}>"],
    ],
  ],
  [
    "app/(main)/onboarding/steps/ProvisioningView.tsx",
    [
      ["mx-auto mt-3 max-w-md text-xs text-neutral-400", "mx-auto mt-3 max-w-md text-xs text-neutral-500"],
    ],
  ],
  [
    "app/(main)/onboarding/steps/CalendarStep.tsx",
    [
      ["<p className=\"text-sm leading-relaxed text-neutral-400\">{o.noProviders}</p>", "<p className=\"text-sm leading-relaxed text-neutral-500\">{o.noProviders}</p>"],
      ["<span className=\"inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600\">", "<span className=\"inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700\">"],
    ],
  ],
  [
    "app/(main)/onboarding/steps/KnowledgeStep.tsx",
    [
      ["<p className=\"text-sm leading-relaxed text-neutral-400\">{o.knowledgeEmpty}</p>", "<p className=\"text-sm leading-relaxed text-neutral-500\">{o.knowledgeEmpty}</p>"],
      ["className=\"press shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-neutral-400 transition-colors hover:text-rose-600 disabled:opacity-50\"", "className=\"press shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-neutral-500 transition-colors hover:text-rose-600 disabled:opacity-50\""],
    ],
  ],
  [
    "app/(main)/onboarding/VoicePicker.tsx",
    [
      ["<span className=\"hidden truncate text-xs text-neutral-400 sm:inline\">", "<span className=\"hidden truncate text-xs text-neutral-500 sm:inline\">"],
      ["<p className=\"flex items-center justify-center gap-2 py-3 text-xs text-neutral-400\">", "<p className=\"flex items-center justify-center gap-2 py-3 text-xs text-neutral-500\">"],
      ["<p className=\"py-4 text-center text-xs text-neutral-400\">{t.common.noMatches}</p>", "<p className=\"py-4 text-center text-xs text-neutral-500\">{t.common.noMatches}</p>"],
    ],
  ],
  [
    "app/components/forms/validated-form.tsx",
    [
      ["return <span className=\"font-normal text-neutral-400\">{` (${t?.common.optional ?? \"optional\"})`}</span>;", "return <span className=\"font-normal text-neutral-500\">{` (${t?.common.optional ?? \"optional\"})`}</span>;"],
      ["{hint && <p className=\"mt-1.5 text-xs text-neutral-400\">{hint}</p>}", "{hint && <p className=\"mt-1.5 text-xs text-neutral-500\">{hint}</p>}"],
    ],
  ],
  [
    "app/components/LocaleMenu.tsx",
    [
      ["<p className=\"px-3 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400\">", "<p className=\"px-3 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500\">"],
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
