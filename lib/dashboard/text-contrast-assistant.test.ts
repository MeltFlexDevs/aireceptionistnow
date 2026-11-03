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
    "app/(main)/dashboard/assistant/[id]/page.tsx",
    [
      ["<span className={`text-sm font-medium ${live ? \"text-emerald-600\" : \"text-amber-600\"}`}>", "<span className={`text-sm font-medium ${live ? \"text-emerald-700\" : \"text-amber-700\"}`}>"],
      ["<p className=\"mt-1.5 text-xs text-neutral-400\">{a.autoLanguageNote}</p>", "<p className=\"mt-1.5 text-xs text-neutral-500\">{a.autoLanguageNote}</p>"],
      ["<span className=\"block text-xs text-neutral-400\">{a.textAlertsSub}</span>", "<span className=\"block text-xs text-neutral-500\">{a.textAlertsSub}</span>"],
      ["<p className=\"mt-1.5 text-xs text-neutral-400\">{a.roleHint}</p>", "<p className=\"mt-1.5 text-xs text-neutral-500\">{a.roleHint}</p>"],
      ["<span className=\"block text-xs text-neutral-400\">{a.sendEmailTranscriptsSub}</span>", "<span className=\"block text-xs text-neutral-500\">{a.sendEmailTranscriptsSub}</span>"],
      ["<p className=\"mt-1.5 text-xs text-neutral-400\">{a.guardrailNeverSub}</p>", "<p className=\"mt-1.5 text-xs text-neutral-500\">{a.guardrailNeverSub}</p>"],
      ["<p className=\"mt-1.5 text-xs text-neutral-400\">{a.guardrailEscalateSub}</p>", "<p className=\"mt-1.5 text-xs text-neutral-500\">{a.guardrailEscalateSub}</p>"],
      ["<p className=\"mt-1.5 text-xs text-neutral-400\">{a.disclosureNote}</p>", "<p className=\"mt-1.5 text-xs text-neutral-500\">{a.disclosureNote}</p>"],
    ],
  ],
  [
    "app/(main)/dashboard/assistant/TransferHoursFields.tsx",
    [
      ["<span className=\"block text-xs text-neutral-400\">{labels.scheduleSub}</span>", "<span className=\"block text-xs text-neutral-500\">{labels.scheduleSub}</span>"],
      ["<span className=\"shrink-0 text-xs text-neutral-400\">{labels.toLabel}</span>", "<span className=\"shrink-0 text-xs text-neutral-500\">{labels.toLabel}</span>"],
      ["<p className=\"pt-1 text-xs text-neutral-400\">{labels.closedNote}</p>", "<p className=\"pt-1 text-xs text-neutral-500\">{labels.closedNote}</p>"],
    ],
  ],
  [
    "app/(main)/dashboard/assistant/CustomToolFields.tsx",
    [
      ["<p className=\"text-xs text-neutral-400\">{labels.intro}</p>", "<p className=\"text-xs text-neutral-500\">{labels.intro}</p>"],
      ["<p className=\"mt-1 text-xs text-neutral-400\">{labels.nameHint}</p>", "<p className=\"mt-1 text-xs text-neutral-500\">{labels.nameHint}</p>"],
      ["<p className=\"mt-1 text-xs text-neutral-400\">{labels.descriptionHint}</p>", "<p className=\"mt-1 text-xs text-neutral-500\">{labels.descriptionHint}</p>"],
      ["<p className=\"mt-1 text-xs text-neutral-400\">{labels.paramsHint}</p>", "<p className=\"mt-1 text-xs text-neutral-500\">{labels.paramsHint}</p>"],
      ["<p className=\"text-xs text-neutral-400\">{labels.authValueHint}</p>", "<p className=\"text-xs text-neutral-500\">{labels.authValueHint}</p>"],
      ["<p className=\"text-xs text-neutral-400\">{labels.timeoutHint}</p>", "<p className=\"text-xs text-neutral-500\">{labels.timeoutHint}</p>"],
    ],
  ],
  [
    "app/(main)/dashboard/assistant/EscalationFields.tsx",
    [
      ["<p className=\"mb-2 text-xs text-neutral-400\">{labels.destinationsSub}</p>", "<p className=\"mb-2 text-xs text-neutral-500\">{labels.destinationsSub}</p>"],
      ["<p className=\"mb-1.5 text-xs text-neutral-400\">{labels.triggersSub}</p>", "<p className=\"mb-1.5 text-xs text-neutral-500\">{labels.triggersSub}</p>"],
      ["<p className=\"mt-1.5 text-xs text-neutral-400\">{labels.slaSub}</p>", "<p className=\"mt-1.5 text-xs text-neutral-500\">{labels.slaSub}</p>"],
      ["<span className=\"block text-xs text-neutral-400\">{labels.pageSub}</span>", "<span className=\"block text-xs text-neutral-500\">{labels.pageSub}</span>"],
      ["<p className=\"mt-1.5 text-xs text-neutral-400\">{labels.pageNumberSub}</p>", "<p className=\"mt-1.5 text-xs text-neutral-500\">{labels.pageNumberSub}</p>"],
    ],
  ],
  [
    "app/(main)/dashboard/assistant/AdvancedVoiceSettings.tsx",
    [
      ["<p className=\"mt-1 text-xs text-neutral-400\">{hint}</p>", "<p className=\"mt-1 text-xs text-neutral-500\">{hint}</p>"],
      ["<p className=\"mt-1 text-xs text-neutral-400\">{t.assistants.voiceTierHint}</p>", "<p className=\"mt-1 text-xs text-neutral-500\">{t.assistants.voiceTierHint}</p>"],
    ],
  ],
  [
    "app/(main)/dashboard/assistant/AssistantsList.tsx",
    [
      ["<h2 className=\"text-xs font-semibold uppercase tracking-wider text-neutral-400\">", "<h2 className=\"text-xs font-semibold uppercase tracking-wider text-neutral-600\">"],
      ["number ? \"font-medium text-neutral-700\" : \"text-neutral-400\"", "number ? \"font-medium text-neutral-700\" : \"text-neutral-500\""],
    ],
  ],
  [
    "app/(main)/dashboard/assistant/GetNumberForm.tsx",
    [
      ["<p className=\"text-xs text-neutral-400\">{t.numbers.billedNote}</p>", "<p className=\"text-xs text-neutral-500\">{t.numbers.billedNote}</p>"],
      ["<div className=\"text-[11px] font-medium uppercase tracking-wide text-neutral-400\">{label}</div>", "<div className=\"text-[11px] font-medium uppercase tracking-wide text-neutral-500\">{label}</div>"],
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

