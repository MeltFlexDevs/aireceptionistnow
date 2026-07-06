import type { Locale } from "../config";
import { en, type Dictionary } from "./en";
import { es } from "./es";
import { de } from "./de";
import { fr } from "./fr";
import { sk } from "./sk";
import { it } from "./it";
import { pt } from "./pt";
import { nl } from "./nl";

// Static map (dictionaries are tiny). `satisfies` guarantees every locale in the
// config has a dictionary and every dictionary has the full English key set.
export const dictionaries = { en, es, de, fr, sk, it, pt, nl } satisfies Record<Locale, Dictionary>;
