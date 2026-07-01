import { getTwilioStatus } from "./twilio";

// Live health of the platform's core integrations for the dashboard status
// balls. Each check does one cheap, read-only request and never throws — a
// missing key reads as "not configured", a bad key as "error". All run in
// parallel with a short timeout so the page isn't held up by a slow provider.

export interface ServiceStatus {
  name: string;
  configured: boolean;
  ok: boolean;
  detail?: string;
}

const TIMEOUT_MS = 4000;

async function okFetch(url: string, headers: Record<string, string>): Promise<boolean> {
  const res = await fetch(url, {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return res.ok;
}

async function elevenLabsStatus(): Promise<ServiceStatus> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return { name: "ElevenLabs", configured: false, ok: false, detail: "API key not set." };
  try {
    const ok = await okFetch("https://api.elevenlabs.io/v1/user", { "xi-api-key": key });
    return { name: "ElevenLabs", configured: true, ok, detail: ok ? undefined : "Invalid API key." };
  } catch {
    return { name: "ElevenLabs", configured: true, ok: false, detail: "Couldn't reach ElevenLabs." };
  }
}

async function geminiStatus(): Promise<ServiceStatus> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { name: "Gemini", configured: false, ok: false, detail: "API key not set." };
  try {
    const ok = await okFetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
      {},
    );
    return { name: "Gemini", configured: true, ok, detail: ok ? undefined : "Invalid API key." };
  } catch {
    return { name: "Gemini", configured: true, ok: false, detail: "Couldn't reach Gemini." };
  }
}

async function supabaseStatus(): Promise<ServiceStatus> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { name: "Supabase", configured: false, ok: false, detail: "Not configured." };
  try {
    const ok = await okFetch(`${url}/rest/v1/`, { apikey: key, authorization: `Bearer ${key}` });
    return { name: "Supabase", configured: true, ok, detail: ok ? undefined : "Invalid URL or key." };
  } catch {
    return { name: "Supabase", configured: true, ok: false, detail: "Couldn't reach Supabase." };
  }
}

async function twilioStatus(): Promise<ServiceStatus> {
  const s = await getTwilioStatus();
  return { name: "Twilio", configured: s.configured, ok: s.ok, detail: s.error };
}

/** All core service statuses, in a stable display order. */
export async function getServiceStatuses(): Promise<ServiceStatus[]> {
  return Promise.all([
    elevenLabsStatus(),
    geminiStatus(),
    twilioStatus(),
    supabaseStatus(),
  ]);
}
