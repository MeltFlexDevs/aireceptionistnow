import test from "node:test";
import assert from "node:assert/strict";

import { appleSubMatches, appleSubs } from "./apple-id-token";

const CLIENT_ID = "com.aireceptionistnow.app";
const SUB = "001234.0a1b2c3d4e5f.1234";

/** An unsigned id_token: only the payload is read, so the signature is a dummy. */
function idToken(claims: Record<string, unknown>): string {
  const part = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${part({ alg: "RS256", kid: "test" })}.${part(claims)}.x`;
}

const apple = { iss: "https://appleid.apple.com", aud: CLIENT_ID, sub: SUB };

test("appleSubMatches is true for Apple's token for our client id and the same sub", () => {
  assert.equal(appleSubMatches(idToken(apple), SUB, CLIENT_ID), true);
  assert.equal(appleSubMatches(idToken({ ...apple, aud: [CLIENT_ID] }), SUB, CLIENT_ID), true, "aud as a list");
});

test("appleSubMatches is false for another sub, issuer or audience", () => {
  assert.equal(appleSubMatches(idToken(apple), "009999.ffffffffffff.9999", CLIENT_ID), false, "other sub");
  assert.equal(
    appleSubMatches(idToken({ ...apple, iss: "https://accounts.google.com" }), SUB, CLIENT_ID),
    false,
    "wrong iss",
  );
  assert.equal(appleSubMatches(idToken({ ...apple, aud: "com.example.other" }), SUB, CLIENT_ID), false, "wrong aud");
  assert.equal(appleSubMatches(idToken({ iss: apple.iss, aud: CLIENT_ID }), SUB, CLIENT_ID), false, "no sub");
});

test("appleSubMatches is false for a token it cannot read", () => {
  assert.equal(appleSubMatches("garbage", SUB, CLIENT_ID), false);
  assert.equal(appleSubMatches("a.b.c", SUB, CLIENT_ID), false, "payload is not JSON");
  assert.equal(appleSubMatches(`x.${Buffer.from("null").toString("base64url")}.x`, SUB, CLIENT_ID), false, "null");
  assert.equal(appleSubMatches(idToken({ ...apple, sub: "" }), "", CLIENT_ID), false, "an empty sub never matches");
});

test("appleSubs reads only Apple identities, from id and identity_data.sub", () => {
  assert.deepEqual(
    appleSubs([
      { provider: "email", id: "u1", identity_data: { sub: "u1" } },
      { provider: "apple", id: SUB, identity_data: { sub: SUB, email: "user@example.com" } },
    ]),
    [SUB],
  );
  assert.deepEqual(appleSubs([{ provider: "apple", id: "", identity_data: { sub: SUB } }]), [SUB], "sub only in data");
  assert.deepEqual(appleSubs([{ provider: "email", id: "u1" }]), [], "no Apple identity");
  assert.deepEqual(appleSubs(undefined), []);
});
