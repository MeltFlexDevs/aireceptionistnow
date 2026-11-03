import assert from "node:assert/strict";
import { test } from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import SiteFooter from "@/app/components/SiteFooter";
import { UI_COPY } from "@/content/i18n/ui-registry";
import { navHrefs } from "./href";
import { MARKETING_LOCALES } from "./locales";

/** React escapes these in text and attributes. */
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

test("the English footer keeps its text and gains a Support link", () => {
  const html = renderToStaticMarkup(createElement(SiteFooter));
  for (const s of [">Resources<", ">AI Information<", ">Data protection<", ">Terms<", ">Support<", ">Voice Partner<"]) {
    assert.ok(html.includes(s), s);
  }
  for (const h of ["/support", "/privacy-policy", "/blog", "/blog/24-7-ai-receptionist", "/terms-of-service"]) {
    assert.ok(html.includes(`href="${h}"`), h);
  }
  assert.ok(html.includes('aria-label="Ask Claude about AI Receptionist Now"'));
  assert.ok(html.includes("<strong") && html.includes(">GDPR</strong> compliant"));
});

test("a localized footer has no English labels and stays in the locale", () => {
  for (const l of MARKETING_LOCALES) {
    const ui = UI_COPY[l];
    const nav = navHrefs(l);
    const html = renderToStaticMarkup(createElement(SiteFooter, { ui, nav }));
    for (const en of [">Resources<", ">AI Information<", ">Data protection<", ">Terms<", ">Ask AI about AI Receptionist Now<", ">Voice Partner<"]) {
      assert.ok(!html.includes(en), `${l}: ${en}`);
    }
    assert.ok(html.includes(`>${esc(ui.footer.support)}<`), `${l}: support label`);
    assert.ok(html.includes('href="/support"'), `${l}: support href`);
    for (const h of [nav.home, nav.blog, nav.receptionist247, nav.privacyPolicy]) {
      assert.ok(html.includes(`href="${h}"`), `${l}: ${h}`);
    }
    const askClaude = esc(ui.footer.askAiProvider.replace("{name}", "Claude"));
    assert.ok(html.includes(`aria-label="${askClaude}"`), `${l}: ask-AI aria-label`);
    assert.ok(html.includes(`>${esc(ui.footer.gdprMark)}</strong>`), `${l}: GDPR mark`);
  }
});

test("the laurel images are decorative and carry no English alt text", () => {
  const html = renderToStaticMarkup(createElement(SiteFooter));
  assert.ok(!html.includes("Laurel branch"));
  assert.ok(html.includes('src="/badges/leaf-left.svg" loading="lazy" alt=""'));
  assert.ok(html.includes('src="/badges/leaf-right.svg" loading="lazy" alt=""'));
});
