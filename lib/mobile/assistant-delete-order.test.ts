import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

// A route file cannot be imported by the node test runner, so the order is
// pinned as a source guard, like lib/call-engine/setup-check.test.ts.
const ROUTE = fs.readFileSync(
  path.join(__dirname, "../../app/api/mobile/assistants/[id]/route.ts"),
  "utf8",
);

test("mobile assistant delete frees the number before it hides the assistant", () => {
  const handler = ROUTE.slice(ROUTE.indexOf("export async function DELETE("));
  const free = handler.indexOf("await freeAssistantNumbers(id);");
  const hide = handler.indexOf("await deleteAssistant(id);");
  assert.ok(free > 0 && hide > free, "free the number first, then set deleted_at");
});
