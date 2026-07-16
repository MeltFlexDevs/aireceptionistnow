import type { Locale } from "../config";
import { en, type Dictionary } from "./en";
import { es } from "./es";
import { de } from "./de";
import { fr } from "./fr";
import { sk } from "./sk";
import { it } from "./it";
import { pt } from "./pt";
import { nl } from "./nl";

export const dictionaries = { en, es, de, fr, sk, it, pt, nl } satisfies Record<Locale, Dictionary>;
