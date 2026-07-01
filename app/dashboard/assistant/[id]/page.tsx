import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssistant, getAssistantNumber, listIntegrations } from "@/lib/dashboard/db";
import { getTwilioStatus } from "@/lib/dashboard/twilio";
import { getOrganization } from "@/lib/dashboard/organizations";
import { getPlanContext } from "@/lib/dashboard/plan";
import { currentUserId } from "@/lib/auth";
import { SectionCard } from "../../components/SectionCard";
import { PageHeader } from "../../components/PageHeader";
import { Tabs } from "../../components/Tabs";
import { CALENDAR_PROVIDERS } from "../../integrations/providers";
import { LanguageSelect } from "../../numbers/LanguageSelect";
import { VoiceSelect } from "../../numbers/VoiceSelect";
import {
  connectAgentNumberAction,
  getAgentNumberAction,
  testCallAction,
  unlinkNumberAction,
  updateAssistantAction,
} from "../actions";
import { NumberCountrySelect } from "../NumberCountrySelect";
import { DeleteAssistant } from "../DeleteAssistant";
import { TestCallButton } from "../TestCallButton";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900";
const labelCls = "mb-1.5 block text-sm font-medium text-neutral-700";

export default async function AssistantSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string; notice?: string }>;
}) {
  const { id } = await params;
  const { saved, error, notice } = await searchParams;

  const assistant = await getAssistant(id).catch(() => null);
  if (!assistant) notFound();

  // Scope to the signed-in owner (when auth is configured).
  const ownerId = await currentUserId();
  if (ownerId && assistant.owner_id && assistant.owner_id !== ownerId) notFound();

  const org = assistant.organization_id
    ? await getOrganization(assistant.organization_id).catch(() => null)
    : null;

  const emailCfg =
    (assistant.routing as { emailTranscripts?: { enabled?: boolean; to?: string } })?.emailTranscripts ?? {};
  const crmCfg =
    (assistant.routing as { crm?: { enabled?: boolean; url?: string; secret?: string } })?.crm ?? {};
  const transferTo = String((assistant.routing as { transferTo?: string })?.transferTo ?? "");
  const smsAlerts = (assistant.routing as { smsAlerts?: boolean })?.smsAlerts ?? true;
  const calAccess =
    (assistant.routing as { calendar?: { access?: Array<{ integrationId: string; level: string }> } })
      ?.calendar?.access ?? [];
  // Legacy "busy" tier now displays as read (availability only).
  const accessMap = new Map(
    calAccess.map((a) => [a.integrationId, a.level === "busy" ? "read" : a.level]),
  );

  let calendars: Awaited<ReturnType<typeof listIntegrations>> = [];
  try {
    calendars = (await listIntegrations()).filter((i) => i.type === "calendar");
  } catch {
    calendars = [];
  }

  const number = await getAssistantNumber(assistant.id).catch(() => null);
  const twilio = await getTwilioStatus();
  const planCtx = await getPlanContext(ownerId).catch(() => null);
  const credits = planCtx?.limits.minutesIncluded ?? 1000;

  return (
    <div className="space-y-6">
      <PageHeader
        title={assistant.name}
        description="Set this assistant's phone number, organization, role, and how it sounds on calls."
        back={{ href: "/dashboard/assistant", label: "Assistants" }}
      />

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Settings saved.
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}
      {notice && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-300 bg-neutral-100 px-4 py-3 text-sm text-neutral-800">
          <span>{notice}</span>
          <Link href="/pricing" className="font-medium underline underline-offset-2 hover:text-neutral-900">
            View plans
          </Link>
        </div>
      )}

      <SectionCard title="Phone number" subtitle="The number callers dial to reach this assistant.">
        <div
          className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 ${
            twilio.ok
              ? "border-emerald-200 bg-emerald-50"
              : "border-rose-200 bg-rose-50"
          }`}
        >
          <span
            className={`inline-flex h-2 w-2 shrink-0 rounded-full ${
              twilio.ok ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          <span
            className={`text-xs font-medium ${
              twilio.ok ? "text-emerald-700" : "text-rose-600"
            }`}
          >
            {twilio.ok
              ? "Twilio integration connected"
              : `Twilio integration: ${twilio.error ?? "not connected"}`}
          </span>
        </div>
        {number ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-medium tracking-tight text-neutral-900">{number.e164}</div>
              <div className="text-xs text-neutral-400">Linked · routed via ElevenLabs</div>
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
            <form action={getAgentNumberAction} className="flex flex-col gap-3 sm:flex-row sm:items-end sm:pb-6">
              <input type="hidden" name="assistant_id" value={assistant.id} />
              <NumberCountrySelect credits={credits} />
              <button
                type="submit"
                className="inline-flex h-[38px] items-center justify-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Get number
              </button>
            </form>
            <p className="text-xs text-neutral-400">
              We buy a number from Twilio, import it into ElevenLabs, and route its
              inbound calls to this assistant. No server needed.
              {!twilio.ok &&
                " Twilio credentials look invalid — fix them (badge above) before getting a number."}
            </p>
            <details>
              <summary className="cursor-pointer text-xs font-medium text-neutral-500 hover:text-neutral-700">
                Connect a Twilio number you already own
              </summary>
              <form action={connectAgentNumberAction} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
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
        title="Organization"
        subtitle="The organization this assistant belongs to. It reads the organization's shared knowledge on every call."
      >
        {org ? (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-neutral-900">{org.name}</div>
              <div className="truncate text-xs text-neutral-500">{org.description || "No description"}</div>
            </div>
            <Link
              href={`/dashboard/organizations/${org.id}`}
              className="inline-flex h-9 shrink-0 items-center rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Manage
            </Link>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">
            Not assigned to an organization.{" "}
            <Link href="/dashboard/organizations" className="text-neutral-900 hover:text-neutral-900">
              Assign one →
            </Link>
          </p>
        )}
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

            <SectionCard
              title="Role & position"
              subtitle={
                org
                  ? `This assistant's job within ${org.name}, and how it handles calls.`
                  : "This assistant's role, and how it handles calls."
              }
            >
              <div>
                <label htmlFor="system_prompt" className={labelCls}>Position description</label>
                <textarea
                  id="system_prompt"
                  name="system_prompt"
                  defaultValue={assistant.system_prompt}
                  rows={6}
                  placeholder="Describe this assistant's job. For example: front desk for the sales team. It greets callers, books demos, answers common questions, and passes billing issues to accounts and tech problems to support."
                  className={`${field} resize-y`}
                />
                <p className="mt-1.5 text-xs text-neutral-400">
                  Company facts like hours, services, pricing, and policies live in the organization&apos;s shared
                  knowledge. This assistant reads them on its own.
                </p>
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
                      className="inline-flex h-[38px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-60"
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
                  <span className="relative h-5 w-9 shrink-0 rounded-full bg-neutral-200 transition-colors peer-checked:bg-neutral-900 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:after:translate-x-4" />
                </label>
              </div>
            </SectionCard>

            <SectionCard title="Calendar access" subtitle="Read = check availability only (details stay private). Write = also book here.">
              {calendars.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  No calendars connected yet.{" "}
                  <Link href="/dashboard/integrations" className="text-neutral-900 hover:text-neutral-900">Connect one →</Link>
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
                          className="shrink-0 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
                        >
                          <option value="none">No access</option>
                          <option value="read">Read availability (hide details)</option>
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
                  <span className="relative h-5 w-9 shrink-0 rounded-full bg-neutral-200 transition-colors peer-checked:bg-neutral-900 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:after:translate-x-4" />
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
                  <span className="relative h-5 w-9 shrink-0 rounded-full bg-neutral-200 transition-colors peer-checked:bg-neutral-900 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:after:translate-x-4" />
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
