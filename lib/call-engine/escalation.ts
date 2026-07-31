/**
 * Who a caller can be handed to, and when.
 *
 * This generalizes the single `routing.transferTo` number into a list of named
 * destinations ("Front desk", "On-call plumber", "Billing"), each with its own
 * condition and its own schedule. The receptionist stops being a dead end the
 * moment the one configured phone is unattended.
 *
 * ENFORCEMENT IS THE SAME AS transfer-hours.ts, and it is worth restating:
 * `transfer_to_number` is an ElevenLabs BUILT-IN system tool, and built-in
 * tools cannot be overridden per conversation. So the destination list is baked
 * into the agent at sync time, and the only thing that varies per call is the
 * prompt - `{{transfer_policy}}`, filled by app/api/agent/init/route.ts, states
 * which destinations are reachable right now. That is strong steering, not a
 * platform block. Do not treat these hours as a compliance control.
 *
 * Deliberately NOT supported: the SDK's `uui` field on a transfer only travels
 * over SIP REFER. These numbers are Twilio-backed, so it would be a knob that
 * silently does nothing. Left out rather than shipped as decoration.
 *
 * Kept free of I/O so the rules can be tested directly - see escalation.test.ts.
 */

import {
  TRANSFER_POLICY_OPEN,
  describeTransferHours,
  isTransferOpen,
  parseTransferHours,
  transferPolicyLine,
  type TransferHours,
} from "./transfer-hours";

/** A human (or a team) the receptionist can hand the caller to. */
export interface EscalationTarget {
  /** Stable id, so the dashboard can edit a row without reordering the rest. */
  id: string;
  /** What the agent calls this destination out loud, e.g. "Billing". */
  label: string;
  /** E.164. A target without a dialable number is dropped at parse time. */
  number: string;
  /** The operator's own words for when this destination applies. May be blank. */
  when: string;
  /** Optional per-target schedule. null = always reachable. */
  hours: TransferHours | null;
  /**
   * Tri-state on purpose. true = conference (the agent stays bridged and can
   * brief the person), false = blind drop, null = the operator has not said, so
   * the ElevenLabs platform default applies. null is what every pre-existing
   * assistant gets, and it is the only value that provably does not change how
   * their transfers already behave.
   */
  warm: boolean | null;
}

export interface EscalationPage {
  /** Ring the owner for an urgent message. OFF by default - it costs a call. */
  enabled: boolean;
  /** Who to ring. Blank falls back to the first target's number. */
  number: string;
}

export interface EscalationConfig {
  targets: EscalationTarget[];
  /** Operator's own escalate-now situations, rendered into the prompt verbatim. */
  triggers: string[];
  /** How fast the business promises to call back. null = no promise made. */
  callbackSlaMinutes: number | null;
  page: EscalationPage;
}

/** Above this the prompt bloats and the transfer conditions blur into each other. */
export const MAX_TARGETS = 5;
const MAX_TRIGGERS = 10;
const MAX_LABEL_CHARS = 60;
const MAX_WHEN_CHARS = 200;
const MAX_TRIGGER_CHARS = 120;

const E164 = /^\+[1-9]\d{6,15}$/;

/** Callback promises outside this range are typos, not policies. */
const MIN_SLA_MINUTES = 5;
const MAX_SLA_MINUTES = 24 * 60;

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseTarget(raw: unknown, index: number): EscalationTarget | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;

  // A target you cannot dial is not a target. Dropping it is the honest
  // outcome: the alternative is an agent that promises a hand-off and fails
  // it on air.
  const number = text(obj.number, 20);
  if (!E164.test(number)) return null;

  return {
    id: text(obj.id, 40) || `t${index}`,
    label: text(obj.label, MAX_LABEL_CHARS) || "our team",
    number,
    when: text(obj.when, MAX_WHEN_CHARS),
    hours: parseTransferHours(obj.hours),
    warm: obj.warm === true ? true : obj.warm === false ? false : null,
  };
}

/**
 * The `transferType` for one destination, or undefined to leave the platform
 * default in place. See EscalationTarget.warm for why undefined is not the same
 * as "blind" here.
 */
export function transferTypeFor(target: EscalationTarget): "conference" | "blind" | undefined {
  if (target.warm === true) return "conference";
  if (target.warm === false) return "blind";
  return undefined;
}

function parsePage(raw: unknown): EscalationPage {
  const obj = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const number = text(obj.number, 20);
  return {
    enabled: obj.enabled === true,
    number: E164.test(number) ? number : "",
  };
}

/**
 * Normalize `routing` into an escalation config.
 *
 * BACK-COMPAT IS THE POINT. Every live assistant configured before this feature
 * has `routing.transferTo` and maybe `routing.transferHours` and nothing else.
 * Those are synthesized into a single unnamed target here, so the whole rest of
 * the system can read one shape and no existing setup changes behaviour. Only
 * an explicit, non-empty `routing.escalation.targets` overrides them.
 */
export function parseEscalation(routing: unknown): EscalationConfig {
  const r = routing && typeof routing === "object" ? (routing as Record<string, unknown>) : {};
  const esc =
    r.escalation && typeof r.escalation === "object" && !Array.isArray(r.escalation)
      ? (r.escalation as Record<string, unknown>)
      : {};

  const rawTargets = Array.isArray(esc.targets) ? esc.targets : [];
  const targets: EscalationTarget[] = [];
  // Ids are used as identity when splitting open from closed destinations, so a
  // duplicate stored id would silently merge two rows. Re-key the collision
  // rather than dropping the row - the operator meant to have both.
  const usedIds = new Set<string>();
  for (const [i, raw] of rawTargets.entries()) {
    if (targets.length >= MAX_TARGETS) break;
    const target = parseTarget(raw, i);
    if (!target) continue;
    while (usedIds.has(target.id)) target.id = `${target.id}_${i}`;
    usedIds.add(target.id);
    targets.push(target);
  }

  // Legacy single-number setup. Synthesized only when no explicit target
  // survived parsing, so a valid new config always wins.
  if (targets.length === 0) {
    const legacy = text(r.transferTo, 20);
    if (E164.test(legacy)) {
      targets.push({
        id: "legacy",
        label: "our team",
        number: legacy,
        when: "",
        hours: parseTransferHours(r.transferHours),
        warm: null, // never impose a transfer type on a setup that predates the choice
      });
    }
  }

  const triggers: string[] = [];
  if (Array.isArray(esc.triggers)) {
    for (const raw of esc.triggers) {
      if (triggers.length >= MAX_TRIGGERS) break;
      const trigger = text(raw, MAX_TRIGGER_CHARS);
      if (trigger) triggers.push(trigger);
    }
  }

  const slaRaw = Number(esc.callbackSlaMinutes);
  const callbackSlaMinutes =
    Number.isFinite(slaRaw) && slaRaw >= MIN_SLA_MINUTES && slaRaw <= MAX_SLA_MINUTES
      ? Math.round(slaRaw)
      : null;

  return { targets, triggers, callbackSlaMinutes, page: parsePage(esc.page) };
}

/** Destinations reachable at `at`. Fails open, exactly like isTransferOpen. */
export function openTargets(cfg: EscalationConfig, at: Date): EscalationTarget[] {
  return cfg.targets.filter((t) => isTransferOpen(t.hours, at));
}

/**
 * Does availability vary with the clock?
 *
 * When it does, the synced prompt has to carry `{{transfer_policy}}` and let the
 * call-start webhook fill it. When it does not, the static destination list in
 * the prompt already says everything true, and a placeholder would only add a
 * round trip's worth of fragility.
 */
export function needsPerCallPolicy(cfg: EscalationConfig): boolean {
  return cfg.targets.some((t) => t.hours !== null);
}

/**
 * Where operational alerts about this line should go - the SMS for a new
 * message or a booking that could not be completed.
 *
 * Independent of whether paging is enabled: texting is free and always on. This
 * is also what keeps the alerts working for an operator who moves from the
 * legacy single `transferTo` to named destinations - without it, adopting
 * destinations would silently stop every SMS.
 */
export function alertNumber(cfg: EscalationConfig): string {
  return cfg.page.number || cfg.targets[0]?.number || "";
}

/** Where the urgent page should ring. Blank means paging is off or unusable. */
export function pageNumber(cfg: EscalationConfig): string {
  return cfg.page.enabled ? alertNumber(cfg) : "";
}

function whenClause(target: EscalationTarget): string {
  return target.when || `the caller needs ${target.label}`;
}

/**
 * The `condition` on a single `transfers[]` entry.
 *
 * `gated` adds the clause that stops the tool config from contradicting the
 * per-call prompt: without it the tool advertises an unconditional "caller asked
 * for a human => transfer", which is exactly what {{transfer_policy}} may be
 * forbidding right now.
 */
export function transferCondition(target: EscalationTarget, gated: boolean): string {
  const base =
    target.when ||
    "The caller asks to speak to a person, asks to be transferred, or has a request beyond what you can handle";
  const named = `${base}. This destination is ${target.label}.`;
  if (!gated) return named;
  return (
    `${named} Only use it when your instructions for this call say ${target.label} is available right now.` +
    ` Never use it when your instructions say ${target.label} is unavailable.`
  );
}

/**
 * The static block naming the destinations, composed once at sync time.
 *
 * Availability is deliberately absent - that is {{transfer_policy}}'s job, and
 * duplicating it here would let a prompt composed at save time contradict the
 * truth at call time.
 */
export function describeTargets(cfg: EscalationConfig): string {
  if (cfg.targets.length === 0) return "";
  if (cfg.targets.length === 1) {
    const only = cfg.targets[0];
    return only.when
      ? `You can hand the caller to a person with transfer_to_number when ${only.when}.`
      : "If the caller needs a person, asks to be transferred, or has a request beyond what you can handle, use transfer_to_number to hand off.";
  }
  const lines = cfg.targets.map((t) => `- ${t.label}: when ${whenClause(t)}.`);
  return [
    "You can hand the caller to a person with transfer_to_number. These are the destinations and when each one applies:",
    lines.join("\n"),
    "Pick the destination that fits what the caller actually needs; never read this list out loud.",
  ].join("\n");
}

/** "Billing (reachable Mon-Fri 09:00-17:00, Europe/Bratislava time)". */
function unavailableClause(target: EscalationTarget): string {
  const when = describeTransferHours(target.hours);
  if (!when || !target.hours) return target.label;
  return `${target.label} (reachable ${when}, ${target.hours.timezone} time)`;
}

function closedOnlyLine(closed: EscalationTarget[]): string {
  const windows = closed.filter((t) => t.hours && describeTransferHours(t.hours));
  const window = windows.length
    ? ` A person can be reached: ${windows.map(unavailableClause).join("; ")}.`
    : "";
  return (
    `No one is available to take a transfer right now.${window}` +
    " Do NOT use transfer_to_number at any point during this call." +
    " If the caller asks for a person, tell them plainly that nobody is available to take the call right now, say when someone will be, and offer to take a message instead."
  );
}

/**
 * What to tell the agent about hand-offs for a call starting at `at` - the value
 * of the `{{transfer_policy}}` dynamic variable.
 *
 * The single-target case delegates straight to transferPolicyLine, so the
 * wording every existing assistant already gets (and its regression suite) is
 * untouched. Only a multi-destination setup composes a new line.
 */
export function escalationPolicyLine(cfg: EscalationConfig, at: Date): string {
  // No dialable destination at all: the prompt cannot have promised one, but
  // the variable still has to carry something. The permissive default matches
  // every other no-config path in this system.
  if (cfg.targets.length === 0) return TRANSFER_POLICY_OPEN;
  if (cfg.targets.length === 1) return transferPolicyLine(cfg.targets[0].hours, at);

  const open = openTargets(cfg, at);
  if (open.length === 0) return closedOnlyLine(cfg.targets);

  const openIds = new Set(open.map((t) => t.id));
  const closed = cfg.targets.filter((t) => !openIds.has(t.id));

  const parts = [`Right now you can transfer to: ${open.map((t) => t.label).join(", ")}.`];
  if (closed.length > 0) {
    parts.push(
      `You cannot transfer to: ${closed.map(unavailableClause).join("; ")}.` +
        " If the caller needs one of those, tell them plainly that nobody there is available right now, say when someone will be, and offer to take a message instead.",
    );
  }
  return parts.join(" ");
}

/** Human-readable schedule summary for the dashboard card. */
export function describeEscalation(cfg: EscalationConfig): string {
  if (cfg.targets.length === 0) return "";
  return cfg.targets
    .map((t) => {
      const hours = describeTransferHours(t.hours);
      return hours ? `${t.label} · ${hours}` : t.label;
    })
    .join(" · ");
}
