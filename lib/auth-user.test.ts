import assert from "node:assert/strict";
import { test } from "node:test";
import { toAppUser } from "./auth-user";

test("a saved settings name wins over the email handle", () => {
  const u = toAppUser({ sub: "u1", email: "a-comp1@example.com" }, "Mike Torres Kovac");
  assert.equal(u.name, "Mike Torres Kovac");
  assert.equal(u.initials, "MT");
});

test("a blank saved name falls back to the email handle", () => {
  assert.equal(toAppUser({ sub: "u1", email: "a-comp1@example.com" }, "  ").name, "a-comp1");
});

test("without a saved name the metadata name is kept", () => {
  const u = toAppUser({ sub: "u1", email: "x@example.com", user_metadata: { full_name: "Meta Name" } });
  assert.equal(u.name, "Meta Name");
});
