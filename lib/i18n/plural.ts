/**
 * A count string in the four CLDR plural forms. Languages without few or many
 * (en, de, es, fr, it, nl, pt) repeat `other` there. Slovak uses few for 2-4
 * and many only for decimals.
 */
export type PluralForms = { one: string; few: string; many: string; other: string };

/**
 * Picks the plural form of `n` for `locale` and fills `{n}` and `{count}` with
 * the number in that locale: plural("sk", 3, forms) -> "3 hovory".
 */
export function plural(locale: string, n: number, forms: PluralForms): string {
  const category = new Intl.PluralRules(locale).select(n);
  const template =
    category === "one" || category === "few" || category === "many" ? forms[category] : forms.other;
  const num = n.toLocaleString(locale);
  return template.replaceAll("{n}", num).replaceAll("{count}", num);
}
