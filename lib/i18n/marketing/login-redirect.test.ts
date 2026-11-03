import assert from "node:assert/strict";
import { test } from "node:test";

import { loginHomePath } from "./login-redirect";

const all = () => true;

test("the dash_locale cookie picks the locale home", () => {
  assert.equal(loginHomePath({ cookieLocale: "sk" }, all), "/sk");
});

test("the cookie wins over Accept-Language", () => {
  assert.equal(loginHomePath({ cookieLocale: "sk", acceptLanguage: "de-DE,de;q=0.9" }, all), "/sk");
  assert.equal(loginHomePath({ cookieLocale: "en", acceptLanguage: "de-DE" }, all), "/");
});

test("Accept-Language picks the best supported base language", () => {
  assert.equal(loginHomePath({ acceptLanguage: "de-DE,de;q=0.9" }, all), "/de");
  assert.equal(loginHomePath({ acceptLanguage: "xx,fr;q=0.5,sk;q=0.8" }, all), "/sk");
  assert.equal(loginHomePath({ acceptLanguage: "en-US,de;q=0.5" }, all), "/");
});

test("unknown or hostile values give /", () => {
  assert.equal(loginHomePath({ cookieLocale: "xx" }, all), "/");
  assert.equal(loginHomePath({ cookieLocale: "../evil" }, all), "/");
  assert.equal(loginHomePath({ acceptLanguage: "../evil,//x.com" }, all), "/");
});

test("an unknown cookie falls back to Accept-Language", () => {
  assert.equal(loginHomePath({ cookieLocale: "xx", acceptLanguage: "de" }, all), "/de");
});

test("no input gives /", () => {
  assert.equal(loginHomePath({}, all), "/");
  assert.equal(loginHomePath({ cookieLocale: null, acceptLanguage: null }, all), "/");
});

test("a locale whose home is not published gives /", () => {
  assert.equal(loginHomePath({ cookieLocale: "sk" }, (l) => l !== "sk"), "/");
});

test("the real publish gate is used by default", () => {
  assert.match(loginHomePath({ cookieLocale: "sk" }), /^\/(sk)?$/);
});
