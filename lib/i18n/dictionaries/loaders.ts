import type { Locale } from "../config";
import type { Dictionary } from "./en";

// Per-locale lazy chunks: the client downloads a dictionary only when the user
// switches to it (the active locale arrives via the server prop), so the
// initial bundle still ships zero extra dictionaries.
export const dictionaryLoaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./en").then((m) => m.en),
  es: () => import("./es").then((m) => m.es),
  de: () => import("./de").then((m) => m.de),
  fr: () => import("./fr").then((m) => m.fr),
  sk: () => import("./sk").then((m) => m.sk),
  it: () => import("./it").then((m) => m.it),
  pt: () => import("./pt").then((m) => m.pt),
  nl: () => import("./nl").then((m) => m.nl),
};
