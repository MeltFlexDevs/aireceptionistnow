import assert from "node:assert/strict";
import { test } from "node:test";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TimezoneSelect } from "@/app/(main)/dashboard/settings/TimezoneSelect";
import { I18nProvider } from "@/lib/i18n/client";
import { en } from "@/lib/i18n/dictionaries/en";

const zones = ["UTC", "America/Chicago", "Europe/Bratislava"];

// Server HTML must not depend on the process zone or the clock: the browser's
// first render has to produce the same text, or React throws #418.
function renderIn(tz: string, value: string): string {
  const saved = process.env.TZ;
  process.env.TZ = tz;
  try {
    return renderToStaticMarkup(
      createElement(
        AppRouterContext.Provider,
        { value: {} as never },
        // eslint-disable-next-line react/no-children-prop -- createElement typing needs children in props
        createElement(I18nProvider, {
          value: { locale: "en", dict: en },
          children: createElement(TimezoneSelect, { value, className: "", zones }),
        }),
      ),
    );
  } finally {
    if (saved === undefined) delete process.env.TZ;
    else process.env.TZ = saved;
  }
}

test("server HTML without an account zone is UTC and has no clock, in any process zone", () => {
  const utc = renderIn("UTC", "");
  const chicago = renderIn("America/Chicago", "");
  assert.equal(chicago, utc);
  assert.match(utc, /<option value="UTC" selected="">/);
  assert.doesNotMatch(utc, /there now/);
});

test("server HTML keeps a valid account zone and has no clock", () => {
  const html = renderIn("America/Chicago", "Europe/Bratislava");
  assert.match(html, /<option value="Europe\/Bratislava" selected="">/);
  assert.doesNotMatch(html, /there now/);
});
