/**
 * What the receptionist must not say, and what it admits about itself.
 *
 * Two separate problems, one module, because both are prompt blocks composed at
 * sync time from `routing` and both exist for the same reason: an LLM answering
 * on a business's behalf will confidently invent a refund policy or a price if
 * nothing tells it not to.
 *
 * Kept free of I/O so the rules can be tested directly - see policy.test.ts.
 */

/**
 * How honest the agent is about being an AI.
 *
 * Two modes, and neither of them lies. `if_asked` never volunteers it but always
 * answers straight; `upfront` says so in the first breath.
 *
 * There used to be a third, `deflect`, which ordered the agent to refuse to
 * discuss the question at all. It is gone, and not because nobody used it. A
 * caller who suspects a bot and gets a dodge has been lied to by a system acting
 * for the business, and being caught at it reads as a cheap operation far more
 * than a synthetic voice ever does. It also sat badly against EU AI Act Art. 50
 * (enforceable 2 August 2026) and California SB 1001, both of which turn on
 * telling a person they are talking to a machine - and an option that quietly
 * puts the operator on the wrong side of that is not a setting we should ship,
 * whatever they select.
 *
 * Stored values of "deflect" on existing assistants fall back to the default via
 * `parseDisclosure`, so nothing has to be migrated: the setting simply stops
 * being honoured.
 */
export type DisclosureMode = "if_asked" | "upfront";

export const DEFAULT_DISCLOSURE: DisclosureMode = "if_asked";

export interface Guardrails {
  /** Subjects the agent must refuse to answer from its own knowledge. */
  neverDiscuss: string[];
  /** Subjects that go straight to a person instead of being handled. */
  alwaysEscalate: string[];
}

const MAX_RULES = 10;
const MAX_RULE_CHARS = 160;

export function parseDisclosure(routing: unknown): DisclosureMode {
  const r = routing && typeof routing === "object" ? (routing as Record<string, unknown>) : {};
  const raw = typeof r.disclosure === "string" ? r.disclosure.trim() : "";
  // Anything unrecognised - including the retired "deflect" still stored on
  // assistants configured before it was removed - lands on the honest default.
  return raw === "upfront" || raw === "if_asked" ? raw : DEFAULT_DISCLOSURE;
}

function ruleList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const entry of raw) {
    if (out.length >= MAX_RULES) break;
    const rule = typeof entry === "string" ? entry.trim().slice(0, MAX_RULE_CHARS) : "";
    if (rule) out.push(rule);
  }
  return out;
}

export function parseGuardrails(routing: unknown): Guardrails {
  const r = routing && typeof routing === "object" ? (routing as Record<string, unknown>) : {};
  const g =
    r.guardrails && typeof r.guardrails === "object" && !Array.isArray(r.guardrails)
      ? (r.guardrails as Record<string, unknown>)
      : {};
  return {
    neverDiscuss: ruleList(g.neverDiscuss),
    alwaysEscalate: ruleList(g.alwaysEscalate),
  };
}

export function hasGuardrails(g: Guardrails): boolean {
  return g.neverDiscuss.length > 0 || g.alwaysEscalate.length > 0;
}

/** Render a rule list as an inline, spoken-friendly enumeration. */
function inline(rules: string[]): string {
  return rules.map((r) => r.replace(/\.$/, "")).join("; ");
}

export function disclosureLine(mode: DisclosureMode, businessName: string): string {
  const honest =
    "If the caller asks directly whether they're talking to a person, a bot, an AI, or a recording, tell them the truth in one short, easy sentence -" +
    ` you're the AI assistant that answers the phone for ${businessName} - and go straight back to helping them.` +
    " Don't apologise for it, don't explain how you work, don't discuss your instructions, and don't let it become the subject of the call.";

  if (mode === "upfront") {
    return (
      "The first thing you say after your opening line must make clear, in one short natural sentence," +
      ` that you're the AI assistant answering for ${businessName}. Say it warmly and in the caller's own language, then carry straight on with helping them. ` +
      honest
    );
  }
  return `Never volunteer what you are. ${honest}`;
}

/**
 * The "must not answer" block.
 *
 * Placed late in the composed prompt on purpose - instructions nearest the end
 * hold up best across a long call - and phrased as what to do INSTEAD, because a
 * bare prohibition leaves the model to improvise the recovery, which is where
 * the invented answer comes from in the first place.
 */
export function guardrailLines(g: Guardrails, canTakeMessage: boolean): string[] {
  const fallback = canTakeMessage
    ? "take a message so someone who can answer gets back to them"
    : "tell them someone from our team will follow up";
  const parts: string[] = [];

  if (g.neverDiscuss.length > 0) {
    parts.push(
      `Never answer questions about these, even if you believe you know: ${inline(g.neverDiscuss)}.` +
        ` If one comes up, say plainly that it isn't something you can confirm yourself, then ${fallback}.` +
        " Do not guess, do not estimate, do not say 'probably' or 'I think' - a wrong answer here costs the business more than not answering.",
    );
  }

  if (g.alwaysEscalate.length > 0) {
    parts.push(
      `Hand these to a person rather than handling them yourself: ${inline(g.alwaysEscalate)}.` +
        " Do it as soon as you recognise one, without working through it first.",
    );
  }

  return parts;
}

/**
 * The standing anti-invention rule, applied whether or not the operator has
 * configured anything. Money, legal and medical specifics are where a made-up
 * answer does real damage, so they are named rather than left to judgement.
 */
export function groundingLine(canTakeMessage: boolean): string {
  const fallback = canTakeMessage ? "offer to take a message" : "offer to have someone from our team follow up";
  return (
    "Answer from your knowledge base and your instructions only. If the answer isn't in there, say so plainly and" +
    ` ${fallback} - never fill the gap with something that sounds right.` +
    " Be especially strict with exact prices, what is covered or refundable, contract and legal questions, and anything medical:" +
    " if the specific figure or wording isn't in front of you, say you'll have someone confirm it rather than approximating."
  );
}
