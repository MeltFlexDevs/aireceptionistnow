/**
 * Generates the localized blog: one TSX module per (article, locale) under
 * content/i18n/{locale}/blog/, plus that locale's index.
 *
 *   node --import tsx scripts/translate-blog.ts                      # everything missing
 *   node --import tsx scripts/translate-blog.ts --locale de,sk       # some locales
 *   node --import tsx scripts/translate-blog.ts --slug dental-answering-service
 *   node --import tsx scripts/translate-blog.ts --force              # redo existing files
 *   node --import tsx scripts/translate-blog.ts --index-only         # just rebuild the indexes
 *   node --import tsx scripts/translate-blog.ts --repair             # re-apply the mechanical fixes, no model calls
 *   node --import tsx scripts/translate-blog.ts --fix-meta           # re-trim over-length titles/descriptions only
 *
 * WHY A GENERATOR AND NOT HAND-WRITTEN FILES
 * 36 articles x 7 locales is ~245 modules and ~120k lines of prose. The output
 * is committed to git like every other translation in content/i18n, so the
 * build stays hermetic and a reviewer reviews a diff; this script is how those
 * files come into existence and how they are refreshed when an English article
 * changes. It is not part of the build.
 *
 * WHAT THE MODEL IS AND IS NOT TRUSTED WITH
 * The model translates prose. Everything that can be decided mechanically is
 * decided here, after it answers, because a translator guessing at a URL or a
 * citation is a silent SEO bug:
 *   - the localized slug comes from BLOG_SLUGS, not from the model
 *   - internal hrefs are rewritten from the same map plus localizedHref()
 *   - the `sources` citation block is spliced back in byte-for-byte from the
 *     English file: those are titles of English documents and translating them
 *     would misquote them
 *   - the three prose headings come from BLOG_COPY.prose
 * Output is then structurally diffed against the English source (section ids,
 * anchor ids, paragraph/list/link counts) and rejected on mismatch, so a
 * dropped paragraph or a lost link fails loudly instead of shipping.
 */

import "dotenv/config";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

import { BLOG_COPY } from "../content/i18n/blog-registry";
import {
  BLOG_SLUGS,
  TRANSLATABLE_BLOG_SLUGS,
  type TranslatableBlogSlug,
} from "../lib/i18n/marketing/blog-slugs";
import { localizedHref } from "../lib/i18n/marketing/href";
import {
  MARKETING_LOCALES,
  type MarketingLocale,
} from "../lib/i18n/marketing/locales";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EN_DIR = path.join(ROOT, "app/(main)/blog/_posts");

const LANGUAGE: Record<MarketingLocale, string> = {
  de: "German (Germany)",
  es: "Spanish (Spain)",
  fr: "French (France)",
  sk: "Slovak",
  it: "Italian (Italy)",
  pt: "European Portuguese (Portugal, not Brazilian)",
  nl: "Dutch (Netherlands)",
};

// Register and product terminology, inherited from the reviewed home/pricing
// copy so an article cannot invent a second name for the product.
const VOICE: Record<MarketingLocale, string> = {
  de: 'Formal "Sie". The product is a "KI-Telefonassistent". Answering service is "Telefonservice".',
  es: 'Formal "usted". The product is a "recepcionista con IA". Answering service is "servicio de atencion telefonica".',
  fr: 'Formal "vous". The product is a "standardiste IA". Answering service is "permanence telephonique".',
  sk: 'Formal "vy" (vykanie). The product is an "AI recepcna". Answering service is "telefonicka odkazova sluzba".',
  it: 'Formal "lei". The product is a "receptionist AI". Answering service is "servizio di risposta telefonica".',
  pt: 'Formal third person. European Portuguese spelling ("rececionista", "receçao", "telemovel"). The product is a "rececionista com IA".',
  nl: 'Formal "u". The product is an "AI-receptionist". Answering service is "telefoonservice".',
};

// The two category labels, fixed per locale so 36 articles agree.
const TAGS: Record<MarketingLocale, Record<string, string>> = {
  de: { Guides: "Ratgeber", Industries: "Branchen" },
  es: { Guides: "Guias", Industries: "Sectores" },
  fr: { Guides: "Guides", Industries: "Secteurs" },
  sk: { Guides: "Navody", Industries: "Odvetvia" },
  it: { Guides: "Guide", Industries: "Settori" },
  pt: { Guides: "Guias", Industries: "Setores" },
  nl: { Guides: "Gidsen", Industries: "Branches" },
};

// ---------------------------------------------------------------- CLI

type Args = {
  locales: MarketingLocale[];
  slugs: TranslatableBlogSlug[];
  force: boolean;
  indexOnly: boolean;
  repair: boolean;
  fixMeta: boolean;
  concurrency: number;
  model: string;
  retries: number;
};

function parseArgs(argv: string[]): Args {
  const get = (name: string): string | undefined => {
    const i = argv.indexOf(`--${name}`);
    return i === -1 ? undefined : argv[i + 1];
  };
  const localeArg = get("locale");
  const slugArg = get("slug");

  const locales = localeArg
    ? (localeArg.split(",") as MarketingLocale[])
    : [...MARKETING_LOCALES];
  for (const l of locales) {
    if (!MARKETING_LOCALES.includes(l)) throw new Error(`unknown locale: ${l}`);
  }

  const slugs = slugArg
    ? (slugArg.split(",") as TranslatableBlogSlug[])
    : [...TRANSLATABLE_BLOG_SLUGS];
  for (const s of slugs) {
    if (!TRANSLATABLE_BLOG_SLUGS.includes(s)) {
      throw new Error(`unknown or untranslatable slug: ${s}`);
    }
  }

  return {
    locales,
    slugs,
    force: argv.includes("--force"),
    indexOnly: argv.includes("--index-only"),
    repair: argv.includes("--repair"),
    fixMeta: argv.includes("--fix-meta"),
    concurrency: Number(get("concurrency") ?? 4),
    model: get("model") ?? process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    retries: Number(get("retries") ?? 3),
  };
}

// ------------------------------------------------------- source analysis

/** Counts of the JSX components whose loss would be content loss, not style. */
const STRUCTURAL_TAGS = [
  "Lead",
  "P",
  "H2",
  "H3",
  "UL",
  "OL",
  "LI",
  "Callout",
  "Figure",
  "VideoEmbed",
  "Table",
  "KeyTakeaways",
  "FAQList",
  "Sources",
  "Ext",
  "Internal",
] as const;

type Shape = {
  tags: Record<string, number>;
  /** `id: "x"` values from meta.sections, in order. */
  sectionIds: string[];
  /** `id="x"` anchor targets in the body. */
  anchorIds: string[];
  faqCount: number;
};

function countTag(code: string, tag: string): number {
  return (code.match(new RegExp(`<${tag}(?=[\\s/>])`, "g")) ?? []).length;
}

function block(code: string, start: string, end: string): string | undefined {
  const i = code.indexOf(start);
  if (i === -1) return undefined;
  const j = code.indexOf(end, i + start.length);
  return j === -1 ? undefined : code.slice(i, j + end.length);
}

function shapeOf(code: string): Shape {
  const sections = block(code, "sections: [", "],") ?? "";
  const faqs = block(code, "faqs: [", "] satisfies FaqItem[]") ?? "";
  return {
    tags: Object.fromEntries(
      STRUCTURAL_TAGS.map((t) => [t, countTag(code, t)]),
    ),
    sectionIds: [...sections.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]),
    anchorIds: [...code.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]),
    faqCount: (faqs.match(/^\s*q:/gm) ?? []).length,
  };
}

/** Human-readable list of the ways `got` differs from `want`, or [] if it matches. */
function shapeDiff(want: Shape, got: Shape): string[] {
  const out: string[] = [];
  for (const tag of STRUCTURAL_TAGS) {
    if (want.tags[tag] !== got.tags[tag]) {
      out.push(
        `<${tag}> appears ${got.tags[tag]} times, the English article has ${want.tags[tag]}`,
      );
    }
  }
  if (want.sectionIds.join(",") !== got.sectionIds.join(",")) {
    out.push(
      `meta.sections ids must stay exactly [${want.sectionIds.join(", ")}] - they are anchor targets, not prose; got [${got.sectionIds.join(", ")}]`,
    );
  }
  const missingAnchors = want.anchorIds.filter((id) => !got.anchorIds.includes(id));
  if (missingAnchors.length) {
    out.push(`missing id="..." anchors: ${missingAnchors.join(", ")}`);
  }
  if (want.faqCount !== got.faqCount) {
    out.push(`meta.faqs has ${got.faqCount} entries, the English article has ${want.faqCount}`);
  }
  return out;
}

// ------------------------------------------------------------- prompt

function systemPrompt(locale: MarketingLocale): string {
  const copy = BLOG_COPY[locale];
  return `You localize marketing articles for AI Receptionist Now, a European SaaS that answers business phone calls with an AI receptionist. You translate one React TSX module at a time into ${LANGUAGE[locale]}.

Return ONLY the complete TSX file. No markdown fences, no commentary.

VOICE
${VOICE[locale]}
Write as a native marketer would, not as a translator: idiomatic, plain, confident. The English is deliberately skeptical and honest about what the product cannot do - keep that tone, never inflate it into hype.

WHAT YOU MUST NOT CHANGE
- Every JSX tag, its nesting, and its attributes other than human-readable text. Same components, same order, same count.
- id="..." values and meta.sections ids. They are anchor targets; translating one breaks the table of contents.
- All numbers, prices, percentages, dates and currency symbols. "$3.50 a minute" stays "$3.50" - it is a cited US figure, not our pricing. Never convert currencies.
- href="..." values, image paths, className values, code identifiers.
- The "const sources" array: leave it exactly as it is, titles included. Those are titles of English documents.
- Product and software names: Dentrix, Eaglesoft, Open Dental, Twilio, Google Calendar, ElevenLabs, AI Receptionist Now.

US-SPECIFIC REFERENCES - THE MOST IMPORTANT PART OF THIS JOB
The English was written for a US reader. Translating its compliance advice word for word produces an article that is simply wrong for this audience: a European dentist does not need a HIPAA agreement. Apply exactly these substitutions and nothing beyond them:

- HIPAA. The reader's own obligation is the GDPR, not HIPAA. Where the source says the reader must sign a HIPAA business associate agreement, say instead that they must have a data processing agreement (a GDPR Article 28 processor contract) with the provider before it handles patient calls, and that the provider must process the data only on their instructions. You may mention HIPAA once, marked as American, when the sentence is about US practices. Never tell this reader that HIPAA applies to them.
- Protected health information / PHI becomes health data as a special category of personal data under the GDPR.
- Robocall and AI-disclosure rules. The FCC and TCPA are American. State the duty plainly instead: callers must be told they are speaking to an AI, and the service must honour a caller's request for a human. Attribute the FCC/TCPA specifics to the US if you keep them.
- Emergency numbers: never tell a European reader to dial 911. Write "112" as the emergency number, adding "(911 in the US)" only where the source is describing US practice. Keep the surrounding safety advice identical.
- Money: our own plan prices are in euros. Third-party costs quoted from US research stay exactly as written, dollar sign included, and stay attributed to that research.
- Keep every US research citation (Harvard Business Review, BLS, FTC, FCC, HHS, professional associations) as evidence - the underlying finding travels. The linked pages stay in English; that is expected of a source.

Do not go further than the list above. Do not cite article numbers, deadlines or penalties that the English source does not contain, do not name national regulators, and do not add legal advice of your own. Where in doubt, describe the obligation in plain words rather than naming a law.

KEYWORDS AND TITLE MUST FOLLOW THE SAME RULE
Never put a US statute in meta.keywords, meta.title or meta.description for this market - "HIPAA answering service" has no search volume here. Use the local equivalent ("GDPR", "DSGVO", "RGPD") or drop the compliance angle from the keyword entirely.

META FIELDS
- source: the English slug, unchanged.
- slug: exactly the localized slug given in the task.
- title: a SERP title in ${LANGUAGE[locale]}, at most 60 characters, leading with the term the market actually searches for. Not a literal translation of the English title.
- description: at most 155 characters, written to earn the click.
- readingTime: localize the unit, e.g. "${locale === "de" ? "12 Min. Lesezeit" : locale === "fr" ? "12 min de lecture" : "12 min"}" - keep the same number.
- tag: use exactly the label given in the task.
- keywords: 5-7 real search phrases in ${LANGUAGE[locale]}. Terms people type, not word-for-word translations.
- sections[].title and faqs: translate the prose, keep the count and the ids.

FILE SHAPE
Start with the import of the prose components from "@/app/(main)/blog/_components/prose", then \`import type { PostCopy } from "@/content/i18n/_post-copy";\`, then \`export const meta: PostCopy = {\` with ONLY these keys: source, slug, title, description, readingTime, tag, heroAlt, keywords, sections, faqs. Drop date, updated, hero, heroWidth, heroHeight, heroCredit, heroCreditUrl and ogImage - those come from the English post. Keep \`satisfies FaqItem[]\` on faqs. Then the sources array, then \`export default function Body()\`.

JSX TEXT ESCAPING - THIS BREAKS THE BUILD IF YOU GET IT WRONG
Inside JSX text, an apostrophe must be written &apos; and a double quote &quot;. So write: l&apos;accueil, d&apos;un appel, dell&apos;AI, s&apos;occupe.
Inside ordinary JavaScript strings (meta fields, faqs, sources), use a plain ' apostrophe and no escaping.
Never use an em dash. Use a comma, a plain hyphen, or a new sentence.

The three section headings are injected automatically afterwards; write <KeyTakeaways>, <FAQList> and <Sources> without a heading prop. For reference they will read "${copy.prose.keyTakeaways}", "${copy.prose.faq}" and "${copy.prose.sources}".`;
}

function taskPrompt(
  locale: MarketingLocale,
  enSlug: TranslatableBlogSlug,
  source: string,
  enTag: string,
): string {
  return `Translate this article into ${LANGUAGE[locale]}.

meta.source must be: "${enSlug}"
meta.slug must be: "${BLOG_SLUGS[enSlug][locale]}"
meta.tag must be: "${TAGS[locale][enTag] ?? enTag}"

--- BEGIN ${enSlug}.tsx ---
${source}
--- END ${enSlug}.tsx ---`;
}

// ---------------------------------------------------- post-processing

function stripFences(text: string): string {
  const fenced = text.match(/^\s*```(?:tsx?|jsx?|typescript)?\n([\s\S]*?)\n```\s*$/);
  return (fenced ? fenced[1] : text).trim();
}

/** Splices the English citation block back in, so a citation can never drift. */
function spliceSources(generated: string, english: string): string {
  const want = block(english, "const sources: Source[] = [", "\n];");
  const got = block(generated, "const sources: Source[] = [", "\n];");
  if (!want || !got) return generated;
  return generated.replace(got, want);
}

function injectHeadings(code: string, locale: MarketingLocale): string {
  const { keyTakeaways, faq, sources } = BLOG_COPY[locale].prose;
  const put = (input: string, tag: string, heading: string) =>
    input.replace(
      new RegExp(`<${tag}(?=[\\s/>])(?![^>]*\\sheading=)`, "g"),
      `<${tag} heading="${heading.replace(/"/g, "&quot;")}"`,
    );
  return put(put(put(code, "KeyTakeaways", keyTakeaways), "FAQList", faq), "Sources", sources);
}

/**
 * Rewrites in-article links to their localized targets.
 *
 * Blog links resolve through BLOG_SLUGS alone, NOT through the publish gate:
 * these files only ever render inside a locale whose blog section is published,
 * so gating here would freeze English URLs into every translated article and
 * they would still be there after the section went live. Everything else goes
 * through localizedHref, which does consult the gate. Untranslated targets
 * (the industry pages, /answers, the orange-county article) keep their English
 * URL - the same English fallback localizedHref applies everywhere else.
 */
function rewriteHrefs(code: string, locale: MarketingLocale): string {
  return code.replace(/href="(\/[^"]*)"/g, (whole, href: string) => {
    if (href === "/") return `href="${localizedHref(locale, "home")}"`;
    if (href === "/pricing") return `href="${localizedHref(locale, "pricing")}"`;
    const blog = href.match(/^\/blog\/([a-z0-9-]+)$/);
    if (blog) {
      const target = BLOG_SLUGS[blog[1] as TranslatableBlogSlug];
      return target ? `href="/${locale}/blog/${target[locale]}"` : whole;
    }
    return whole;
  });
}

/**
 * Restores the English anchor ids by position.
 *
 * Some articles have a section id that reads like prose ("why-it-matters") and
 * the model translates it however firmly it is told not to - four locales
 * burned all three retries on that single id. Position is a safe key because
 * the H2 count is already asserted to match: the k-th heading in the
 * translation is the k-th heading in the original. Only applied when the counts
 * line up; otherwise the shape diff rejects the file as before.
 */
function enforceAnchorIds(code: string, english: string): string {
  const want = shapeOf(english);
  const got = shapeOf(code);

  let out = code;
  if (want.sectionIds.length === got.sectionIds.length) {
    let i = 0;
    const sections = block(out, "sections: [", "],");
    if (sections) {
      out = out.replace(
        sections,
        sections.replace(/id:\s*"[^"]*"/g, () => `id: "${want.sectionIds[i++]}"`),
      );
    }
  }
  if (want.anchorIds.length === got.anchorIds.length) {
    let j = 0;
    out = out.replace(/\bid="[^"]*"/g, () => `id="${want.anchorIds[j++]}"`);
  }
  return out;
}

/** Forces the identity fields rather than trusting the model to echo them. */
function enforceMeta(
  code: string,
  locale: MarketingLocale,
  enSlug: TranslatableBlogSlug,
): string {
  const slug = BLOG_SLUGS[enSlug][locale];
  let out = code.replace(/(\n\s*)slug:\s*"[^"]*",/, `$1slug: "${slug}",`);
  if (/(\n\s*)source:\s*"[^"]*",/.test(out)) {
    out = out.replace(/(\n\s*)source:\s*"[^"]*",/, `$1source: "${enSlug}",`);
  } else {
    out = out.replace(
      /export const meta: PostCopy = \{/,
      `export const meta: PostCopy = {\n  source: "${enSlug}",`,
    );
  }
  return out;
}

/** Drops meta keys that belong to the English post, if the model kept them. */
function stripInheritedMeta(code: string): string {
  const inherited = [
    "date",
    "updated",
    "hero",
    "heroWidth",
    "heroHeight",
    "heroCredit",
    "heroCreditUrl",
    "ogImage",
  ];
  const metaEnd = code.indexOf("\n};", code.indexOf("export const meta"));
  if (metaEnd === -1) return code;
  const head = code.slice(0, metaEnd);
  const tail = code.slice(metaEnd);
  const cleaned = head
    .split("\n")
    .filter((line) => !inherited.some((k) => new RegExp(`^\\s{2}${k}:`).test(line)))
    .join("\n");
  return cleaned + tail;
}

const HEADER = (locale: MarketingLocale, enSlug: string) =>
  `// ${locale} translation of app/(main)/blog/_posts/${enSlug}.tsx.
//
// GENERATED by scripts/translate-blog.ts. Edits here are lost on the next run:
// fix the English article and regenerate, or fix this file and drop the header
// so the generator skips it. Publication is gated by content/i18n/${locale}/manifest.ts.
`;

/**
 * House style bans the em dash, and every model reaches for it in German and
 * French. Fixed here rather than rejected: it is a mechanical substitution, and
 * spending a retry on it wastes a whole regeneration of a 500-line article.
 */
function fixDashes(code: string): string {
  return code
    .replace(/(\d)\s*[–—]\s*(\d)/g, "$1-$2") // ranges: 10-15
    .replace(/\s*[—]\s*/g, " - ")
    .replace(/\s*[–]\s*/g, " - ");
}

function normalize(
  raw: string,
  english: string,
  locale: MarketingLocale,
  enSlug: TranslatableBlogSlug,
): string {
  let code = stripFences(raw);
  // Idempotence: --repair feeds an already-generated file back through here,
  // and the header is re-added at the end.
  code = code.replace(/^\/\/ [a-z]{2} translation of[\s\S]*?\n\n/, "");
  code = fixDashes(code);
  // Every _components module, not just prose: ai-receptionist-prompts.tsx also
  // imports PromptBlock, and a missed rewrite is a module-not-found at build.
  code = code.replace(
    /from "\.\.\/_components\/([a-z-]+)"/g,
    'from "@/app/(main)/blog/_components/$1"',
  );
  // Models uppercase the intrinsic <em> to match the neighbouring components -
  // and sometimes shorten it to <E> - which turns it into an undefined React
  // component. The pattern only matches a bare tag (`<EM>`, `</E>`), never an
  // attributed component like <Ext href="...">.
  const TAG_FIXUPS: Record<string, string> = {
    E: "em",
    EM: "em",
    STRONG: "strong",
    SPAN: "span",
    BR: "br",
    B: "b",
    I: "i",
  };
  code = code.replace(/<(\/?)([A-Z]+)(\s*\/?>)/g, (whole, close: string, tag: string, tail: string) =>
    TAG_FIXUPS[tag] ? `<${close}${TAG_FIXUPS[tag]}${tail}` : whole,
  );
  // The type annotation is what makes tsc reject a stray inherited meta key,
  // so add it back when the model drops it instead of burning a retry.
  code = code.replace(
    /export const meta(?::\s*PostCopy)?\s*=\s*\{/,
    "export const meta: PostCopy = {",
  );
  code = stripInheritedMeta(code);
  code = enforceMeta(code, locale, enSlug);
  code = enforceAnchorIds(code, english);
  code = spliceSources(code, english);
  code = rewriteHrefs(code, locale);
  code = injectHeadings(code, locale);
  if (!code.includes('import type { PostCopy }')) {
    code = code.replace(
      /(from "@\/app\/\(main\)\/blog\/_components\/prose";\n)/,
      '$1import type { PostCopy } from "@/content/i18n/_post-copy";\n',
    );
  }
  return `${HEADER(locale, enSlug)}\n${code}\n`;
}

/**
 * Parses the file with TypeScript's own TSX parser and reports syntax errors.
 *
 * Counting tags is not enough: four of the first 245 files came back with an
 * unclosed <Internal> or a stray fragment, which every count-based check
 * happily accepted and tsc then rejected at the end of a 40-minute run. Parsing
 * here turns that into one more retry instead.
 */
function syntaxErrors(code: string): string[] {
  const file = ts.createSourceFile(
    "generated.tsx",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  // parseDiagnostics is not on the public type but is the only way to get
  // syntax-only diagnostics without a Program (which would need the whole
  // project). Guarded so a TypeScript upgrade degrades to "no check" rather
  // than a crash.
  const diagnostics =
    (file as unknown as { parseDiagnostics?: ts.Diagnostic[] }).parseDiagnostics ?? [];
  return diagnostics.slice(0, 3).map((d) => {
    const message = ts.flattenDiagnosticMessageText(d.messageText, " ");
    const line =
      d.start === undefined
        ? ""
        : ` (line ${file.getLineAndCharacterOfPosition(d.start).line + 1})`;
    return `TSX syntax error${line}: ${message}`;
  });
}

/** Cheap checks the shape diff cannot express. */
function sanityErrors(code: string): string[] {
  const out: string[] = [...syntaxErrors(code)];
  if (!/export const meta: PostCopy = \{/.test(code)) {
    out.push("missing `export const meta: PostCopy = {`");
  }
  if (!/export default function Body\(/.test(code)) {
    out.push("missing `export default function Body()`");
  }
  if (code.includes("```")) out.push("output still contains a markdown fence");
  // Truncation: a complete module ends on the closing brace of Body().
  if (!code.trimEnd().endsWith("}")) {
    out.push("the file is cut off - it must end with the closing brace of Body()");
  }
  if (!/<Sources\b/.test(code)) out.push("missing the <Sources> block at the end of Body()");
  // A capitalized JSX tag is a React component and must be imported. Catching
  // an invented one here beats reading "Cannot find name 'Xyz'" out of tsc
  // after 245 files have been written.
  const imported = new Set(
    [...code.matchAll(/^import[\s\S]*?from "[^"]+";$/gm)]
      .flatMap((m) => m[0].match(/\b[A-Z][A-Za-z0-9]*\b/g) ?? []),
  );
  const used = new Set(
    [...code.matchAll(/<([A-Z][A-Za-z0-9]*)(?=[\s/>])/g)].map((m) => m[1]),
  );
  const undeclared = [...used].filter((tag) => !imported.has(tag));
  if (undeclared.length) {
    out.push(
      `uses components that are not imported: ${undeclared.join(", ")} - use only the components the English article imports`,
    );
  }
  // NOT checked: raw apostrophes in JSX text. They are valid JSX and only trip
  // eslint's react/no-unescaped-entities, which is switched off for this
  // generated directory in eslint.config.mjs. It used to be an error here and
  // it was the single largest cause of wasted retries: French and Italian
  // prompt text is full of "N'inventez" and "l'AI", and the model could not
  // reliably escape every one of them across a 500-line file.
  return out;
}

// -------------------------------------------------------------- model

let clientPromise: Promise<import("@google/genai").GoogleGenAI> | null = null;
function gemini() {
  clientPromise ??= import("@google/genai").then(({ GoogleGenAI }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set (.env)");
    return new GoogleGenAI({ apiKey });
  });
  return clientPromise;
}

async function generate(
  model: string,
  system: string,
  prompt: string,
  opts: { json?: boolean; maxOutputTokens?: number } = {},
): Promise<string> {
  const res = await (await gemini()).models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: system,
      // Thinking is billed against maxOutputTokens, so leaving it on truncated
      // the longer articles mid-file. Translation is not a reasoning task.
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens: opts.maxOutputTokens ?? 48_000,
      temperature: 0.4,
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
    },
  });
  const text = res.text ?? "";
  if (!text.trim()) throw new Error("empty response from the model");
  return text;
}

// --------------------------------------------------------------- run

type Job = { locale: MarketingLocale; enSlug: TranslatableBlogSlug };

async function runJob(job: Job, args: Args): Promise<"ok" | "skipped" | "failed"> {
  const { locale, enSlug } = job;
  const outPath = path.join(ROOT, "content/i18n", locale, "blog", `${enSlug}.tsx`);
  if (!args.force && fs.existsSync(outPath)) return "skipped";

  const english = fs.readFileSync(path.join(EN_DIR, `${enSlug}.tsx`), "utf8");
  const enTag = english.match(/^\s*tag:\s*"([^"]+)"/m)?.[1] ?? "Guides";
  const want = shapeOf(english);
  const system = systemPrompt(locale);

  let prompt = taskPrompt(locale, enSlug, english, enTag);
  let lastCode = "";
  for (let attempt = 1; attempt <= args.retries; attempt++) {
    try {
      const raw = await generate(args.model, system, prompt);
      const code = normalize(raw, english, locale, enSlug);
      lastCode = code;
      const problems = [...sanityErrors(code), ...shapeDiff(want, shapeOf(code))];
      if (problems.length === 0) {
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, code);
        console.log(`  ok    ${locale}/${enSlug}${attempt > 1 ? ` (attempt ${attempt})` : ""}`);
        return "ok";
      }
      console.log(`  retry ${locale}/${enSlug}: ${problems[0]}`);
      // Feed the failure back rather than resampling blind.
      prompt = `${taskPrompt(locale, enSlug, english, enTag)}

Your previous attempt was rejected. Fix ALL of these and return the whole file again:
${problems.map((p) => `- ${p}`).join("\n")}`;
    } catch (err) {
      console.log(`  retry ${locale}/${enSlug}: ${(err as Error).message}`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  // Keep the last rejected attempt: the failure is usually one bad line, and
  // reading it beats guessing at what the model did.
  if (lastCode) {
    const debug = path.join(os.tmpdir(), `translate-blog-${locale}-${enSlug}.tsx`);
    fs.writeFileSync(debug, lastCode);
    console.error(`  FAIL  ${locale}/${enSlug}: gave up after ${args.retries} attempts, last attempt at ${debug}`);
  } else {
    console.error(`  FAIL  ${locale}/${enSlug}: gave up after ${args.retries} attempts`);
  }
  return "failed";
}

function writeIndex(locale: MarketingLocale): number {
  const dir = path.join(ROOT, "content/i18n", locale, "blog");
  fs.mkdirSync(dir, { recursive: true });
  const slugs = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => f.replace(/\.tsx$/, ""))
    .sort();

  const ident = (slug: string) =>
    "p" +
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("");

  const body = slugs.length
    ? `${slugs
        .map((s) => `import ${ident(s)}, { meta as ${ident(s)}Meta } from "./${s}";`)
        .join("\n")}

export const ${locale}Posts: PostModule[] = [
${slugs.map((s) => `  { meta: ${ident(s)}Meta, default: ${ident(s)} },`).join("\n")}
];
`
    : `export const ${locale}Posts: PostModule[] = [];\n`;

  fs.writeFileSync(
    path.join(dir, "index.ts"),
    `// GENERATED by scripts/translate-blog.ts. Do not edit by hand.
//
// One entry per translated article. posts-registry.ts joins each with its
// English original and throws if the two disagree.
import type { PostModule } from "../../_post-copy";

${body}`,
  );
  return slugs.length;
}

// ------------------------------------------------------- meta lengths

// Google truncates a title around 60 characters and a description around 158,
// mid-sentence. The English metadata was trimmed to fit in a dedicated pass;
// translations arrive 20-40% longer because German and Portuguese simply are,
// and the model overshoots even when told not to.
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 158;

const TITLE_RE = /(\n\s*title:\s*)\n?\s*"((?:[^"\\]|\\.)*)"/;
const DESCRIPTION_RE = /(\n\s*description:\s*)\n?\s*"((?:[^"\\]|\\.)*)"/;

function readMeta(code: string) {
  return {
    title: code.match(TITLE_RE)?.[2] ?? "",
    description: code.match(DESCRIPTION_RE)?.[2] ?? "",
  };
}

/** Last resort: cut at a word boundary rather than ship a 236-char description. */
function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.-]+$/, "");
}

/**
 * Rewrites only the title and description of an already-translated file.
 *
 * A separate, tiny call on purpose: the alternative is regenerating a 500-line
 * article because its description is twelve characters too long.
 */
async function fixMeta(
  locale: MarketingLocale,
  enSlug: TranslatableBlogSlug,
  args: Args,
): Promise<"ok" | "skipped" | "clipped"> {
  const file = path.join(ROOT, "content/i18n", locale, "blog", `${enSlug}.tsx`);
  if (!fs.existsSync(file)) return "skipped";
  let code = fs.readFileSync(file, "utf8");

  // A dropped heroAlt is a missing required field (tsc catches it) and a blank
  // alt attribute on the article's largest image. Translating one sentence is
  // far cheaper than regenerating the article that surrounds it.
  if (!/\n\s*heroAlt:/.test(code)) {
    const english = fs.readFileSync(path.join(EN_DIR, `${enSlug}.tsx`), "utf8");
    const enAlt = english.match(/\n\s*heroAlt:\s*\n?\s*"((?:[^"\\]|\\.)*)"/)?.[1];
    if (enAlt) {
      try {
        const alt = fixDashes(
          (
            await generate(
              args.model,
              `Translate the user's image alt text into ${LANGUAGE[locale]}. It describes a photo on a business article. Return ONLY the translated sentence: no quotes, no notes, no trailing full stop unless the original has one.`,
              enAlt,
              { maxOutputTokens: 500 },
            )
          ).trim().replace(/^"|"$/g, ""),
        );
        code = code.replace(
          /(\n\s*tag:\s*"[^"]*",)/,
          `$1\n  heroAlt:\n    "${alt.replace(/"/g, "'")}",`,
        );
        fs.writeFileSync(file, code);
        console.log(`  alt   ${locale}/${enSlug}: restored heroAlt`);
      } catch (err) {
        console.log(`  alt   ${locale}/${enSlug} FAILED: ${(err as Error).message}`);
      }
    }
  }

  const current = readMeta(code);
  if (
    current.title.length <= TITLE_MAX &&
    current.description.length <= DESCRIPTION_MAX
  ) {
    return "skipped";
  }

  const keywords = code.match(/keywords: \[([\s\S]*?)\]/)?.[1] ?? "";
  const system = `You write search-result metadata in ${LANGUAGE[locale]} for AI Receptionist Now, an AI phone receptionist for small businesses. ${VOICE[locale]}

Return ONLY a JSON object: {"title": "...", "description": "..."}

- title: at most ${TITLE_MAX} characters INCLUDING spaces. Count them. Lead with the term the market searches for. It is a search result, not a headline: drop subtitles and brand suffixes before you drop the keyword.
- description: at most ${DESCRIPTION_MAX} characters INCLUDING spaces. One or two sentences that earn the click and read as native prose, not as a summary of a summary.
- Same language, same meaning, same claims. Invent nothing.
- No em dashes, no smart quotes, no double quotes inside the strings.`;

  let prompt = `Current title (${current.title.length} chars): ${current.title}
Current description (${current.description.length} chars): ${current.description}
Target keywords: ${keywords.replace(/\s+/g, " ").trim()}

Rewrite both so they fit.`;

  let next = current;
  for (let attempt = 1; attempt <= args.retries; attempt++) {
    try {
      const raw = await generate(args.model, system, prompt, {
        json: true,
        maxOutputTokens: 1000,
      });
      const parsed = JSON.parse(raw) as { title?: string; description?: string };
      const title = fixDashes(parsed.title?.trim() ?? "");
      const description = fixDashes(parsed.description?.trim() ?? "");
      if (!title || !description) throw new Error("empty field");
      next = { title, description };
      if (title.length <= TITLE_MAX && description.length <= DESCRIPTION_MAX) break;
      prompt = `${prompt}

Your last attempt was still too long: title ${title.length} chars, description ${description.length} chars. The limits are ${TITLE_MAX} and ${DESCRIPTION_MAX}. Shorten them.`;
    } catch (err) {
      if (attempt === args.retries) {
        console.log(`  meta ${locale}/${enSlug}: ${(err as Error).message}`);
      }
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }

  const clipped =
    next.title.length > TITLE_MAX || next.description.length > DESCRIPTION_MAX;
  const title = clip(next.title, TITLE_MAX);
  const description = clip(next.description, DESCRIPTION_MAX);

  // Both regexes stop before the trailing comma, so it survives the splice.
  const updated = code
    .replace(TITLE_RE, (_m, lead: string) => `${lead}"${title}"`)
    .replace(
      DESCRIPTION_RE,
      (_m, lead: string) => `${lead}\n    "${description}"`,
    );
  fs.writeFileSync(file, updated);
  console.log(
    `  meta  ${locale}/${enSlug}: ${current.title.length}->${title.length} / ${current.description.length}->${description.length}${clipped ? " (clipped)" : ""}`,
  );
  return clipped ? "clipped" : "ok";
}

/**
 * Re-applies the deterministic half of the pipeline to files that already
 * exist: no model call, no cost. This is the tool for the day BLOG_SLUGS gains
 * a redirect, a prose heading is reworded, or a bug is found in the normalizer
 * after 245 files have been written - the alternative would be paying to
 * re-translate prose that was already fine.
 */
function repair(locale: MarketingLocale, enSlug: TranslatableBlogSlug): boolean {
  const file = path.join(ROOT, "content/i18n", locale, "blog", `${enSlug}.tsx`);
  if (!fs.existsSync(file)) return false;
  const english = fs.readFileSync(path.join(EN_DIR, `${enSlug}.tsx`), "utf8");
  const before = fs.readFileSync(file, "utf8");
  const after = normalize(before, english, locale, enSlug);
  if (after === before) return false;
  fs.writeFileSync(file, after);
  const problems = [...sanityErrors(after), ...shapeDiff(shapeOf(english), shapeOf(after))];
  if (problems.length) {
    console.log(`  repaired (still off) ${locale}/${enSlug}: ${problems[0]}`);
  } else {
    console.log(`  repaired ${locale}/${enSlug}`);
  }
  return true;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.repair) {
    let n = 0;
    for (const locale of args.locales) {
      for (const enSlug of args.slugs) if (repair(locale, enSlug)) n++;
    }
    console.log(`repaired ${n} files`);
  } else if (args.fixMeta) {
    const jobs: Job[] = args.locales.flatMap((locale) =>
      args.slugs.map((enSlug) => ({ locale, enSlug })),
    );
    const counts = { ok: 0, skipped: 0, clipped: 0 };
    let next = 0;
    const worker = async () => {
      while (next < jobs.length) {
        const job = jobs[next++];
        counts[await fixMeta(job.locale, job.enSlug, args)]++;
      }
    };
    await Promise.all(
      Array.from({ length: Math.max(1, args.concurrency) }, worker),
    );
    console.log(
      `\nmeta: ${counts.ok} rewritten, ${counts.clipped} rewritten but clipped to fit, ${counts.skipped} already within limits`,
    );
  } else if (!args.indexOnly) {
    const jobs: Job[] = args.locales.flatMap((locale) =>
      args.slugs.map((enSlug) => ({ locale, enSlug })),
    );
    console.log(
      `translating ${args.slugs.length} articles x ${args.locales.length} locales = ${jobs.length} files, model ${args.model}, concurrency ${args.concurrency}`,
    );

    const counts = { ok: 0, skipped: 0, failed: 0 };
    let next = 0;
    const worker = async () => {
      while (next < jobs.length) {
        const job = jobs[next++];
        counts[await runJob(job, args)]++;
      }
    };
    await Promise.all(
      Array.from({ length: Math.max(1, args.concurrency) }, worker),
    );
    console.log(
      `\ndone: ${counts.ok} written, ${counts.skipped} already present, ${counts.failed} failed`,
    );
    if (counts.failed > 0) process.exitCode = 1;
  }

  for (const locale of MARKETING_LOCALES) {
    console.log(`index ${locale}: ${writeIndex(locale)} articles`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
