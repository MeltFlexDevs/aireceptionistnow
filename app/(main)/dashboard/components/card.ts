/**
 * The dashboard's card surface, defined once.
 *
 * Before this there were three `const CARD` declarations across the dashboard
 * plus a handful of inline copies, and they had drifted: the calls pages used
 * rounded-xl while the assistant page used rounded-2xl, so two screens of the
 * same product had visibly different corners. One definition, one radius.
 *
 * Padding is deliberately NOT baked in. Cards wrap everything from a dense
 * table to a settings panel, and a card that forces its own padding gets fought
 * with overrides at every call site.
 */
export const CARD = "rounded-2xl border border-neutral-200 bg-white";

/**
 * A card that is itself a control - the whole surface is clickable.
 *
 * The hover is a lift and a soft shadow, nothing more. It replaced a per-card
 * chevron (redundant on a surface that is entirely a button) and an icon tile
 * that inverted to black on hover, which pulled the eye to the glyph instead of
 * the card it was meant to highlight.
 */
export const CARD_INTERACTIVE =
  `${CARD} text-left transition-all hover:-translate-y-0.5 hover:border-neutral-300` +
  " hover:shadow-[0_6px_20px_-8px_rgba(0,0,0,0.18)]";

/**
 * Section heading above a group of cards. Uppercased in CSS rather than in the
 * dictionaries, so translators write normal sentence case and every locale
 * still renders as a label.
 */
export const SECTION_HEADING =
  "mb-3 text-[13px] font-semibold tracking-wide text-neutral-400 uppercase";
