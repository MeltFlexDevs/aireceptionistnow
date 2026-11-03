import assert from "node:assert/strict";
import { test } from "node:test";

import { enUi } from "@/content/i18n/en/ui";
import { UI_COPY } from "@/content/i18n/ui-registry";
import { localizedHref, navHrefs } from "./href";
import { localizedPageIdToPath } from "./ids";
import { MARKETING_LOCALES } from "./locales";
import { EN_NAV_HREFS } from "./nav";

const NEW_FOOTER_KEYS = [
  "terms", "support", "blog", "answers", "receptionist247",
  "askAi", "askAiProvider", "voicePartner", "gdprMark", "gdprCompliant",
] as const;

test("English footer hrefs are the English pages", () => {
  assert.equal(navHrefs("en"), EN_NAV_HREFS);
  assert.equal(EN_NAV_HREFS.blog, "/blog");
  assert.equal(EN_NAV_HREFS.receptionist247, "/blog/24-7-ai-receptionist");
  assert.equal(EN_NAV_HREFS.privacyPolicy, "/privacy-policy");
});

test("localized footer hrefs stay in the locale when a translation is published", () => {
  for (const l of MARKETING_LOCALES) {
    const nav = navHrefs(l);
    assert.equal(nav.blog, localizedHref(l, "blog"), l);
    assert.equal(nav.privacyPolicy, localizedHref(l, "privacy-policy"), l);
    // All 7 locales have the 24/7 article today (blogPostLocales), so no locale may
    // send its footer to the English article.
    assert.equal(nav.receptionist247, localizedPageIdToPath(l, "blog/24-7-ai-receptionist"), l);
    assert.ok(nav.receptionist247.startsWith(`/${l}/blog/`), l);
  }
});

test("every locale fills the new footer keys", () => {
  for (const [l, ui] of Object.entries(UI_COPY)) {
    for (const k of NEW_FOOTER_KEYS) assert.ok(ui.footer[k].trim().length > 0, `${l}.footer.${k}`);
    assert.ok(ui.footer.askAiProvider.includes("{name}"), `${l}.footer.askAiProvider needs {name}`);
    assert.equal(ui.footer.gdprCompliant.split(ui.footer.gdprMark).length, 2, `${l}.footer.gdprCompliant must contain gdprMark once`);
  }
});

test("the English footer copy is the old hardcoded text", () => {
  assert.deepEqual(
    Object.fromEntries(NEW_FOOTER_KEYS.map((k) => [k, enUi.footer[k]])),
    {
      terms: "Terms",
      support: "Support",
      blog: "Blog",
      answers: "Answers",
      receptionist247: "24/7 AI Receptionist",
      askAi: "Ask AI about AI Receptionist Now",
      askAiProvider: "Ask {name} about AI Receptionist Now",
      voicePartner: "Voice Partner",
      gdprMark: "GDPR",
      gdprCompliant: "GDPR compliant",
    },
  );
});

test("translated footer labels are not left in English", () => {
  for (const l of MARKETING_LOCALES) {
    for (const k of ["terms", "askAi", "receptionist247", "voicePartner"] as const) {
      assert.notEqual(UI_COPY[l].footer[k], enUi.footer[k], `${l}.footer.${k}`);
    }
  }
});
