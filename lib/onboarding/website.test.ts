import assert from "node:assert/strict";
import { test } from "node:test";

import { looksLikeWebsite, normalizeWebsite } from "./website";

test("normalizeWebsite keeps a website as typed, trimmed", () => {
  assert.equal(normalizeWebsite("example.com"), "example.com");
  assert.equal(normalizeWebsite("  https://example.com/x  "), "https://example.com/x");
  assert.equal(normalizeWebsite("HTTPS://Example.COM"), "HTTPS://Example.COM");
});

test("normalizeWebsite returns an empty string for an empty field", () => {
  assert.equal(normalizeWebsite(""), "");
  assert.equal(normalizeWebsite("   "), "");
});

test("normalizeWebsite returns null for text that is not a website", () => {
  for (const text of [
    "my company",
    "localhost",
    "bakery",
    "ftp://x.com",
    "info@bakery.com",
    "mailto:a@b.com",
    "javascript:alert(1)",
    "192.168.0.1",
    ".example.com",
    "example.com.",
    "https://my company.com",
    "example.c0m",
    "https://",
  ]) {
    assert.equal(normalizeWebsite(text), null, text);
  }
});

test("normalizeWebsite keeps valid websites of any script", () => {
  for (const text of [
    "www.example.com",
    "example.co.uk",
    "example.भारत",
    "example.рф",
    "münchen.de",
    "xn--mnchen-3ya.de",
    "example。com",
    "example.com:8080",
    "example.com/path?q=1",
  ]) {
    assert.equal(normalizeWebsite(text), text, text);
  }
});

test("normalizeWebsite gives the same answer as the app for an empty inner label", () => {
  // Same answer as the app's rule (an empty inner label passes both). Close it
  // in both repos together.
  assert.equal(normalizeWebsite("a..com"), "a..com");
});

test("looksLikeWebsite is false for an empty string", () => {
  assert.equal(looksLikeWebsite(""), false);
});
