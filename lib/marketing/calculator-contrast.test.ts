import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

// Source guard for WCAG AA text contrast (part C2): faint grays and -600 status colors
// were replaced by the next darker shade. The repo has no component test runner.
const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const read = (file: string) => readFileSync(join(ROOT, file), "utf8");

// [css file, selectors whose text color is now #6f6f6f]
const CSS: [string, string[]][] = [
  ["app/(main)/missed-call-calculator/calculator.css", [".mcc-eyebrow", ".mcc-chain-label", ".mcc-money-input span", ".mcc-hint"]],
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

