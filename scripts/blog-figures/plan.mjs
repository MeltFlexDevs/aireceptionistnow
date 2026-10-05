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
  "call-center": { query: "call center office interior", want: "call center contact office interior", pick: 0 },
  "accounting-office": { query: "accounting firm office interior", want: "accounting firm office interior", pick: 0 },
  "insurance-office": { query: "insurance agency office interior", want: "insurance agency office", pick: 0 },
  "small-office": { query: "insurance agency office interior", want: "office design", pick: 0 },
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
  {
    out: "live-answering-operator-evening",
    ref: "call-center",
    width: 1600,
    height: 900,
    subject:
      "one answering-service operator at her workstation in the evening, a woman in her thirties wearing a lightweight single-ear headset, seen from behind and slightly to the side over her shoulder, mid-conversation, typing on a keyboard with BOTH hands on the keys; her monitor is angled away from the camera so its screen cannot be seen; behind her, rows of identical desks, most of them empty with their chairs pushed in and overhead lights dimmed; a few headsets resting on empty desks",
  },
  {
    out: "live-answering-floor-night",
    ref: "call-center",
    width: 1376,
    height: 768,
    subject:
      "a wide view of an answering-service floor in the middle of the night: long rows of desks almost all empty and dark, only two operators far away at the back lit by small pools of desk light, headsets lying on the nearest empty desks in the foreground, black windows; the feeling is thin overnight staffing, quiet, not dramatic",
  },
  {
    out: "accounting-firm-tax-season-evening",
    ref: "accounting-office",
    width: 1600,
    height: 900,
    subject:
      "a small accounting firm's open office on an evening in early April: desks with stacks of plain unlabelled manila folders and a few cardboard file boxes, a desk phone on the nearest desk with its handset in the cradle, a plain calculator, desk lamps switched on, dark windows; in the distance one accountant working alone, small in the frame and seen from the side",
  },
  {
    out: "cpa-office-phone-call",
    ref: "small-office",
    width: 1376,
    height: 768,
    subject:
      "an accountant in his fifties in a warm private office, sitting at a wooden desk, holding a desk-phone handset to his ear with ONE hand and holding a pen above a blank notepad with his OTHER hand, listening carefully; a closed laptop and a short stack of plain folders on the desk; seen in three-quarter profile, candid, not looking at the camera",
  },
  {
    out: "insurance-agency-front-desk",
    ref: "insurance-office",
    width: 1600,
    height: 900,
    subject:
      "a real photograph, not a 3D render: the front reception of a small, slightly dated independent insurance agency in a suburban strip-mall office on a weekday morning, shot handheld at eye level from the client side of the counter: a worn reception desk with a desk phone in its cradle, a closed appointment book, a coffee mug and a small potted plant, a coat hanging on a hook behind, two mismatched client chairs, low morning sun through the front window blinds making stripes on the carpet; lived-in, small imperfections, nobody in frame",
  },
  {
    out: "insurance-agent-desk-after-storm",
    ref: "small-office",
    width: 1376,
    height: 768,
    subject:
      "an insurance agent's desk at the end of a stormy day: rain streaks on the window behind, grey light, a desk phone with one small glowing indicator light, a short stack of plain folders, a blank notepad with a pen, a wet umbrella leaning against the desk with a small puddle under it, a half-finished cup of coffee; there is NO laptop and NO computer on the desk; nobody in frame",
  },
]
