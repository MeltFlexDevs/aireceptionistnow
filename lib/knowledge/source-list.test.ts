import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Source guard for the knowledge source list: the repo has no component test
// runner, so this pins what tsc cannot see.
const SRC = readFileSync(
  new URL("../../app/(main)/dashboard/knowledge/SourceList.tsx", import.meta.url),
  "utf8",
);

test("each source kind has its own label, so a typed note is not called PDF", () => {
  assert.ok(!SRC.includes('row.kind === "website" ? k.sourceWebsite : k.sourcePdf'));
  assert.match(SRC, /const kindLabel: Record<SourceRow\["kind"\], string> = \{/);
  for (const pair of ["website: k.sourceWebsite", "pdf: k.sourcePdf", "text: k.sourceText"]) {
    assert.ok(SRC.includes(pair), pair);
  }
  assert.ok(SRC.includes("{kindLabel[row.kind]}"));
});

test("Remove asks first and offers Cancel", () => {
  const remove = SRC.slice(
    SRC.indexOf("function RemoveButton("),
    SRC.indexOf("export function SourceList("),
  );
  // The first click only shows the question; it never submits.
  assert.match(remove, /type="button"\s+autoFocus=\{returnFocus\}\s+onClick=\{\(\) => setConfirming\(true\)\}/);
  assert.ok(remove.includes("{k.removeConfirm}"));
  // Exactly one real submit, and only in the confirming branch.
  assert.equal(remove.match(/type="submit"/g)?.length, 1);
  assert.ok(remove.indexOf('type="submit"') > remove.indexOf("{confirming ? ("));
  // A way back.
  assert.match(remove, /onClick=\{\(\) => \{\s+setConfirming\(false\);\s+setReturnFocus\(true\);/);
  assert.ok(remove.includes("{t.common.cancel}"));
});
