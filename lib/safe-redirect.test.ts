import test from "node:test";
import assert from "node:assert/strict";

import { authConfirmRedirects, resolveSameOriginNext, sameOriginNextPath } from "./safe-redirect";

const ORIGIN = "https://aireceptionistnow.com";

test("a plain path resolves on the same origin", () => {
  assert.equal(resolveSameOriginNext("/dashboard/calendar", ORIGIN), `${ORIGIN}/dashboard/calendar`);
});

test("the query string survives - '?' is not percent-encoded into the path (CAL-1)", () => {
  // Exactly what /auth/confirm receives from a calendar Connect handoff after
  // one round of decoding: the connect route's own `next` must still be a query.
  const next = "/api/integrations/google/connect?next=%2Fmobile%2Fdone%3Freturn%3Daireceptionistnow%253A%252F%252Fhandoff";
  const href = resolveSameOriginNext(next, ORIGIN);
  assert.equal(href, `${ORIGIN}${next}`);
  const url = new URL(href);
  assert.equal(url.pathname, "/api/integrations/google/connect");
  assert.equal(url.searchParams.get("next"), "/mobile/done?return=aireceptionistnow%3A%2F%2Fhandoff");
});

test("several parameters joined with '&' are all kept", () => {
  const href = resolveSameOriginNext("/onboarding?step=3&connected=1", ORIGIN);
  const url = new URL(href);
  assert.equal(url.pathname, "/onboarding");
  assert.equal(url.searchParams.get("step"), "3");
  assert.equal(url.searchParams.get("connected"), "1");
});

test("a hash fragment is kept", () => {
  assert.equal(resolveSameOriginNext("/dashboard#calls", ORIGIN), `${ORIGIN}/dashboard#calls`);
});

test("protocol-relative '//evil.com' falls back", () => {
  assert.equal(resolveSameOriginNext("//evil.com/x", ORIGIN), `${ORIGIN}/dashboard`);
});

test("'/\\evil.com' falls back - the URL parser reads it like '//evil.com'", () => {
  assert.equal(resolveSameOriginNext("/\\evil.com", ORIGIN), `${ORIGIN}/dashboard`);
  assert.equal(resolveSameOriginNext("/x\\y", ORIGIN), `${ORIGIN}/dashboard`);
});

test("absolute URLs and schemes fall back", () => {
  assert.equal(resolveSameOriginNext("https://evil.com/", ORIGIN), `${ORIGIN}/dashboard`);
  assert.equal(resolveSameOriginNext("javascript:alert(1)", ORIGIN), `${ORIGIN}/dashboard`);
  assert.equal(resolveSameOriginNext("dashboard", ORIGIN), `${ORIGIN}/dashboard`);
});

test("CR/LF fall back (header injection)", () => {
  assert.equal(resolveSameOriginNext("/a\r\nSet-Cookie: x=1", ORIGIN), `${ORIGIN}/dashboard`);
  assert.equal(resolveSameOriginNext("/a\nb", ORIGIN), `${ORIGIN}/dashboard`);
});

test("a tab the parser strips cannot smuggle in a second slash", () => {
  // new URL() removes tabs, so "/\t/evil.com" would parse as "//evil.com";
  // the origin check catches what the string checks cannot.
  assert.equal(resolveSameOriginNext("/\t/evil.com", ORIGIN), `${ORIGIN}/dashboard`);
});

test("missing or empty next uses the fallback, which may be overridden", () => {
  assert.equal(resolveSameOriginNext(null, ORIGIN), `${ORIGIN}/dashboard`);
  assert.equal(resolveSameOriginNext(undefined, ORIGIN), `${ORIGIN}/dashboard`);
  assert.equal(resolveSameOriginNext("", ORIGIN), `${ORIGIN}/dashboard`);
  assert.equal(resolveSameOriginNext("//x", ORIGIN, "/onboarding"), `${ORIGIN}/onboarding`);
});

test("/auth/confirm: a valid token lands on next WITH its own ?next= intact", () => {
  // The calendar handoff URL as lib/mobile/link.ts builds it.
  const next = "/api/integrations/google/connect?next=%2Fmobile%2Fdone";
  const confirm =
    `${ORIGIN}/auth/confirm?token_hash=abc&type=magiclink&next=${encodeURIComponent(next)}`;
  const { success } = authConfirmRedirects(confirm);
  assert.equal(success, `${ORIGIN}/api/integrations/google/connect?next=%2Fmobile%2Fdone`);
  assert.equal(new URL(success).searchParams.get("next"), "/mobile/done");
  assert.equal(new URL(success).searchParams.get("token_hash"), null);
});

test("/auth/confirm: the failure exit drops the token and next, keeps the rest", () => {
  const { failure } = authConfirmRedirects(
    `${ORIGIN}/auth/confirm?token_hash=abc&type=magiclink&next=%2Fdashboard&lang=de`,
  );
  const url = new URL(failure);
  assert.equal(url.origin + url.pathname, `${ORIGIN}/auth/auth-error`);
  assert.equal(url.searchParams.get("token_hash"), null);
  assert.equal(url.searchParams.get("type"), null);
  assert.equal(url.searchParams.get("next"), null);
  assert.equal(url.searchParams.get("lang"), "de");
});

test("/auth/confirm: other request parameters ride along, the target's own win", () => {
  const next = "/api/integrations/google/connect?next=%2Fmobile%2Fdone&lang=en";
  const { success } = authConfirmRedirects(
    `${ORIGIN}/auth/confirm?token_hash=abc&type=magiclink&next=${encodeURIComponent(next)}&lang=de&ref=mail`,
  );
  const url = new URL(success);
  assert.equal(url.pathname, "/api/integrations/google/connect");
  assert.equal(url.searchParams.get("next"), "/mobile/done");
  assert.deepEqual(url.searchParams.getAll("lang"), ["en"]);
  assert.equal(url.searchParams.get("ref"), "mail");
  assert.equal(url.searchParams.get("token_hash"), null);
  assert.equal(url.searchParams.get("type"), null);
});

test("/auth/confirm: an off-site next lands on the dashboard", () => {
  const { success } = authConfirmRedirects(
    `${ORIGIN}/auth/confirm?token_hash=abc&type=magiclink&next=${encodeURIComponent("//evil.com")}`,
  );
  assert.equal(success, `${ORIGIN}/dashboard`);
});

test("origin may be given as any URL on that origin", () => {
  const href = resolveSameOriginNext("/dashboard?a=1", "http://localhost:3000/auth/confirm?token_hash=x");
  assert.equal(href, "http://localhost:3000/dashboard?a=1");
});

test("sign-in dialog: a same-origin next stays a path, query and hash kept", () => {
  assert.equal(sameOriginNextPath("/onboarding"), "/onboarding");
  assert.equal(sameOriginNextPath("/pricing?plan=pro"), "/pricing?plan=pro");
  assert.equal(
    sameOriginNextPath("/dashboard/billing?plan=pro&interval=year#faq"),
    "/dashboard/billing?plan=pro&interval=year#faq",
  );
});

test("sign-in dialog: off-site, script and protocol-relative next fall back (W5)", () => {
  for (const next of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
    "/\t/evil.example",
    "dashboard",
  ]) {
    assert.equal(sameOriginNextPath(next), "/dashboard", next);
  }
});

test("sign-in dialog: dot segments cannot collapse next into '//host'", () => {
  assert.equal(sameOriginNextPath("/.//evil.example"), "/dashboard");
  assert.equal(sameOriginNextPath("/x/..//evil.example"), "/dashboard");
});

test("sign-in dialog: a missing next uses the fallback, which may be overridden", () => {
  assert.equal(sameOriginNextPath(null), "/dashboard");
  assert.equal(sameOriginNextPath(undefined), "/dashboard");
  assert.equal(sameOriginNextPath(""), "/dashboard");
  assert.equal(sameOriginNextPath("https://evil.example", "/onboarding"), "/onboarding");
});
