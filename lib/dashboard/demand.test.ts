import test from "node:test";
import assert from "node:assert/strict";

import { clusterDemand } from "./demand";

const q = (topic: string, quote = "") => ({ topic, quote });

test("a repeated request becomes one cluster with a count", () => {
  const out = clusterDemand([
    q("Saturday appointments", "Do you open Saturdays?"),
    q("saturday appointments", "Are you there on a Saturday?"),
    q("Saturday appointments.", "Any chance of a Saturday?"),
  ]);
  assert.equal(out.length, 1);
  assert.equal(out[0].count, 3);
});

test("a one-off is not a pattern and is left out", () => {
  // The whole point of the weekly report is that it only says something when
  // there is something to say. One caller asking one thing is not a finding.
  assert.deepEqual(clusterDemand([q("gold plating", "Do you gold plate?")]), []);
});

test("case, accents and trailing punctuation do not split a cluster", () => {
  const out = clusterDemand([
    q("Príplatok za víkend"),
    q("príplatok za vikend"),
    q("PRÍPLATOK ZA VÍKEND!"),
  ]);
  assert.equal(out.length, 1, "an accent difference must not fragment a real pattern");
  assert.equal(out[0].count, 3);
});

test("the topic shown is the operator's own wording, not the normalized key", () => {
  const out = clusterDemand([q("Emergency callout"), q("emergency callout")]);
  assert.equal(out[0].topic, "Emergency callout");
});

test("clusters are ordered by how often they came up", () => {
  const out = clusterDemand([
    q("evening slots"),
    q("evening slots"),
    q("home visits"),
    q("home visits"),
    q("home visits"),
    q("home visits"),
  ]);
  assert.deepEqual(
    out.map((c) => [c.topic, c.count]),
    [
      ["home visits", 4],
      ["evening slots", 2],
    ],
  );
});

test("at most two quotes ride along per cluster, and empty ones are skipped", () => {
  // Evidence, not a transcript: enough to check the finding against a real call
  // without turning the email into a wall of text.
  const out = clusterDemand([
    q("late pickup", "Can I collect it at 8?"),
    q("late pickup", ""),
    q("late pickup", "Do you stay open past six?"),
    q("late pickup", "What about half seven?"),
  ]);
  assert.equal(out[0].count, 4);
  assert.deepEqual(out[0].quotes, ["Can I collect it at 8?", "Do you stay open past six?"]);
});

test("a report never runs longer than six findings", () => {
  const rows = Array.from({ length: 20 }, (_, i) => [q(`topic ${i}`), q(`topic ${i}`)]).flat();
  assert.equal(clusterDemand(rows).length, 6);
});

test("an empty topic is dropped rather than forming a blank cluster", () => {
  assert.deepEqual(clusterDemand([q("", "a"), q("  ", "b"), q("!!!", "c")]), []);
});
