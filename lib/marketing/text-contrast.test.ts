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
    "app/(main)/blog/page.tsx",
    [
      ["<div className=\"flex items-center gap-3 text-[13px] text-[#999]\">", "<div className=\"flex items-center gap-3 text-[13px] text-[#6f6f6f]\">"],
    ],
  ],
  [
    "app/[locale]/blog/page.tsx",
    [
      ["<div className=\"flex items-center gap-3 text-[13px] text-[#999]\">", "<div className=\"flex items-center gap-3 text-[13px] text-[#6f6f6f]\">"],
    ],
  ],
  [
    "app/(main)/blog/[slug]/page.tsx",
    [
      ["<figcaption className=\"mt-3 text-[13px] leading-6 text-[#999]\">", "<figcaption className=\"mt-3 text-[13px] leading-6 text-[#6f6f6f]\">"],
      ["<p className=\"mb-3 text-[10px] font-semibold tracking-[0.08em] text-[#999] uppercase\">", "<p className=\"mb-3 text-[10px] font-semibold tracking-[0.08em] text-[#6f6f6f] uppercase\">"],
      ["<span className=\"shrink-0 text-[11px] font-medium tracking-[0.06em] text-[#999] uppercase\">", "<span className=\"shrink-0 text-[11px] font-medium tracking-[0.06em] text-[#6f6f6f] uppercase\">"],
    ],
  ],
  [
    "app/[locale]/blog/[slug]/page.tsx",
    [
      ["<figcaption className=\"mt-3 text-[13px] leading-6 text-[#999]\">", "<figcaption className=\"mt-3 text-[13px] leading-6 text-[#6f6f6f]\">"],
      ["<p className=\"mb-3 text-[10px] font-semibold tracking-[0.08em] text-[#999] uppercase\">", "<p className=\"mb-3 text-[10px] font-semibold tracking-[0.08em] text-[#6f6f6f] uppercase\">"],
      ["<span className=\"shrink-0 text-[11px] font-medium tracking-[0.06em] text-[#999] uppercase\">", "<span className=\"shrink-0 text-[11px] font-medium tracking-[0.06em] text-[#6f6f6f] uppercase\">"],
    ],
  ],
  [
    "app/(main)/blog/_components/prose.tsx",
    [
      ["<figcaption className=\"mt-3 text-[13px] leading-6 text-[#999]\">", "<figcaption className=\"mt-3 text-[13px] leading-6 text-[#6f6f6f]\">"],
      ["<figcaption className=\"mt-3 text-[13px] leading-6 text-[#999]\">", "<figcaption className=\"mt-3 text-[13px] leading-6 text-[#6f6f6f]\">"],
      ["<p className=\"mb-3 text-[10px] font-semibold tracking-[0.08em] text-[#999] uppercase\">", "<p className=\"mb-3 text-[10px] font-semibold tracking-[0.08em] text-[#6f6f6f] uppercase\">"],
      ["<p className=\"mb-2 text-[12px] font-medium tracking-[0.04em] text-[#888] uppercase\">", "<p className=\"mb-2 text-[12px] font-medium tracking-[0.04em] text-[#6f6f6f] uppercase\">"],
      ["className=\"border-b-2 border-[#e5e5e5] px-3.5 py-2.5 text-left text-[12px] font-medium tracking-[0.04em] text-[#888] uppercase\"", "className=\"border-b-2 border-[#e5e5e5] px-3.5 py-2.5 text-left text-[12px] font-medium tracking-[0.04em] text-[#6f6f6f] uppercase\""],
      ["<h2 className=\"mb-4 text-[11px] font-medium tracking-[0.06em] text-[#999] uppercase\">", "<h2 className=\"mb-4 text-[11px] font-medium tracking-[0.06em] text-[#6f6f6f] uppercase\">"],
    ],
  ],
  [
    "app/(main)/blog/_components/post-toc.tsx",
    [
      ["<p className=\"mb-3 text-[10px] font-semibold tracking-[0.08em] text-[#999] uppercase\">", "<p className=\"mb-3 text-[10px] font-semibold tracking-[0.08em] text-[#6f6f6f] uppercase\">"],
      [": \"border-transparent font-light text-[#888] hover:text-[#333]\"", ": \"border-transparent font-light text-[#6f6f6f] hover:text-[#333]\""],
    ],
  ],
  [
    "app/(main)/blog/_components/prompt-block.tsx",
    [
      ["<span className=\"text-[10px] font-semibold tracking-[0.08em] text-[#999] uppercase\">", "<span className=\"text-[10px] font-semibold tracking-[0.08em] text-[#6f6f6f] uppercase\">"],
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

// [css file, selectors whose text color is now #6f6f6f]
const CSS: [string, string[]][] = [
  ["app/(main)/answers/answers.css", [".answers-card__author-role", ".answer-page__author-role", ".answer-page__date", ".answer-page__short-answer-label", ".answer-page__content blockquote cite", ".answer-page__content th", ".answer-page__related-category"]],
  ["app/(main)/privacy-policy/policy.css", [".policy-updated"]],
  ["app/(main)/compare/_compare/compare.css", [".compare-hub-eyebrow"]],
];

for (const [file, selectors] of CSS) {
  test(`${file} uses #6f6f6f for faint text`, () => {
    const css = read(file);
    for (const selector of selectors) {
      const start = css.indexOf(`${selector} {`);
      assert.ok(start >= 0, `rule not found: ${selector}`);
      const body = css.slice(start, css.indexOf("}", start));
      assert.match(body, /color: #6f6f6f;/, selector);
      assert.doesNotMatch(body, /#(999|888)\b/, selector);
    }
  });
}
