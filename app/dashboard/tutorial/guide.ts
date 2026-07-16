import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export type IconKey =
  | "grid"
  | "phone"
  | "calendar"
  | "chart"
  | "building"
  | "bot"
  | "hash"
  | "plug"
  | "sparkle"
  | "gear";

type NavKey = keyof Dictionary["nav"];
export type SectionKey = keyof Dictionary["tutorial"]["sections"];

export interface GuideSection {
  id: SectionKey;
  icon: IconKey;
  href: string;
  navKey: NavKey;
  group: "monitor" | "setup" | null;
  readOnly?: boolean;
}

export const SECTIONS: GuideSection[] = [
  { id: "overview", icon: "grid", href: "/dashboard", navKey: "overview", group: "monitor" },
  { id: "calls", icon: "phone", href: "/dashboard/calls", navKey: "calls", group: "monitor", readOnly: true },
  { id: "calendar", icon: "calendar", href: "/dashboard/calendar", navKey: "calendar", group: "monitor", readOnly: true },
  { id: "analytics", icon: "chart", href: "/dashboard/analytics", navKey: "analytics", group: "monitor", readOnly: true },
  { id: "organizations", icon: "building", href: "/dashboard/organizations", navKey: "organizations", group: "setup" },
  { id: "assistant", icon: "bot", href: "/dashboard/assistant", navKey: "assistants", group: "setup" },
  { id: "numbers", icon: "hash", href: "/dashboard/numbers", navKey: "numbers", group: "setup" },
  { id: "integrations", icon: "plug", href: "/dashboard/integrations", navKey: "integrations", group: "setup" },
  // Not in the nav - it's the sidebar's own card, so it needs a spelled-out spot.
  { id: "knowledge", icon: "sparkle", href: "/dashboard/knowledge", navKey: "aiKnows", group: null, readOnly: true },
  { id: "settings", icon: "gear", href: "/dashboard/settings", navKey: "settings", group: "setup" },
];

export const QUICK_START_HREFS = [
  "/dashboard/organizations",
  "/dashboard/integrations",
  "/dashboard/assistant",
  "/dashboard/calls",
];

export function whereOf(section: GuideSection, t: Dictionary): string {
  if (!section.group) return t.tutorial.knowledgeWhere;
  return `${t.nav[section.group]} → ${t.nav[section.navKey]}`;
}
