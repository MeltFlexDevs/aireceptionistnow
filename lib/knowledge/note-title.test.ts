import assert from "node:assert/strict";
import { test } from "node:test";

import { noteTitle } from "./sources";

test("a short first line is kept as is", () => {
  assert.equal(noteTitle("Closed on Sundays.", "Note"), "Closed on Sundays.");
});

test("an empty or blank note gets the fallback", () => {
  assert.equal(noteTitle("\n   \n", "Note"), "Note");
  assert.equal(noteTitle("", "What I told it"), "What I told it");
});

test("the first non-blank line is trimmed and used", () => {
  assert.equal(noteTitle("\n  Opening hours  \nMore text", "Note"), "Opening hours");
});

test("a long line is cut at a word with an ellipsis", () => {
  const result = noteTitle("We are closed on public holidays. Free parking behind the clinic.", "Note");
  assert.equal(result, "We are closed on public holidays. Free parking…");
  assert.ok(result.length <= 50);
});

test("a trailing comma is dropped before the ellipsis", () => {
  const result = noteTitle("Monday to Friday 8-17, Saturday 9-12, Sundays, closed on holidays", "Note");
  assert.equal(result, "Monday to Friday 8-17, Saturday 9-12, Sundays…");
  assert.ok(result.length <= 50);
});

test("one long word is cut by length", () => {
  const result = noteTitle("https://example.com/" + "a".repeat(60), "Note");
  assert.equal(result, "https://example.com/" + "a".repeat(29) + "…");
  assert.ok(result.length <= 50);
});

test("a line of exactly max characters is unchanged", () => {
  assert.equal(noteTitle("a".repeat(50), "Note"), "a".repeat(50));
});

test("a word that ends exactly at the cut is kept", () => {
  const result = noteTitle("Open Monday to Friday from eight until five pm ok and more", "Note");
  assert.equal(result, "Open Monday to Friday from eight until five pm ok…");
  assert.equal(result.length, 50);
});

test("a line of only dashes gets the fallback", () => {
  assert.equal(noteTitle("-".repeat(60), "Note"), "Note");
});
