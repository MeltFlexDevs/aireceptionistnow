/**
 * Patch semantics for saving a receptionist.
 *
 * The action used to rebuild every field from formData on every save, so any
 * form that did not carry a field silently wiped it: transfer number, SMS
 * alerts, calendar access and email recaps all vanished, name reset to
 * "My assistant" and language to "en". The page only avoided that by always
 * submitting everything, plus a hidden `language=multi` crutch - which is
 * exactly why one-topic modals were blocked on this.
 *
 * The rule here: a field changes only if its section was actually submitted.
 * Sections announce themselves with a hidden marker, because an unchecked
 * checkbox and an absent form section look identical in FormData otherwise.
 *
 * Kept free of I/O so it can be tested directly - see assistant-patch.test.ts.
 */

import { MAX_CUSTOM_TOOLS, parseParamLines } from "../call-engine/agent/custom-tools";
import { MAX_TARGETS } from "../call-engine/escalation";

export const SECTION = {
  basics: "_s_basics",
  role: "_s_role",
  alerts: "_s_alerts",
  calendar: "_s_calendar",
  email: "_s_email",
  voice: "_s_voice",
  voiceLang: "_s_voicelang",
  crm: "_s_crm",
  escalation: "_s_escalation",
  guardrails: "_s_guardrails",
  customTools: "_s_customtools",
} as const;

export interface PatchPrev {
  name: string;
  greeting: string;
  system_prompt: string;
  voice_id: string;
  language: string;
  routing: Record<string, unknown>;
}

export interface PatchContext {
  /** Calendar integration ids, for reading cal_access_<id> fields. */
  calendarIds: string[];
  /** CRM integration ids, for reading crm_target_<id> fields. */
  crmIds: string[];
}

export interface AssistantPatch {
  /** Only the top-level columns this submit actually carried. */
  top: Partial<Pick<PatchPrev, "name" | "greeting" | "system_prompt" | "voice_id" | "language">>;
  /** The full routing object to store: previous, with submitted parts applied. */
  routing: Record<string, unknown>;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/**
 * `Number(null)` and `Number("")` are both 0, and `Number.isFinite(0)` is true -
 * so a `formData.has()` guard alone still floors a slider to its clamp minimum.
 * Parse first, then reject absent and blank explicitly.
 */
function numberOrNull(form: FormData, key: string): number | null {
  const raw = form.get(key);
  if (raw === null) return null;
  const text = String(raw).trim();
  if (!text) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

/** Same, for a value already pulled out of stored routing rather than a form. */
function str2(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

interface WeeklyHours {
  timezone: string;
  days: ({ start: string; end: string } | null)[];
}

/**
 * Read one weekly schedule out of the form.
 *
 * Shared by the legacy transfer-hours fields and by each escalation
 * destination's own schedule, so the "no timezone or every day closed means no
 * restriction" rule has exactly one implementation - and stays in step with
 * parseTransferHours, which rejects the same shapes on the way back out.
 *
 * Returns `{}` when the section did not carry the timezone field at all, which
 * the callers treat as "leave whatever is stored alone".
 */
function buildHours(
  form: FormData,
  tzKey: string,
  keys: (day: number) => { on: string; start: string; end: string },
): { hours?: WeeklyHours } {
  if (!form.has(tzKey)) return {};
  const timezone = str(form, tzKey);
  const days: WeeklyHours["days"] = [];
  for (let i = 0; i < 7; i++) {
    const k = keys(i);
    // Absent checkbox = that day is closed.
    if (form.get(k.on) !== "on") {
      days.push(null);
      continue;
    }
    const start = str(form, k.start);
    const end = str(form, k.end);
    days.push(start && end ? { start, end } : null);
  }
  if (!timezone || !days.some((d) => d !== null)) return {};
  return { hours: { timezone, days } };
}

export function buildAssistantPatch(
  form: FormData,
  prev: PatchPrev,
  ctx: PatchContext,
  /**
   * Per-language voices, resolved by the action (library voices need an async
   * import step). Only consulted when the voice-language section was submitted.
   */
  resolvedVoiceByLanguage?: Record<string, string>,
  /**
   * Workspace-secret ids for custom-action auth headers, keyed by row key, also
   * resolved by the action. The plaintext value never reaches this module, so a
   * credential cannot end up in the routing jsonb by accident.
   */
  resolvedToolSecrets?: Record<string, string>,
): AssistantPatch {
  const submitted = (section: string) => form.get(section) !== null;

  const top: AssistantPatch["top"] = {};
  if (submitted(SECTION.basics)) {
    // A blank name falls back to the CURRENT name, never to a placeholder.
    if (form.has("name")) top.name = str(form, "name") || prev.name;
    if (form.has("greeting")) top.greeting = str(form, "greeting");
    if (form.has("voice_id")) top.voice_id = str(form, "voice_id");
    // No "en" default: an unsubmitted language stays whatever it was.
    if (form.has("language")) {
      const lang = str(form, "language");
      if (lang) top.language = lang;
    }
  }
  if (submitted(SECTION.role) && form.has("system_prompt")) {
    top.system_prompt = str(form, "system_prompt");
  }

  // Start from what is already stored and overlay only what was submitted.
  // greetingByLanguage / autoVoiceByLanguage ride along for free this way -
  // they are precomputed by the sync and cost ~25 Gemini calls to rebuild.
  const routing: Record<string, unknown> = { ...prev.routing };

  if (submitted(SECTION.alerts)) {
    // Present section + absent checkbox = the user turned it off.
    routing.smsAlerts = form.get("sms_alerts") === "on";

    // The single-number transfer fields are legacy: the escalation editor
    // replaced them and does not carry them. Guarded on the field itself rather
    // than on the section, so a form that owns sms_alerts but not the number
    // cannot wipe a destination - the same rule transfer_hours_tz already uses,
    // and the reason this module exists.
    if (form.has("transfer_to")) {
      const transferTo = str(form, "transfer_to");
      if (transferTo) {
        routing.transferTo = transferTo;
      } else {
        delete routing.transferTo;
      }
    }

    // Transfer hours ride in the same section as the number they constrain.
    // Guarded on the timezone field rather than on the section alone: a form
    // that predates this feature still submits SECTION.alerts, and rebuilding
    // from fields it never carried would silently wipe a saved schedule - the
    // exact bug the whole patch module exists to prevent.
    // No timezone or every day closed means "no restriction". Storing that as
    // a schedule would read as "never transfer", which is not what an empty
    // form means - parseTransferHours rejects it too, so keep the two in step.
    if (form.has("transfer_hours_tz")) {
      const { hours } = buildHours(form, "transfer_hours_tz", (day) => ({
        on: `transfer_day_${day}`,
        start: `transfer_start_${day}`,
        end: `transfer_end_${day}`,
      }));
      if (hours) routing.transferHours = hours;
      else delete routing.transferHours;
    }
  }

  // Named escalation destinations. Guarded on esc_keys (which the editor always
  // submits) rather than on the marker alone, for the reason at the top of this
  // file: a form that predates the editor must not rebuild - and so erase - a
  // list of fields it never carried.
  //
  // Rows are addressed by a stable per-row key rather than by position. Removing
  // the second of four destinations would otherwise renumber the two below it,
  // and every uncontrolled input in those rows - including a whole weekly
  // schedule - would submit under a name that now belongs to a different row.
  if (submitted(SECTION.escalation) && form.has("esc_keys")) {
    const keys = str(form, "esc_keys")
      .split(",")
      .map((k) => k.trim())
      // The key reaches us from the client and is interpolated into field
      // lookups, so accept only the shape the editor generates.
      .filter((k) => /^[a-z0-9]{1,16}$/.test(k))
      .slice(0, MAX_TARGETS);

    const targets: Record<string, unknown>[] = [];
    for (const key of keys) {
      const number = str(form, `esc_${key}_number`);
      // A row with no number is an empty row the user left behind, not a
      // destination. parseEscalation would drop it anyway; dropping it here
      // keeps the stored config honest about what is configured.
      if (!number) continue;
      const warmRaw = str(form, `esc_${key}_warm`);
      targets.push({
        id: key,
        label: str(form, `esc_${key}_label`),
        number,
        when: str(form, `esc_${key}_when`),
        // "" means the operator has not chosen, which must stay distinct from
        // "cold" - see EscalationTarget.warm.
        ...(warmRaw === "warm" ? { warm: true } : warmRaw === "cold" ? { warm: false } : {}),
        ...buildHours(form, `esc_${key}_tz`, (day) => ({
          on: `esc_${key}_day_${day}`,
          start: `esc_${key}_start_${day}`,
          end: `esc_${key}_end_${day}`,
        })),
      });
    }

    const triggers = str(form, "esc_triggers")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const sla = numberOrNull(form, "esc_sla");
    const pageNumber = str(form, "esc_page_number");

    const escalation: Record<string, unknown> = { targets };
    if (triggers.length) escalation.triggers = triggers;
    if (sla !== null) escalation.callbackSlaMinutes = sla;
    if (form.get("esc_page") === "on" || pageNumber) {
      escalation.page = { enabled: form.get("esc_page") === "on", number: pageNumber };
    }
    routing.escalation = escalation;

    // Mirror the primary destination onto the legacy field. `transferTo` is no
    // longer read by the call engine when destinations exist (parseEscalation
    // prefers them), but the setup checklist, the test-call button and
    // onboarding still key off it. Keeping it in step is one line here versus
    // teaching four unrelated call sites about escalation.
    const primary = targets[0]?.number;
    if (typeof primary === "string" && primary) routing.transferTo = primary;
    else delete routing.transferTo;
  }

  // The business's own actions. Keyed rows, same as escalation and for the same
  // reason - see the note there.
  if (submitted(SECTION.customTools) && form.has("ct_keys")) {
    const keys = str(form, "ct_keys")
      .split(",")
      .map((k) => k.trim())
      .filter((k) => /^[a-z0-9]{1,16}$/.test(k))
      .slice(0, MAX_CUSTOM_TOOLS);

    const prevTools = Array.isArray(prev.routing.customTools)
      ? (prev.routing.customTools as Record<string, unknown>[])
      : [];

    const tools: Record<string, unknown>[] = [];
    for (const key of keys) {
      const name = str(form, `ct_${key}_name`);
      const url = str(form, `ct_${key}_url`);
      if (!name || !url) continue; // an empty row the operator left behind

      // The header VALUE never passes through here - the action exchanges it for
      // an ElevenLabs workspace secret and hands back the id, so no credential
      // is ever written to our database. An unchanged row keeps its stored id.
      const previous = prevTools.find((t) => str2(t.id) === key);
      const authSecretId = resolvedToolSecrets?.[key] ?? str2(previous?.authSecretId);

      tools.push({
        id: key,
        name,
        description: str(form, `ct_${key}_description`),
        url,
        method: str(form, `ct_${key}_method`) === "GET" ? "GET" : "POST",
        params: parseParamLines(String(form.get(`ct_${key}_params`) ?? "")),
        timeoutSecs: numberOrNull(form, `ct_${key}_timeout`) ?? 8,
        authHeader: str(form, `ct_${key}_auth_header`),
        ...(authSecretId ? { authSecretId } : {}),
        enabled: form.get(`ct_${key}_enabled`) !== "off",
      });
    }
    if (tools.length) routing.customTools = tools;
    else delete routing.customTools;
  }

  if (submitted(SECTION.guardrails)) {
    const lines = (key: string): string[] =>
      str(form, key)
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    const neverDiscuss = lines("guardrail_never");
    const alwaysEscalate = lines("guardrail_escalate");
    if (neverDiscuss.length || alwaysEscalate.length) {
      routing.guardrails = { neverDiscuss, alwaysEscalate };
    } else {
      delete routing.guardrails;
    }

    const disclosure = str(form, "disclosure");
    if (disclosure === "upfront" || disclosure === "deflect") routing.disclosure = disclosure;
    else if (disclosure === "if_asked") delete routing.disclosure; // the default needs no row
  }

  if (submitted(SECTION.calendar)) {
    const access: Array<{ integrationId: string; level: string }> = [];
    for (const id of ctx.calendarIds) {
      const raw = String(form.get(`cal_access_${id}`) ?? "none");
      const level = raw === "busy" ? "read" : raw;
      if (level === "read" || level === "write") access.push({ integrationId: id, level });
    }
    routing.calendar = { access };
  }

  if (submitted(SECTION.crm)) {
    const targets: Array<{ integrationId: string }> = [];
    for (const id of ctx.crmIds) {
      if (form.get(`crm_target_${id}`) === "on") targets.push({ integrationId: id });
    }
    if (targets.length) routing.crm = { targets };
    else delete routing.crm;
  }

  if (submitted(SECTION.email)) {
    const to = str(form, "email_to");
    if (to) {
      routing.emailTranscripts = { enabled: form.get("email_enabled") === "on", to };
    } else {
      delete routing.emailTranscripts;
    }
  }

  if (submitted(SECTION.voice)) {
    // Absence is the default ("fast"), so there is no row to store for it.
    if (form.has("voice_tier")) {
      if (str(form, "voice_tier") === "natural") routing.voiceTier = "natural";
      else delete routing.voiceTier;
    }

    const prevVoice = (prev.routing.voice ?? {}) as Record<string, number>;
    const voice: Record<string, number> = { ...prevVoice };
    const speed = numberOrNull(form, "voice_speed");
    if (speed !== null) voice.speed = clamp(speed, 0.7, 1.2);
    const stability = numberOrNull(form, "voice_stability");
    if (stability !== null) voice.stability = clamp(stability, 0, 1);
    if (Object.keys(voice).length) routing.voice = voice;
    else delete routing.voice;
  }

  if (submitted(SECTION.voiceLang)) {
    const byLang = resolvedVoiceByLanguage ?? {};
    if (Object.keys(byLang).length) routing.voiceByLanguage = byLang;
    else delete routing.voiceByLanguage;
  }

  return { top, routing };
}
