import { revalidatePath } from "next/cache";

import { syncAssistantAgent, deleteAssistantAgent } from "@/lib/call-engine/agent/sync";
import { parseCustomTools } from "@/lib/call-engine/agent/custom-tools";
import { parseEscalation } from "@/lib/call-engine/escalation";
import { parseDisclosure, parseGuardrails } from "@/lib/call-engine/policy";
import { SUPPORTED_LANGUAGES } from "@/lib/call-engine/voice/phone-language";
import { providerName } from "@/lib/calendar/providers";
import { addSharedVoice } from "@/lib/call-engine/voice/catalog";
import {
  deleteAssistant,
  freeAssistantNumbers,
  getAssistant,
  getAssistantNumber,
  listIntegrations,
  updateAssistant,
} from "@/lib/dashboard/db";
import { buildAssistantPatch, SECTION } from "@/lib/dashboard/assistant-patch";
import { buildSetupItems, setupProgress, voiceName } from "@/lib/dashboard/assistant-setup";
import { ownerTimezone } from "@/lib/dashboard/timezone";
import { readKnowledge } from "@/lib/knowledge/sources";
import { NUMBER_COUNTRIES } from "@/lib/number-pricing";
import { mobileUserId } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The assistant a phone can actually edit.
 *
 * PATCH deliberately takes `{ sections, fields }` rather than a tidy typed
 * object: those two go straight into a FormData and through
 * `buildAssistantPatch`, the exact function the web action uses. The patch
 * rules there (a section only changes if it was submitted; an absent checkbox
 * means off; an absent field means leave it alone) are subtle enough that a
 * second, parallel implementation for mobile would drift and start wiping
 * transfer numbers - which is the bug that module was written to end.
 */

interface PatchBody {
  sections?: unknown;
  fields?: unknown;
}

const SECTION_MARKERS = new Set<string>(Object.values(SECTION));

function toFormData(body: PatchBody): FormData | null {
  const sections = Array.isArray(body.sections) ? body.sections : [];
  const fields =
    body.fields && typeof body.fields === "object" && !Array.isArray(body.fields)
      ? (body.fields as Record<string, unknown>)
      : {};

  const form = new FormData();
  let marked = false;
  for (const s of sections) {
    if (typeof s !== "string" || !SECTION_MARKERS.has(s)) continue;
    form.set(s, "1");
    marked = true;
  }
  // No recognised section marker means the patch would be a no-op that still
  // costs an agent re-sync. Treat it as a bad request instead.
  if (!marked) return null;

  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined) continue;
    // A boolean field is a checkbox on the web. `false` must be an ABSENT key,
    // not the string "false" - buildAssistantPatch reads `=== "on"`.
    if (typeof value === "boolean") {
      if (value) form.set(key, "on");
      continue;
    }
    form.set(key, String(value));
  }
  return form;
}

async function resolveVoiceByLanguage(
  form: FormData,
): Promise<{ byLanguage: Record<string, string>; failed: string[] }> {
  const byLanguage: Record<string, string> = {};
  const failed: string[] = [];
  const cache = new Map<string, Promise<string | null>>();

  await Promise.all(
    SUPPORTED_LANGUAGES.map(async (lang) => {
      const raw = String(form.get(`voice_lang_${lang}`) ?? "").trim();
      if (!raw) return;
      if (!raw.startsWith("lib:")) {
        byLanguage[lang] = raw;
        return;
      }
      const [, owner, voiceId, encName] = raw.split(":");
      if (!owner || !voiceId) return;
      const cacheKey = `${owner}:${voiceId}`;
      let pending = cache.get(cacheKey);
      if (!pending) {
        let name = `Voice (${lang})`;
        try {
          name = decodeURIComponent(encName ?? "").slice(0, 60) || name;
        } catch {
          // keep the generic name
        }
        pending = addSharedVoice(owner, voiceId, name);
        cache.set(cacheKey, pending);
      }
      const accountId = await pending;
      if (accountId) byLanguage[lang] = accountId;
      else failed.push(lang);
    }),
  );

  return { byLanguage, failed };
}

async function ownedAssistant(id: string, userId: string) {
  const assistant = await getAssistant(id).catch(() => null);
  if (!assistant) return null;
  if (assistant.owner_id && assistant.owner_id !== userId) return null;
  return assistant;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await mobileUserId(req);
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const assistant = await ownedAssistant(id, userId);
  if (!assistant) return Response.json({ error: "Not found." }, { status: 404 });

  const [number, integrations, timezone] = await Promise.all([
    getAssistantNumber(id).catch(() => null),
    listIntegrations(userId).catch(() => []),
    ownerTimezone(userId).catch(() => "UTC"),
  ]);

  const routing = (assistant.routing ?? {}) as Record<string, unknown>;
  const escalation = parseEscalation(routing);
  const guardrails = parseGuardrails(routing);
  const calAccess =
    (routing.calendar as { access?: Array<{ integrationId: string; level: string }> } | undefined)
      ?.access ?? [];
  const emailCfg =
    (routing.emailTranscripts as { enabled?: boolean; to?: string } | undefined) ?? {};
  const voiceCfg = (routing.voice as { speed?: number; stability?: number } | undefined) ?? {};

  const calendarIntegrations = integrations.filter((i) => i.type === "calendar");

  // Count only access entries that still resolve to a live integration.
  // Reconnecting a provider mints a NEW integration row, so the assistant is
  // left pointing at an id that no longer exists - it cannot book, but a naive
  // count of the stored list says it can, and the setup badge goes green on an
  // assistant that will fail the first time a caller asks for an appointment.
  const liveIds = new Set(calendarIntegrations.map((i) => i.id));
  const usableAccess = calAccess.filter(
    (a) => a.level !== "none" && liveIds.has(a.integrationId),
  );

  const setup = buildSetupItems({
    voiceId: assistant.voice_id ?? "",
    greeting: assistant.greeting ?? "",
    transferTo: escalation.targets[0]?.number ?? "",
    calendarsConnected: calendarIntegrations.length,
    calendarAccessCount: usableAccess.length,
    systemPrompt: assistant.system_prompt ?? "",
  });

  return Response.json({
    id: assistant.id,
    name: assistant.name,
    greeting: assistant.greeting ?? "",
    systemPrompt: assistant.system_prompt ?? "",
    language: assistant.language ?? "multi",
    voiceId: assistant.voice_id ?? "",
    voiceName: voiceName(assistant.voice_id ?? ""),
    enabled: assistant.enabled,
    connected: Boolean(assistant.elevenlabs_agent_id),
    number: number?.e164 ?? "",
    numberId: number?.id ?? "",
    timezone,
    smsAlerts: (routing.smsAlerts as boolean | undefined) ?? true,
    emailTranscripts: { enabled: emailCfg.enabled ?? false, to: emailCfg.to ?? "" },
    voice: {
      tier: routing.voiceTier === "natural" ? "natural" : "fast",
      speed: voiceCfg.speed ?? 1,
      stability: voiceCfg.stability ?? 0.5,
      byLanguage: (routing.voiceByLanguage as Record<string, string> | undefined) ?? {},
    },
    escalation: {
      targets: escalation.targets.map((t) => ({
        id: t.id,
        label: t.label ?? "",
        number: t.number,
        when: t.when ?? "",
        warm: t.warm ?? null,
        hours: t.hours ?? null,
      })),
      triggers: escalation.triggers ?? [],
      callbackSlaMinutes: escalation.callbackSlaMinutes ?? null,
      page: escalation.page ?? null,
    },
    guardrails: {
      neverDiscuss: guardrails.neverDiscuss ?? [],
      alwaysEscalate: guardrails.alwaysEscalate ?? [],
      disclosure: parseDisclosure(routing),
    },
    customTools: parseCustomTools(routing).map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description ?? "",
      url: t.url,
      method: t.method,
      timeoutSecs: t.timeoutSecs,
      authHeader: t.authHeader ?? "",
      hasSecret: Boolean(t.authSecretId),
      enabled: t.enabled,
      params: t.params,
    })),
    calendars: calendarIntegrations
      .map((i) => ({
        id: i.id,
        provider: i.provider,
        name: providerName(i.provider),
        level: calAccess.find((a) => a.integrationId === i.id)?.level ?? "none",
      })),
    setup: {
      items: setup.map((i) => ({ key: i.key, done: i.done })),
      percent: setupProgress(setup).percent,
    },
    // For the "get a number" picker. Sent with the assistant rather than from a
    // route of its own because this is the only screen that asks for it.
    numberCountries: NUMBER_COUNTRIES.map((c) => ({
      code: c.code,
      name: c.name,
      flag: c.flag,
    })),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await mobileUserId(req);
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const existing = await ownedAssistant(id, userId);
  if (!existing) return Response.json({ error: "Not found." }, { status: 404 });

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  const form = toFormData(body);
  if (!form) return Response.json({ error: "Nothing to save." }, { status: 400 });

  const [integrations, voices] = await Promise.all([
    listIntegrations(userId).catch(() => []),
    resolveVoiceByLanguage(form),
  ]);

  // The app does not edit custom-action credentials (an auth header typed on a
  // phone is a support ticket waiting to happen), so no secret exchange runs
  // here - an unchanged row keeps its stored secret id via buildAssistantPatch.
  const { top, routing } = buildAssistantPatch(
    form,
    {
      name: existing.name,
      greeting: existing.greeting,
      system_prompt: existing.system_prompt,
      voice_id: existing.voice_id,
      language: existing.language,
      routing: (existing.routing ?? {}) as Record<string, unknown>,
    },
    {
      calendarIds: integrations.filter((c) => c.type === "calendar").map((c) => c.id),
      crmIds: integrations.filter((c) => c.type === "crm").map((c) => c.id),
    },
    voices.byLanguage,
    {},
  );

  try {
    await updateAssistant(id, {
      ...top,
      knowledge: { ...readKnowledge(existing.knowledge) },
      routing,
    });
  } catch (err) {
    console.error("[mobile:assistant-patch]", err);
    return Response.json({ error: "Could not save." }, { status: 500 });
  }

  // Awaited for the same reason the web action awaits it: two quick saves must
  // serialise onto the live agent, and a sync failure has to reach the user.
  try {
    await syncAssistantAgent(id);
  } catch (err) {
    console.error("[mobile:assistant-sync]", err);
    return Response.json(
      { ok: true, warning: "Saved, but updating the live receptionist failed. Try again." },
      { status: 200 },
    );
  }

  revalidatePath(`/dashboard/assistant/${id}`);
  revalidatePath("/dashboard/assistant");
  revalidatePath("/dashboard");

  return Response.json({
    ok: true,
    warning: voices.failed.length
      ? `Could not import a voice for: ${voices.failed.join(", ")}. Those languages use the default voice.`
      : null,
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await mobileUserId(req);
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const existing = await ownedAssistant(id, userId);
  if (!existing) return Response.json({ error: "Not found." }, { status: 404 });

  try {
    await deleteAssistant(id);
    await freeAssistantNumbers(id);
  } catch (err) {
    console.error("[mobile:assistant-delete]", err);
    return Response.json({ error: "Could not delete." }, { status: 500 });
  }

  await deleteAssistantAgent(existing).catch((err) =>
    console.error("[mobile:assistant-teardown]", err),
  );

  revalidatePath("/dashboard/assistant");
  revalidatePath("/dashboard");
  return Response.json({ ok: true });
}
