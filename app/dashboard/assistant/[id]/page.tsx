import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssistant, getAssistantNumber, listIntegrations } from "@/lib/dashboard/db";
import { currentUserId } from "@/lib/auth";
import { SectionCard } from "../../components/SectionCard";
import { Tabs } from "../../components/Tabs";
import { CALENDAR_PROVIDERS } from "../../integrations/providers";
import { LanguageSelect } from "../../numbers/LanguageSelect";
import { VoiceSelect } from "../../numbers/VoiceSelect";
import {
  addPdfKnowledgeAction,
  addWebsiteKnowledgeAction,
  connectNumberForAssistantAction,
  createNumberForAssistantAction,
  removeKnowledgeSourceAction,
  testCallAction,
  unlinkNumberAction,
  updateAssistantAction,
} from "../actions";
import { readKnowledge } from "@/lib/knowledge/sources";
import { DeleteAssistant } from "../DeleteAssistant";
import { TestCallButton } from "../TestCallButton";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-violet-400";
const labelCls = "mb-1.5 block text-sm font-medium text-neutral-700";

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
];

export default async function AssistantSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, error } = await searchParams;

  const assistant = await getAssistant(id).catch(() => null);
  if (!assistant) notFound();

  // Scope to the signed-in owner (when auth is configured).
  const ownerId = await currentUserId();
  if (ownerId && assistant.owner_id && assistant.owner_id !== ownerId) notFound();

  const knowledge = readKnowledge(assistant.knowledge);
  const notes = knowledge.notes ?? "";
  const sources = knowledge.sources ?? [];
  const emailCfg =
    (assistant.routing as { emailTranscripts?: { enabled?: boolean; to?: string } })?.emailTranscripts ?? {};
  const crmCfg =
    (assistant.routing as { crm?: { enabled?: boolean; url?: string; secret?: string } })?.crm ?? {};
  const transferTo = String((assistant.routing as { transferTo?: string })?.transferTo ?? "");
  const smsAlerts = (assistant.routing as { smsAlerts?: boolean })?.smsAlerts ?? true;
  const sttProvider = String((assistant.routing as { sttProvider?: string })?.sttProvider ?? "");
  const calAccess =
    (assistant.routing as { calendar?: { access?: Array<{ integrationId: string; level: string }> } })
      ?.calendar?.access ?? [];
  const accessMap = new Map(calAccess.map((a) => [a.integrationId, a.level]));

  let calendars: Awaited<ReturnType<typeof listIntegrations>> = [];
  try {
    calendars = (await listIntegrations()).filter((i) => i.type === "calendar");
  } catch {
    calendars = [];
  }

  const number = await getAssistantNumber(assistant.id).catch(() => null);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/dashboard/assistant" className="text-sm text-violet-600 hover:text-violet-700">
          ← Assistants
        </Link>
        <h1 className="mt-1 text-2xl font-medium tracking-tight text-neutral-900">{assistant.name}</h1>
        <p className="mt-1 text-sm text-neutral-500">Voice, language, and behavior for this assistant.</p>
      </header>

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Settings saved.
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <SectionCard title="Phone number" subtitle="The number callers dial to reach this assistant.">
        {number ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-medium tracking-tight text-neutral-900">{number.e164}</div>
              <div className="text-xs text-neutral-400">Linked · webhook configured</div>
            </div>
            <form action={unlinkNumberAction}>
              <input type="hidden" name="number_id" value={number.id} />
              <input type="hidden" name="assistant_id" value={assistant.id} />
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-lg border border-rose-200 bg-white px-4 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
              >
                Unlink
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-3">
            <form action={createNumberForAssistantAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <input type="hidden" name="assistant_id" value={assistant.id} />
              <div className="sm:w-48">
                <label htmlFor="country" className={labelCls}>Number country</label>
                <select id="country" name="country" defaultValue="US" className={field}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex h-[38px] items-center justify-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Create number
              </button>
            </form>
            <details>
              <summary className="cursor-pointer text-xs font-medium text-neutral-500 hover:text-neutral-700">
                Connect a number you own
              </summary>
              <form action={connectNumberForAssistantAction} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                <input type="hidden" name="assistant_id" value={assistant.id} />
                <div className="flex-1">
                  <label htmlFor="e164" className={labelCls}>Phone number</label>
                  <input id="e164" name="e164" required placeholder="+14155550142" pattern="\+[1-9][0-9]{6,15}" className={field} />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-[38px] items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  Connect
                </button>
              </form>
            </details>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Knowledge sources"
        subtitle="Import websites and PDFs. Each is processed to Markdown the assistant reads on calls."
      >
        <div className="space-y-4">
          {sources.length > 0 && (
            <ul className="space-y-2">
              {sources.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-neutral-800">
                      {s.kind === "website" ? "🌐" : "📄"} {s.title}
                    </div>
                    <div className="truncate text-xs text-neutral-400">
                      {s.url ?? s.kind} · {(s.charCount / 1000).toFixed(1)}k chars
                    </div>
                  </div>
                  <form action={removeKnowledgeSourceAction}>
                    <input type="hidden" name="id" value={assistant.id} />
                    <input type="hidden" name="source_id" value={s.id} />
                    <button
                      type="submit"
                      className="inline-flex h-8 shrink-0 items-center rounded-lg border border-rose-200 bg-white px-3 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <form action={addWebsiteKnowledgeAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <input type="hidden" name="id" value={assistant.id} />
            <div className="flex-1">
              <label htmlFor="kn_url" className={labelCls}>Import from website</label>
              <input id="kn_url" name="url" type="url" required placeholder="https://yourbusiness.com/about" className={field} />
            </div>
            <button
              type="submit"
              className="inline-flex h-[38px] shrink-0 items-center justify-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Import
            </button>
          </form>

          <form action={addPdfKnowledgeAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <input type="hidden" name="id" value={assistant.id} />
            <div className="flex-1">
              <label htmlFor="kn_pdf" className={labelCls}>Upload a PDF</label>
              <input
                id="kn_pdf"
                name="pdf"
                type="file"
                accept="application/pdf"
                required
                className={`${field} file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1 file:text-sm file:text-neutral-700`}
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-[38px] shrink-0 items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Upload
            </button>
          </form>
        </div>
      </SectionCard>

      <form action={updateAssistantAction} className="space-y-4">
        <input type="hidden" name="id" value={assistant.id} />

        <SectionCard title="Name">
          <input name="name" defaultValue={assistant.name} placeholder="e.g. Front desk" className={field} />
        </SectionCard>

        <Tabs labels={["Behavior", "Technical"]}>
          <div className="space-y-4">
            <SectionCard title="Welcome message" subtitle="What the AI says when it answers.">
              <textarea name="greeting" defaultValue={assistant.greeting} rows={2} className={`${field} resize-y`} />
            </SectionCard>

            <SectionCard title="Behavior" subtitle="How the AI handles the call.">
              <div className="space-y-4">
                <div>
                  <label htmlFor="system_prompt" className={labelCls}>Behavior instructions</label>
                  <textarea
                    id="system_prompt"
                    name="system_prompt"
                    defaultValue={assistant.system_prompt}
                    rows={4}
                    placeholder="e.g. You handle a dental clinic. Book cleanings, answer hours and insurance questions, escalate emergencies."
                    className={`${field} resize-y`}
                  />
                </div>
                <div>
                  <label htmlFor="knowledge_notes" className={labelCls}>Business knowledge & FAQs</label>
                  <textarea
                    id="knowledge_notes"
                    name="knowledge_notes"
                    defaultValue={notes}
                    rows={4}
                    placeholder="Hours, services, pricing, address, policies - anything the AI should know."
                    className={`${field} resize-y`}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Calls & alerts" subtitle="Forward important calls and get message texts.">
              <div className="space-y-4">
                <div>
                  <label htmlFor="transfer_to" className={labelCls}>Personal number</label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input id="transfer_to" name="transfer_to" defaultValue={transferTo} placeholder="Your real number, e.g. +14155550199" className={`${field} sm:flex-1`} />
                    <TestCallButton
                      action={testCallAction}
                      className="inline-flex h-[38px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-50 disabled:opacity-60"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-neutral-400">Important calls are forwarded to this number.</p>
                </div>

                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-300">
                  <span>
                    <span className="block text-sm font-medium text-neutral-800">Text me message alerts</span>
                    <span className="block text-xs text-neutral-400">When the AI takes a message, text it to your personal number.</span>
                  </span>
                  <input type="checkbox" name="sms_alerts" defaultChecked={smsAlerts} className="peer sr-only" />
                  <span className="relative h-5 w-9 shrink-0 rounded-full bg-neutral-200 transition-colors peer-checked:bg-violet-600 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:after:translate-x-4" />
                </label>
              </div>
            </SectionCard>

            <SectionCard title="Calendar access" subtitle="Which connected calendars this assistant can use, and how.">
              {calendars.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  No calendars connected yet.{" "}
                  <Link href="/dashboard/integrations" className="text-violet-600 hover:text-violet-700">Connect one →</Link>
                </p>
              ) : (
                <div className="space-y-3">
                  {calendars.map((c) => {
                    const provName = CALENDAR_PROVIDERS.find((p) => p.id === c.provider)?.name ?? c.provider;
                    return (
                      <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2.5">
                        <div className="text-sm font-medium text-neutral-800">{provName}</div>
                        <select
                          name={`cal_access_${c.id}`}
                          defaultValue={accessMap.get(c.id) ?? "none"}
                          className="shrink-0 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-900 outline-none focus:border-violet-400"
                        >
                          <option value="none">No access</option>
                          <option value="busy">Busy only (hide details)</option>
                          <option value="read">Read details</option>
                          <option value="write">Write &amp; book here</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Email transcripts" subtitle="Email a recap and full transcript after each call.">
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-300">
                  <span>
                    <span className="block text-sm font-medium text-neutral-800">Send email transcripts</span>
                    <span className="block text-xs text-neutral-400">After every call, email a summary and the full transcript.</span>
                  </span>
                  <input type="checkbox" name="email_enabled" defaultChecked={emailCfg.enabled ?? false} className="peer sr-only" />
                  <span className="relative h-5 w-9 shrink-0 rounded-full bg-neutral-200 transition-colors peer-checked:bg-violet-600 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:after:translate-x-4" />
                </label>
                <div>
                  <label htmlFor="email_to" className={labelCls}>Send to</label>
                  <input id="email_to" name="email_to" type="email" defaultValue={emailCfg.to ?? ""} placeholder="you@business.com" className={field} />
                  <p className="mt-1.5 text-xs text-neutral-400">
                    Sending activates once an email provider (RESEND_API_KEY + EMAIL_FROM) is configured on the server.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="CRM / ERP push" subtitle="POST each completed call to your own system for deeper automation.">
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-300">
                  <span>
                    <span className="block text-sm font-medium text-neutral-800">Push calls to a CRM / ERP</span>
                    <span className="block text-xs text-neutral-400">Sends summary + transcript as JSON to your endpoint (Salesforce, HubSpot, Zapier, n8n, custom).</span>
                  </span>
                  <input type="checkbox" name="crm_enabled" defaultChecked={crmCfg.enabled ?? false} className="peer sr-only" />
                  <span className="relative h-5 w-9 shrink-0 rounded-full bg-neutral-200 transition-colors peer-checked:bg-violet-600 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:after:translate-x-4" />
                </label>
                <div>
                  <label htmlFor="crm_url" className={labelCls}>Endpoint URL</label>
                  <input id="crm_url" name="crm_url" type="url" defaultValue={crmCfg.url ?? ""} placeholder="https://hooks.zapier.com/..." className={field} />
                </div>
                <div>
                  <label htmlFor="crm_secret" className={labelCls}>Signing secret (optional)</label>
                  <input id="crm_secret" name="crm_secret" defaultValue={crmCfg.secret ?? ""} placeholder="Used to HMAC-sign the payload" className={field} />
                  <p className="mt-1.5 text-xs text-neutral-400">
                    When set, we send an <code className="rounded bg-neutral-100 px-1">X-Signature</code> header: HMAC-SHA256 of the request body.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-4">
            <SectionCard title="Voice & language" subtitle="How the AI sounds on calls.">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className={labelCls}>Voice</span>
                  <VoiceSelect name="voice_id" defaultValue={assistant.voice_id} />
                </div>
                <div>
                  <span className={labelCls}>Default language</span>
                  <LanguageSelect name="language" defaultValue={assistant.language} />
                  <p className="mt-1 text-xs text-neutral-400">
                    The AI detects the caller&apos;s language and replies in it - this is the fallback.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Speech-to-text" subtitle="Transcription engine for this assistant.">
              <div className="sm:w-1/2">
                <select id="stt_provider" name="stt_provider" defaultValue={sttProvider} className={field}>
                  <option value="">Default</option>
                  <option value="deepgram">Deepgram (best accuracy)</option>
                  <option value="elevenlabs">ElevenLabs (budget)</option>
                </select>
              </div>
            </SectionCard>
          </div>
        </Tabs>

        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-lg bg-neutral-900 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
        >
          Save settings
        </button>
      </form>

      <SectionCard title="Danger zone">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">Delete this assistant. Its number is unlinked.</p>
          <DeleteAssistant id={assistant.id} name={assistant.name} />
        </div>
      </SectionCard>
    </div>
  );
}
