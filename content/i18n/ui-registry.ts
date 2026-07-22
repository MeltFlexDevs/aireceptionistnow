import type { ContentLocale } from "@/lib/i18n/marketing/locales";
import type { UiCopy } from "./_ui-copy";
import { enUi } from "./en/ui";
import { deUi } from "./de/ui";
import { esUi } from "./es/ui";
import { frUi } from "./fr/ui";
import { itUi } from "./it/ui";
import { nlUi } from "./nl/ui";
import { ptUi } from "./pt/ui";
import { skUi } from "./sk/ui";

// Site chrome copy, keyed by locale. A total Record over ContentLocale, so
// adding a locale without adding its ui.ts is a compile error rather than a
// localized page silently rendering an English header.
export const UI_COPY: Record<ContentLocale, UiCopy> = {
  en: enUi,
  es: esUi,
  de: deUi,
  fr: frUi,
  sk: skUi,
  it: itUi,
  pt: ptUi,
  nl: nlUi,
};
