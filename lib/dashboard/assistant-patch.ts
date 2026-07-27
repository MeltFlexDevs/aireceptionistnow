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

export const SECTION = {
  basics: "_s_basics",
  role: "_s_role",
  alerts: "_s_alerts",
  calendar: "_s_calendar",
  email: "_s_email",
  voice: "_s_voice",
  voiceLang: "_s_voicelang",
  crm: "_s_crm",
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

export function buildAssistantPatch(
  form: FormData,
  prev: PatchPrev,
  ctx: PatchContext,
  /**
   * Per-language voices, resolved by the action (library voices need an async
   * import step). Only consulted when the voice-language section was submitted.
   */
  resolvedVoiceByLanguage?: Record<string, string>,
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
    const transferTo = str(form, "transfer_to");
    if (transferTo) {
      routing.transferTo = transferTo;
    } else {
      delete routing.transferTo;
    }
    // Present section + absent checkbox = the user turned it off.
    routing.smsAlerts = form.get("sms_alerts") === "on";

    // Transfer hours ride in the same section as the number they constrain.
    // Guarded on the timezone field rather than on the section alone: a form
    // that predates this feature still submits SECTION.alerts, and rebuilding
    // from fields it never carried would silently wipe a saved schedule - the
    // exact bug the whole patch module exists to prevent.
    if (form.has("transfer_hours_tz")) {
      const timezone = str(form, "transfer_hours_tz");
      const days: ({ start: string; end: string } | null)[] = [];
      for (let i = 0; i < 7; i++) {
        // Absent checkbox = that day is closed.
        if (form.get(`transfer_day_${i}`) !== "on") {
          days.push(null);
          continue;
        }
        const start = str(form, `transfer_start_${i}`);
        const end = str(form, `transfer_end_${i}`);
        days.push(start && end ? { start, end } : null);
      }
      // No timezone or every day closed means "no restriction". Storing that as
      // a schedule would read as "never transfer", which is not what an empty
      // form means - parseTransferHours rejects it too, so keep the two in step.
      if (timezone && days.some((d) => d !== null)) {
        routing.transferHours = { timezone, days };
      } else {
        delete routing.transferHours;
      }
    }
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
