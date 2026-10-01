// The photographs in the blog, and the Behance reference each one is shot from.
//
// Same reference rule as techdrawai's scripts/blog-figures: a Behance cover is
// pinned by URL in refs.json and used ONLY as a reference for the kind of place
// to photograph. It is never served. Our model re-shoots the scene from its own
// viewpoint with its own light, and only that frame reaches public/blog.
//
// `subject` leads the prompt on purpose - appended after the style paragraph it
// loses to the reference image.

export const REFS = {
  "practice-desk": { query: "medical office interior design", want: "medical office clinic interior", pick: 0 },
  "clinic-reception": { query: "clinic reception interior", want: "clinic reception interior waiting", pick: 0 },
  "local-shop": { query: "small shop interior photography", want: "shop store interior", pick: 0 },
  "home-kitchen": { query: "kitchen lifestyle photography", want: "kitchen lifestyle home", pick: 0 },
  "chiro-clinic": { query: "chiropractic clinic interior", want: "chiropractic clinic interior", pick: 0 },
  "treatment-room": { query: "physiotherapy clinic interior", want: "physiotherapy clinic treatment room", pick: 0 },
}

export const PLAN = [
  {
    out: "medical-answering-pricing-desk",
    ref: "practice-desk",
    width: 1600,
    height: 900,
    subject:
      "a practice manager's desk in a small medical office seen at an angle from above: a desk phone with its handset in the cradle, a plain calculator with a blank display, a few sheets of completely blank white paper fanned out, a stethoscope coiled at the edge, a capped pen and a mug; nobody in frame",
  },
  {
    out: "medical-clinic-reception-night",
    ref: "clinic-reception",
    width: 1376,
    height: 768,
    subject:
      "a physician practice reception area at night after closing, lit only by one small desk lamp and a corridor light: the front counter with a desk phone showing one small glowing indicator light, an empty row of waiting room chairs behind, a dark blue evening sky through half closed blinds; nobody in frame",
  },
  {
    out: "bilingual-shop-counter-phone",
    ref: "local-shop",
    width: 1600,
    height: 900,
    subject:
      "the front counter of a small family-run neighbourhood business in warm afternoon light: a desk phone with its handset lying off the hook on the counter beside an open blank notepad and a pen, a small potted plant, shelves softly out of focus behind, a sunlit city street blurred through the front window; nobody in frame",
  },
  {
    out: "bilingual-caller-kitchen-call",
    ref: "home-kitchen",
    width: 1376,
    height: 768,
    subject:
      "a woman in her fifties of Latin American heritage standing in a lived-in home kitchen in three-quarter profile, holding a plain smartphone to her ear with ONE hand and listening calmly; her ONLY other hand rests flat on the counter next to a small puddle of water by the sink, so exactly one hand is raised and exactly one hand is on the counter; a folded towel on the floor; candid, not posed, not looking at the camera",
  },
  {
    out: "chiropractic-front-desk",
    ref: "chiro-clinic",
    width: 1600,
    height: 900,
    subject:
      "the empty front desk of a chiropractic clinic at the start of the day: a reception counter in light wood with a desk phone in its cradle, a closed appointment book and a small anatomical spine model, and through an open doorway behind, softly out of focus, a chiropractic adjusting table; nobody in frame",
  },
  {
    out: "chiropractic-consultation-room",
    ref: "treatment-room",
    width: 1376,
    height: 768,
    subject:
      "a chiropractor in plain dark scrubs seen from behind and to the side, standing beside a patient who sits upright on the edge of an adjusting table, the two talking before treatment, one of the chiropractor's hands resting near the patient's shoulder; bright calm treatment room with a window; faces are not the focus",
  },
]
