import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// The phone's knowledge route used to write back the copy each request read at
// its start, so a website import that finished after a gap was answered dropped
// the answer. A route file cannot be imported by the node test runner, so the
// wiring is pinned as a source guard, like knowledge-fresh-write.test.ts does
// for the dashboard.
const ROUTE = readFileSync(
  new URL("../../app/api/mobile/knowledge/route.ts", import.meta.url),
  "utf8",
);

test("mobile saveKnowledge re-reads the org right before it writes", () => {
  assert.match(
    ROUTE,
    /async function saveKnowledge\(\s*orgId: string,\s*change: \(fresh: AssistantKnowledge\) => AssistantKnowledge \| null,\s*\): Promise<boolean>/,
  );
  const body = ROUTE.slice(ROUTE.indexOf("async function saveKnowledge("));
  const read = body.indexOf("getOrganization(orgId)");
  const write = body.indexOf("updateOrganizationKnowledge(orgId");
  assert.ok(read > 0 && write > read, "saveKnowledge must read the org before the update");
  assert.ok(body.includes("change(readKnowledge(current.knowledge))"));
});

test("no mobile knowledge write saves the copy it read at the start", () => {
  const handlers = ROUTE.slice(ROUTE.indexOf("export async function POST("));
  assert.equal(handlers.match(/readKnowledge\(/g), null);
  assert.doesNotMatch(handlers, /saveKnowledge\(org\.id, \{/);
  // answerGap, notes, website, text and DELETE each pass a change function.
  assert.equal(handlers.match(/await saveKnowledge\(org\.id, \(fresh\) =>/g)?.length, 5);
});
