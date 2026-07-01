import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssistant, getAssistantNumber, listIntegrations } from "@/lib/dashboard/db";
import { getTwilioStatus } from "@/lib/dashboard/twilio";
import { getOrganization } from "@/lib/dashboard/organizations";
import { getPlanContext } from "@/lib/dashboard/plan";
import { currentUserId } from "@/lib/auth";
import { SectionCard } from "../../components/SectionCard";
import { PageHeader } from "../../components/PageHeader";
import { StatusRow } from "../../components/StatusBadge";
import { SubmitButton } from "../../components/SubmitButton";
import { CALENDAR_PROVIDERS } from "../../integrations/providers";
import { VoiceSelect } from "../../numbers/VoiceSelect";
import {
  testCallAction,
  unlinkNumberAction,
  updateAssistantAction,
} from "../actions";
import { GetNumberForm } from "../GetNumberForm";
import { DeleteAssistant } from "../DeleteAssistant";
import { TestCallButton } from "../TestCallButton";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900";
const labelCls = "mb-1.5 block text-sm font-medium text-neutral-700";
const toggle =
  "relative h-5 w-9 shrink-0 rounded-full bg-neutral-200 transition-colors peer-checked:bg-neutral-900 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:after:translate-x-4";
const toggleRow =
  "flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-neutral-200/70 bg-white/60 px-4 py-3 transition-colors hover:border-neutral-300";

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
        description="Its number, organization, role, and how it sounds on calls."
        back={{ href: "/dashboard/assistant", label: "Assistants" }}
      />

      {saved && (
        <div className="shape-pill border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          Settings saved.
        </div>
      )}
      {error && (
        <div className="shape-pill border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</div>
      )}
      {notice && (
        <div className="shape-pill flex flex-wrap items-center justify-between gap-3 border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          <span>{notice}</span>
          <Link href="/pricing" className="font-medium underline underline-offset-2">
            View plans
          </Link>
        </div>
      )}

      {/* ── Phone number ────────────────────────────────────────────────── */}
      <SectionCard title="Phone number" subtitle="The number callers dial to reach this assistant.">
        <div className="mb-4">
          <StatusRow
            tone={twilio.ok ? "ok" : twilio.configured ? "error" : "warn"}
            label="Twilio"
            detail={twilio.configured ? twilio.error : "Not configured"}
          />
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
              <SubmitButton variant="danger" pendingText="Unlinking…">
                Unlink
              </SubmitButton>
            </form>
          </div>
        ) : (
          <GetNumberForm assistantId={assistant.id} credits={credits} />
        )}
      </SectionCard>

      {/* ── Organization ────────────────────────────────────────────────── */}
      <SectionCard
        title="Organization"
        subtitle="The company whose shared knowledge this assistant uses on calls."
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
            <Link href="/dashboard/organizations" className="font-medium text-neutral-900 underline underline-offset-2">
              Assign one
            </Link>
          </p>
        )}
      </SectionCard>

      {/* ── Settings (single stacked form, no tabs) ─────────────────────── */}
      <form action={updateAssistantAction} className="space-y-6">
        <input type="hidden" name="id" value={assistant.id} />

        <SectionCard title="Basics" subtitle="Name, greeting, voice, and language.">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className={labelCls}>Name</label>
              <input id="name" name="name" defaultValue={assistant.name} placeholder="e.g. Front desk" className={field} />
            </div>
            <div>
              <label htmlFor="greeting" className={labelCls}>Welcome message</label>
              <textarea id="greeting" name="greeting" defaultValue={assistant.greeting} rows={2} className={`${field} resize-y`} />
            </div>
            <div>
              <span className={labelCls}>Voice</span>
              <VoiceSelect name="voice_id" defaultValue={assistant.voice_id} />
              {/* Language is always auto-detected from the caller. */}
              <input type="hidden" name="language" value="multi" />
              <p className="mt-1.5 text-xs text-neutral-400">
                The AI auto-detects the caller&apos;s language and replies in it.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Role"
          subtitle={org ? `Its job within ${org.name}, and how it handles calls.` : "Its job, and how it handles calls."}
        >
          <textarea
            id="system_prompt"
            name="system_prompt"
            defaultValue={assistant.system_prompt}
            rows={6}
            placeholder="Describe this assistant's job. For example: front desk for the sales team. It greets callers, books demos, answers common questions, and passes billing issues to accounts and tech problems to support."
            className={`${field} resize-y`}
          />
          <p className="mt-1.5 text-xs text-neutral-400">
            Company facts (hours, services, pricing) live in the organization&apos;s shared knowledge.
            This assistant reads them on its own.
          </p>
        </SectionCard>

        <SectionCard title="Calls and alerts" subtitle="Forward important calls and get message texts.">
          <div className="space-y-4">
            <div>
              <label htmlFor="transfer_to" className={labelCls}>Personal number</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input id="transfer_to" name="transfer_to" defaultValue={transferTo} placeholder="Your real number, e.g. +14155550199" className={`${field} sm:flex-1`} />
                <TestCallButton
                  action={testCallAction}
                  className="inline-flex h-[38px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:cursor-wait disabled:opacity-60"
                />
              </div>
              <p className="mt-1.5 text-xs text-neutral-400">Important calls are forwarded to this number.</p>
            </div>

            <label className={toggleRow}>
              <span>
                <span className="block text-sm font-medium text-neutral-800">Text me message alerts</span>
                <span className="block text-xs text-neutral-400">When the AI takes a message, text it to your personal number.</span>
              </span>
              <input type="checkbox" name="sms_alerts" defaultChecked={smsAlerts} className="peer sr-only" />
              <span className={toggle} />
            </label>
          </div>
        </SectionCard>

        <SectionCard title="Calendar access" subtitle="Read = check availability only. Write = also book here.">
          {calendars.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No calendars connected yet.{" "}
              <Link href="/dashboard/integrations" className="font-medium text-neutral-900 underline underline-offset-2">
                Connect one
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              {calendars.map((c) => {
                const provName = CALENDAR_PROVIDERS.find((p) => p.id === c.provider)?.name ?? c.provider;
                return (
                  <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200/70 bg-white/60 px-3 py-2.5">
                    <div className="text-sm font-medium text-neutral-800">{provName}</div>
                    <select
                      name={`cal_access_${c.id}`}
                      defaultValue={accessMap.get(c.id) ?? "none"}
                      className="shrink-0 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
                    >
                      <option value="none">No access</option>
                      <option value="read">Read availability</option>
                      <option value="write">Write and book here</option>
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Email transcripts" subtitle="Email a recap and full transcript after each call.">
          <div className="space-y-3">
            <label className={toggleRow}>
              <span>
                <span className="block text-sm font-medium text-neutral-800">Send email transcripts</span>
                <span className="block text-xs text-neutral-400">After every call, email a summary and the full transcript.</span>
              </span>
              <input type="checkbox" name="email_enabled" defaultChecked={emailCfg.enabled ?? false} className="peer sr-only" />
              <span className={toggle} />
            </label>
            <div>
              <label htmlFor="email_to" className={labelCls}>Send to</label>
              <input id="email_to" name="email_to" type="email" defaultValue={emailCfg.to ?? ""} placeholder="you@business.com" className={field} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="CRM push" subtitle="POST each completed call to your own system.">
          <div className="space-y-3">
            <label className={toggleRow}>
              <span>
                <span className="block text-sm font-medium text-neutral-800">Push calls to a CRM or ERP</span>
                <span className="block text-xs text-neutral-400">Sends summary and transcript as JSON to your endpoint.</span>
              </span>
              <input type="checkbox" name="crm_enabled" defaultChecked={crmCfg.enabled ?? false} className="peer sr-only" />
              <span className={toggle} />
            </label>
            <div>
              <label htmlFor="crm_url" className={labelCls}>Endpoint URL</label>
              <input id="crm_url" name="crm_url" type="url" defaultValue={crmCfg.url ?? ""} placeholder="https://hooks.zapier.com/..." className={field} />
            </div>
            <div>
              <label htmlFor="crm_secret" className={labelCls}>Signing secret (optional)</label>
              <input id="crm_secret" name="crm_secret" defaultValue={crmCfg.secret ?? ""} placeholder="Used to HMAC-sign the payload" className={field} />
            </div>
          </div>
        </SectionCard>

        <SubmitButton pendingText="Saving…" className="h-10 px-5">
          Save settings
        </SubmitButton>
      </form>

      {/* ── Danger zone ─────────────────────────────────────────────────── */}
      <SectionCard title="Danger zone">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-neutral-500">Delete this assistant. Its number is unlinked.</p>
          <DeleteAssistant id={assistant.id} name={assistant.name} />
        </div>
      </SectionCard>
    </div>
  );
}
