import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

// The call log once said "47s" while home, the bell and the averages said
// "0m 47s": two modules had their own copy of the formatter. Keep one.
const read = (file: string) => fs.readFileSync(path.join(__dirname, file), "utf8");

for (const file of ["analytics.ts", "notifications.ts"]) {
  test(`${file} uses the shared fmtDuration from ./calls/format`, () => {
    const src = read(file);
    assert.doesNotMatch(src, /function fmtDuration/);
    assert.match(src, /import \{[^}]*\bfmtDuration\b[^}]*\} from "\.\/calls\/format";/);
  });
}
