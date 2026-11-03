import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { addSource, readKnowledge, type AssistantKnowledge, type KnowledgeSource } from "./sources";

// Knowledge saves on /dashboard/knowledge used to write back the copy each
// action read before its slow work, so a website added while a gap was
// answered dropped the answer. actions.ts is a server-action file the node
// test runner cannot import, so the wiring is pinned as a source guard, like
// lib/dashboard/transfer-hours-roundtrip.test.ts.
const ACTIONS = readFileSync(
  new URL("../../app/(main)/dashboard/knowledge/actions.ts", import.meta.url),
  "utf8",
);

const site: KnowledgeSource = {
  id: "site-1",
  kind: "website",
  title: "Site",
  url: "https://example.com",
  markdown: "Open 9-5.",
  charCount: 9,
  addedAt: "2026-10-27T10:00:00.000Z",
};

function add(knowledge: AssistantKnowledge, source: KnowledgeSource): AssistantKnowledge {
  const added = addSource(knowledge, source);
  if (!added.ok) throw new Error("source limit");
  return added.knowledge;
}

test("adding a source to the fresh copy keeps a change saved meanwhile", () => {
  // Read when the slow website add started.
  const stale = readKnowledge({ notes: "", sources: [] });
  // Saved while the site was being fetched: a PDF and a gap answer.
  const fresh = readKnowledge({
    notes: "",
    sources: [{ ...site, id: "pdf-1", kind: "pdf", title: "Menu" }],
    verified: [{ q: "Do you deliver?", a: "Within 20 miles." }],
  });
  // The old write path loses both.
  assert.deepEqual(add(stale, site).verified, []);
  // The new write path keeps both.
  const next = add(fresh, site);
  assert.deepEqual(next.sources?.map((s) => s.id), ["pdf-1", "site-1"]);
  assert.deepEqual(next.verified, [{ q: "Do you deliver?", a: "Within 20 miles." }]);
});

test("saveKnowledge re-reads the org right before it writes", () => {
  assert.match(
    ACTIONS,
    /async function saveKnowledge\(\s*orgId: string,\s*change: \(fresh: AssistantKnowledge\) => AssistantKnowledge,\s*\): Promise<void>/,
  );
  const body = ACTIONS.slice(ACTIONS.indexOf("async function saveKnowledge("));
  const read = body.indexOf("getOrganization(orgId)");
  const write = body.indexOf("updateOrganizationKnowledge(orgId");
  assert.ok(read > 0 && write > read, "saveKnowledge must read the org before the update");
  assert.ok(body.includes("change(readKnowledge(current.knowledge))"));
});

test("no action writes back the copy it read before its slow work", () => {
  // The only readKnowledge call left is the fresh one inside saveKnowledge.
  assert.equal(ACTIONS.match(/readKnowledge\(/g)?.length, 1);
  // All five callers pass a change function, not a finished blob.
  assert.equal(ACTIONS.match(/await saveKnowledge\(org\.id, \(fresh\) =>/g)?.length, 5);
});
