// Cover collages for blog posts: one large photo on the left, two tiles stacked
// on the right. Tiles are our own photos and cropped evidence screenshots that
// already appear inside the post, so the cover previews what the reader gets.
//
// Run: node scripts/blog-figures/collage.mjs            (all covers)
//      node scripts/blog-figures/collage.mjs <out>      (one cover)
//
// A screenshot tile uses fit "contain" on a card so its text is never cut
// mid-line; a photo tile uses fit "cover". `crop` ({x, y, w, h} as fractions
// of the source) zooms a tile onto the part worth reading at cover size,
// usually the highlighted sentence of a screenshot.
import sharp from "sharp"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const BLOG = join(ROOT, "public", "blog")

const W = 1600
const H = 900
const PAD = 40
const GAP = 24
const R = 18

export const COVERS = [
  {
    out: "vet-ai-answering-cover-collage",
    bg: "#efece6",
    main: { src: "vet-clinic-front-desk-evening.webp" },
    top: { src: "vet-tech-phone-exam-room.webp", kind: "photo" },
    bottom: { src: "vetrec-ai-receptionist-pricing-calculator.webp", kind: "photo", crop: { x: 0.158, y: 0.17, w: 0.675, h: 0.647 } },
  },
  {
    out: "google-voice-business-cover-collage",
    bg: "#eef0f3",
    main: { src: "google-voice-business-counter-phone.webp" },
    top: { src: "google-voice-plan-table-screenshot.webp", kind: "photo", crop: { x: 0, y: 0, w: 1, h: 0.742 } },
    bottom: { src: "contractor-missed-call-ladder.webp", kind: "photo" },
  },
  {
    out: "google-voice-alternatives-cover-collage",
    bg: "#f1efea",
    main: { src: "google-voice-alternatives-desk-phones.webp", crop: { x: 0.23, y: 0, w: 0.645, h: 1 } },
    top: { src: "ringcentral-ai-receptionist-starts-at-39.webp", kind: "photo", crop: { x: 0, y: 0.22, w: 0.86, h: 0.78 } },
    bottom: { src: "cafe-owner-phone-rush.webp", kind: "photo" },
  },
]

const roundMask = (w, h) =>
  Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${R}" ry="${R}" fill="#fff"/></svg>`)

const shadow = (w, h) =>
  Buffer.from(
    `<svg width="${w + 60}" height="${h + 60}"><defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="12"/></filter></defs><rect x="30" y="38" width="${w}" height="${h}" rx="${R}" fill="#000" fill-opacity="0.16" filter="url(#s)"/></svg>`
  )

async function source(file, crop) {
  const img = sharp(join(BLOG, file))
  if (!crop) return img
  const m = await img.metadata()
  return sharp(
    await img
      .extract({
        left: Math.round(crop.x * m.width),
        top: Math.round(crop.y * m.height),
        width: Math.round(crop.w * m.width),
        height: Math.round(crop.h * m.height),
      })
      .toBuffer()
  )
}

async function tile({ src: file, kind = "photo", card = "#ffffff", crop }, w, h) {
  let img
  if (kind === "shot") {
    const inner = await (await source(file, crop))
      .resize(w - 32, h - 32, { fit: "contain", background: card })
      .toBuffer()
    img = await sharp({ create: { width: w, height: h, channels: 3, background: card } })
      .composite([{ input: inner, left: 16, top: 16 }])
      .png()
      .toBuffer()
  } else {
    img = await (await source(file, crop)).resize(w, h, { fit: "cover", position: "attention" }).png().toBuffer()
  }
  return sharp(img).composite([{ input: roundMask(w, h), blend: "dest-in" }]).png().toBuffer()
}

async function build(c) {
  const mainW = 940
  const mainH = H - PAD * 2
  const sideW = W - PAD * 2 - GAP - mainW
  const sideH = (mainH - GAP) / 2
  const parts = [
    { buf: await tile(c.main, mainW, mainH), x: PAD, y: PAD, w: mainW, h: mainH },
    { buf: await tile(c.top, sideW, sideH), x: PAD + mainW + GAP, y: PAD, w: sideW, h: sideH },
    { buf: await tile(c.bottom, sideW, sideH), x: PAD + mainW + GAP, y: PAD + sideH + GAP, w: sideW, h: sideH },
  ]
  const layers = []
  for (const p of parts) layers.push({ input: shadow(p.w, p.h), left: p.x - 30, top: p.y - 30 })
  for (const p of parts) layers.push({ input: p.buf, left: p.x, top: p.y })
  await sharp({ create: { width: W, height: H, channels: 3, background: c.bg } })
    .composite(layers)
    .webp({ quality: 86 })
    .toFile(join(BLOG, `${c.out}.webp`))
  console.log(`OK   ${c.out}`)
}

const only = process.argv.slice(2)
for (const c of COVERS.filter((x) => !only.length || only.includes(x.out))) await build(c)
