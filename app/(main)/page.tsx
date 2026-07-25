import type { Metadata } from "next";

import { alternatesFor } from "@/lib/i18n/marketing/alternates";
import { localeOptions } from "@/lib/i18n/marketing/switcher";
import HomeClient from "../_home/HomeClient";
import { HomeExplore } from "../_home/HomeExplore";

// The home page body is a client component, so it cannot export metadata. The
// canonical used to come from a site-wide `alternates` default on the root
// layout, which meant every page that forgot its own canonical silently
// inherited the home page's. This owns it explicitly instead, and leaves the
// root layout with no canonical to leak.
//
// alternatesFor emits just the canonical while no translation is reviewed, and
// starts emitting the hreflang cluster automatically on the commit that
// approves one. The English page never needs editing again for that to happen.
export const metadata: Metadata = {
  alternates: alternatesFor("home", "en"),
};

export default function Page() {
  return (
    <HomeClient
      localeOptions={localeOptions("home", "en")}
      relatedResources={<HomeExplore />}
    />
  );
}
