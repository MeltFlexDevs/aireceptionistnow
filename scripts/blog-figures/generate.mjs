// Build every photograph in the plan: pinned Behance reference -> our own
// frame -> public/blog/<out>.webp.
//
// Run: node scripts/blog-figures/harvest.mjs            (pin references first)
//      node scripts/blog-figures/generate.mjs           (everything missing)
//      node scripts/blog-figures/generate.mjs --force bilingual-answering-service-hero
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import sharp from "sharp"
import { GoogleGenAI, Modality } from "@google/genai"
import { PLAN } from "./plan.mjs"

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, "..", "..")
const REFS = JSON.parse(readFileSync(join(HERE, "refs.json"), "utf8"))
const CACHE = join(ROOT, ".cache-blogfig")
const OUTDIR = join(ROOT, "public", "blog")

function readKey() {
  for (const f of [".env.local", ".env"]) {
    try {
      const m = readFileSync(join(ROOT, f), "utf8").match(/^GEMINI_(?:API_)?KEY\s*=\s*"?([^"\n\r]+)"?/m)
      if (m && m[1].trim()) return m[1].trim()
    } catch {}
  }
  return process.env.GEMINI_KEY || process.env.GEMINI_API_KEY
}

const API_KEY = readKey()
if (!API_KEY) {
  console.error("No GEMINI key found.")
  process.exit(1)
}

const MODELS = [
  "gemini-3.1-flash-image-preview",
  "gemini-2.5-flash-image",
  "gemini-2.0-flash-preview-image-generation",
]
const ai = new GoogleGenAI({ apiKey: API_KEY })
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"

// The no-lettering rule and the hand count lead, in caps, for the reason given
// in techdrawai's generate.mjs: buried at the end they are ignored.
const SCENE =
  "THERE IS NO WRITING ANYWHERE IN THIS PHOTOGRAPH. No signage, no posters, no printed sheets with text, no labels, no brand names, no screens with content, no phone displays with characters. Any surface that would normally carry text is plain and blank. " +
  "IF HANDS APPEAR, THERE ARE EXACTLY TWO PER PERSON, each with four fingers and one thumb, in a natural position. " +
  "You are a documentary photographer. The supplied image is a reference for the KIND of place, its materials, its palette and its light. Shoot the scene described in the subject line yourself, from a clearly different viewpoint and camera height, with your own natural working light. Keep the reference's design language - the finishes, the colour temperature, the sense of a real designed interior - but this is your photograph and not a copy of the reference. Keep it a real, slightly imperfect working environment, and keep the frame simple: a few large objects rather than a wall of small cluttered ones. Photorealistic, sharp, shallow depth of field, no watermark. 16:9 landscape composition."

async function genImage(parts, label) {
  let lastErr = ""
  for (const model of MODELS) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
      })
      for (const p of res.candidates?.[0]?.content?.parts ?? []) {
        if (p.inlineData?.data) return Buffer.from(p.inlineData.data, "base64")
      }
      lastErr = `${model} returned no image`
    } catch (err) {
      lastErr = `${model}: ${(err instanceof Error ? err.message : String(err)).slice(0, 140)}`
    }
    console.log(`  WARN ${label}: ${lastErr}`)
  }
  throw new Error(lastErr || "all models failed")
}

async function fetchRef(id) {
  const ref = REFS[id]
  if (!ref) throw new Error(`ref "${id}" is not pinned, run harvest.mjs`)
  const res = await fetch(ref.file, { headers: { "User-Agent": UA } })
  if (!res.ok) throw new Error(`ref "${id}" -> ${res.status}`)
  // The model takes png/jpeg/webp; normalise so the mime type is never a guess.
  return sharp(Buffer.from(await res.arrayBuffer())).resize(1400, 1400, { fit: "inside" }).jpeg({ quality: 90 }).toBuffer()
}

const args = process.argv.slice(2)
const force = args.includes("--force")
const only = args.filter((a) => !a.startsWith("--"))

mkdirSync(CACHE, { recursive: true })
let ok = 0
const todo = PLAN.filter((f) => !only.length || only.includes(f.out))
for (const fig of todo) {
  const cached = join(CACHE, `${fig.out}.png`)
  try {
    let buf
    if (existsSync(cached) && !force) buf = readFileSync(cached)
    else {
      const ref = await fetchRef(fig.ref)
      buf = await genImage(
        [
          // Subject first: after the style paragraph it loses to the reference.
          { text: `SUBJECT: ${fig.subject}.\n\n${SCENE}` },
          { inlineData: { mimeType: "image/jpeg", data: ref.toString("base64") } },
        ],
        fig.out
      )
      const { channels } = await sharp(buf).stats()
      if (channels.every((c) => c.stdev < 6)) throw new Error("frame came back blank")
      writeFileSync(cached, buf)
    }
    await sharp(buf)
      .rotate()
      .resize(fig.width, fig.height, { fit: "cover", position: "attention" })
      .webp({ quality: 84 })
      .toFile(join(OUTDIR, `${fig.out}.webp`))
    console.log(`OK   ${fig.out}  (ref: ${REFS[fig.ref].project.slice(0, 50)})`)
    ok++
  } catch (err) {
    console.log(`FAIL ${fig.out}: ${err instanceof Error ? err.message : err}`)
  }
}
console.log(`\nDone: ${ok}/${todo.length}.`)
