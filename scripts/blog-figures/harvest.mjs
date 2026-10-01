// Resolve every `ref` search term in the figure plan to ONE pinned Behance cover.
//
// Same reference rule the homepage hero and the tool peeks already follow
// (scripts/gen-hero-compare.mjs, scripts/gen-tool-peeks.mjs): a Behance cover is
// a reference for the KIND of object to photograph and is never shipped. Our own
// model re-shoots the object from a different viewpoint with our own lighting,
// and only our frame reaches the page.
//
// Pinning matters. A live search re-ranks every week, so if the generator hit
// Behance directly a re-run would quietly swap the subject under a caption that
// still describes the old one. This writes the chosen cover, its project title
// and its gallery URL to scripts/blog-figures/refs.json, which is committed.
//
// Run: node scripts/blog-figures/harvest.mjs            (only terms not yet pinned)
//      node scripts/blog-figures/harvest.mjs --force    (re-pin everything)
//      node scripts/blog-figures/harvest.mjs cnc-part   (one ref id)
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { PLAN, REFS } from "./plan.mjs"

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, "refs.json")

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"

const args = process.argv.slice(2)
const force = args.includes("--force")
const only = args.filter((a) => !a.startsWith("--"))

const existing = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {}

/** Behance renders its search results server side, one card per
 *  `ProjectCoverNeue-root-` element, so the cover, the title and the gallery
 *  link inside a chunk always belong to the same project. Splitting on that
 *  class is the only ordering guarantee available without an API key. */
function parseCards(html) {
  const cards = []
  for (const chunk of html.split('class="ProjectCoverNeue-root-').slice(1)) {
    const cover = chunk.match(
      /src="(https:\/\/mir-s3-cdn-cf\.behance\.net\/projects\/404\/[^"]+)"/
    )
    const gallery = chunk.match(/behance\.net\/gallery\/(\d+)\/([^"?&]*)/)
    const label = chunk.match(/aria-label="([^"]*)"/)
    if (!cover || !gallery) continue
    const title = (label ? label[1] : "")
      .replace(/^Add to Moodboard - /, "")
      .replace(/ Save$/, "")
      .replace(/&amp;/g, "&")
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .trim()
    cards.push({
      // The DOM only ever carries the 404px candidate. The full-size asset lives
      // at the same path under original_webp, which is what we hand the model.
      file: cover[1].replace("/projects/404/", "/projects/original_webp/"),
      project: title,
      page: `https://www.behance.net/gallery/${gallery[1]}/${gallery[2]}`,
    })
  }
  // The same project can appear twice in one response (promoted + organic).
  const seen = new Set()
  return cards.filter((c) => !seen.has(c.page) && seen.add(c.page))
}

async function search(term) {
  const url = `https://www.behance.net/search/projects?search=${encodeURIComponent(term)}`
  const res = await fetch(url, { headers: { "User-Agent": UA } })
  if (!res.ok) throw new Error(`search "${term}" -> ${res.status}`)
  return parseCards(await res.text())
}

/** Behance ranks by engagement, and on any manufacturing term the top of that
 *  ranking is graphic design about manufacturing rather than a photograph of
 *  the thing: "cnc machined part" returns a CNC brand identity first and an
 *  actual machined part fourth. Taking the top card by position pinned a
 *  logotype case study as the reference for a hydraulic manifold, so the search
 *  result is re-ranked here on the project title before `pick` is applied. */
const OFF_TOPIC =
  /\b(brand(ing)?|identity|logo\w*|marks?|monogram|emblem|typeface|font|packaging|web ?site|web design|ux|ui|interface|landing|app|case study|poster|magazine|book|editorial|social media|illustration|character design|animation|motion|portfolio|photo composites|e-?commerce)\b/i

function rank(cards, spec) {
  const words = (spec.want || spec.query)
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2)
  const avoid = (spec.avoid || []).map((a) => a.toLowerCase())
  const scored = cards
    .map((c) => {
      const t = c.project.toLowerCase()
      if (avoid.some((a) => t.includes(a))) return null
      // Artwork references are meant to be graphic design, so the off-topic
      // filter would throw away exactly the right answers.
      if (!spec.artwork && OFF_TOPIC.test(c.project)) return null
      return { ...c, score: words.filter((w) => t.includes(w)).length }
    })
    .filter(Boolean)
    .map((c, i) => ({ ...c, i }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
  // A title that shares nothing with the query is a coincidence of ranking, not
  // an answer: "fastener" returned a Cinema 4D showreel at position one. Keep
  // the zero-score tail only when there is nothing else at all.
  const onTopic = scored.filter((c) => c.score > 0)
  return onTopic.length ? onTopic : scored
}

/** A pinned cover is worthless if it 404s on the next run, and a tiny one gives
 *  the model nothing to work from. The full-size asset is not always present,
 *  so the 808px candidate is the fallback rather than a failure. */
async function usable(file) {
  for (const url of [file, file.replace("/projects/original_webp/", "/projects/808_webp/")]) {
    const res = await fetch(url, { headers: { "User-Agent": UA } })
    if (!res.ok) continue
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length > 8_000) return url
  }
  return null
}

const wanted = Object.entries(REFS).filter(
  ([id]) => (!only.length || only.includes(id)) && (force || !existing[id])
)

if (!wanted.length) {
  console.log(
    `Nothing to pin. ${Object.keys(existing).length}/${Object.keys(REFS).length} refs already in refs.json (use --force to re-pin).`
  )
  process.exit(0)
}

// Terms that are used by more than one figure are searched once.
let ok = 0
for (const [id, spec] of wanted) {
  const { query, pick = 0 } = spec
  try {
    const cards = await search(query)
    if (!cards.length) throw new Error("no cards parsed")
    const ranked = rank(cards, spec)
    const card = ranked[pick]
    if (!card) throw new Error(`pick ${pick} out of range (${ranked.length} usable of ${cards.length})`)
    const file = await usable(card.file)
    if (!file) throw new Error(`cover not usable: ${card.file}`)
    existing[id] = { file, project: card.project, page: card.page, query, pick }
    console.log(`PIN  ${id.padEnd(20)} ${card.project.slice(0, 46).padEnd(46)}  alts: ${ranked.slice(0, 4).map((c) => c.project.slice(0, 22)).join(" / ")}`)
    ok++
  } catch (err) {
    console.log(`FAIL ${id.padEnd(20)} ${err.message}`)
  }
  writeFileSync(OUT, `${JSON.stringify(existing, null, 2)}\n`)
}

const missing = Object.keys(REFS).filter((id) => !existing[id])
console.log(
  `\nPinned ${ok}/${wanted.length}. refs.json now holds ${Object.keys(existing).length}/${Object.keys(REFS).length}.` +
    (missing.length ? `\nStill missing: ${missing.join(", ")}` : "")
)

// Referenced so the plan import is not dead weight if REFS ever moves.
void PLAN
