import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAssistant,
  getAssistantNumber,
  listAssistants,
  listIntegrations,
  listNumbers,
} from "@/lib/dashboard/db";
import { getPlanContextCached } from "@/lib/dashboard/plan";
import { countryFromPhone, formatPhone } from "@/lib/call-engine/voice/phone-language";
import { currentUserId } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/server";
import { SECTION } from "@/lib/dashboard/assistant-patch";
import { AssistantPowerToggle } from "../../components/AssistantPowerToggle";
import { providerName } from "@/lib/calendar/providers";
import { VoiceSelect } from "../../numbers/VoiceSelect";
import { LANGUAGES } from "../../numbers/languages";
import { ELEVENLABS_LANGUAGES } from "@/lib/call-engine/voice/phone-language";
import { AdvancedVoiceSettings, type LangOption } from "../AdvancedVoiceSettings";
import { TopicModal } from "../TopicModal";
import { TestCall, UnlinkNumber, ReassignNumber } from "../HeroNumberActions";
import { GetNumberForm } from "../GetNumberForm";
import { DeleteAssistant } from "../DeleteAssistant";
import { AiAvatar } from "@/app/onboarding/AiAvatar";
import { moodForVoiceId } from "@/app/onboarding/personality";

export const dynamic = "force-dynamic";

const CAP = "md:h-[calc(100dvh-7rem)] md:overflow-hidden lg:h-[calc(100dvh-8rem)]";
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
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { id } = await params;
  // Saves report inline now; only cross-page redirects still use params.
  const { error, notice } = await searchParams;
  const t = await getDictionary();
  const a = t.assistants;

  const assistant = await getAssistant(id).catch(() => null);
  if (!assistant) notFound();

  const ownerId = await currentUserId();
  if (ownerId && assistant.owner_id && assistant.owner_id !== ownerId) notFound();

  const [integrations, number, planCtx, allNumbers, assistants] = await Promise.all([
    listIntegrations(ownerId ?? undefined).catch(
      () => [] as Awaited<ReturnType<typeof listIntegrations>>,
    ),
    getAssistantNumber(assistant.id).catch(() => null),
    getPlanContextCached(ownerId).catch(() => null),
    listNumbers().catch(() => [] as Awaited<ReturnType<typeof listNumbers>>),
    listAssistants(ownerId ?? undefined).catch(() => []),
  ]);
  const calendars = integrations.filter((i) => i.type === "calendar");

  const emailCfg =
    (assistant.routing as { emailTranscripts?: { enabled?: boolean; to?: string } })
      ?.emailTranscripts ?? {};
  const transferTo = String((assistant.routing as { transferTo?: string })?.transferTo ?? "");
  const smsAlerts = (assistant.routing as { smsAlerts?: boolean })?.smsAlerts ?? true;
  const calAccess =
    (assistant.routing as { calendar?: { access?: Array<{ integrationId: string; level: string }> } })
      ?.calendar?.access ?? [];
  const accessMap = new Map(
    calAccess.map((acc) => [acc.integrationId, acc.level === "busy" ? "read" : acc.level]),
  );

  const voiceCfg =
    (assistant.routing as { voice?: { speed?: number; stability?: number } })?.voice ?? {};
  const voiceByLanguage =
    (assistant.routing as { voiceByLanguage?: Record<string, string> })?.voiceByLanguage ?? {};
  const seenBase = new Set<string>();
  const voiceLanguages: LangOption[] = LANGUAGES.flatMap((l) => {
    const base = l.code.split("-")[0];
    if (base === "en" || l.code === "multi" || !ELEVENLABS_LANGUAGES.has(base) || seenBase.has(base)) {
      return [];
    }
    seenBase.add(base);
    return [{ code: base, name: l.name, flag: l.flag }];
  });

  const availableNumbers = number
    ? 0
    : allNumbers.filter((n) => !n.assistant_id && n.enabled && n.twilio_sid).length;
  const country = number ? countryFromPhone(number.e164) : null;
  const credits = planCtx?.limits.minutesIncluded ?? 1000;
  const multi = assistants.length > 1;
  const canAddMore =
    planCtx && Number.isFinite(planCtx.limits.assistants)
      ? planCtx.usage.assistants < planCtx.limits.assistants
      : Boolean(planCtx);

  const accessCount = calAccess.filter((acc) => acc.level !== "none").length;

  return (
    <div className={`rise flex flex-col gap-3 ${CAP}`}>
      {(assistant.elevenlabs_multilingual === false || error || notice) && (
        <div className="shrink-0 space-y-3">
          {assistant.elevenlabs_multilingual === false && (
            <div className="shape-pill border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
              <span className="font-medium">{a.englishOnlyTitle}</span> {a.englishOnlyBody}
            </div>
          )}
          {error && (
            <div className="shape-pill border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
              {error}
            </div>
          )}
          {notice && (
            <div className="shape-pill flex flex-wrap items-center justify-between gap-3 border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
              <span>{notice}</span>
              <Link href="/pricing" className="font-medium underline underline-offset-2">
                {t.common.viewPlans}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* HERO: who is answering, on what number. Fixed. */}
      <div className="shape-card glass grid shrink-0 gap-4 p-5 md:grid-cols-2">
        <div className="flex items-center gap-4">
          <span className="ava-ring shrink-0" style={{ "--ava-size": "56px" } as CSSProperties}>
            <span>
              <AiAvatar
                mood={moodForVoiceId(assistant.voice_id)}
                className="h-[82%] w-[82%]"
                label={assistant.name}
              />
            </span>
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-neutral-900">
              {assistant.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                  assistant.enabled ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${assistant.enabled ? "bg-emerald-500" : "bg-amber-500"}`}
                />
                {assistant.enabled ? a.onDuty : a.paused}
              </span>
              <AssistantPowerToggle
                id={assistant.id}
                enabled={assistant.enabled}
                pauseLabel={t.home.pause}
                resumeLabel={t.home.resume}
              />
            </div>
            <TestCall assistantId={assistant.id} transferTo={transferTo} />
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200/70 bg-white/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            {a.phoneNumber}
          </p>
          {number ? (
            <>
              <p className="mt-1.5 flex items-center gap-2">
                {country && (
                  <span className="text-xl leading-none" role="img" aria-label={country.iso}>
                    {country.flag}
                  </span>
                )}
                <span className="text-2xl font-semibold tracking-tight tabular-nums text-neutral-900">
                  {formatPhone(number.e164)}
                </span>
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <UnlinkNumber assistantId={assistant.id} numberId={number.id} />
                {multi && (
                  <ReassignNumber
                    numberId={number.id}
                    currentAssistantId={assistant.id}
                    assistants={assistants.map((x) => ({ id: x.id, name: x.name }))}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="mt-2">
              <GetNumberForm
                assistantId={assistant.id}
                credits={credits}
                availableCount={availableNumbers}
              />
            </div>
          )}
        </div>
      </div>

      {/* SETTINGS REGION: one card per topic, each opening a self-saving modal.
          The single scroll area on the page. */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-1">
        <TopicModal
          assistantId={assistant.id}
          section={SECTION.basics}
          title={a.topicVoiceTitle}
          subtitle={a.topicVoiceSub}
          summary={null}
        >
          <div>
            <span className={labelCls}>{a.voice}</span>
            <VoiceSelect name="voice_id" defaultValue={assistant.voice_id} />
            <p className="mt-1.5 text-xs text-neutral-400">{a.autoLanguageNote}</p>
          </div>
          <div>
            <label htmlFor="name" className={labelCls}>
              {a.name}
            </label>
            <input
              id="name"
              name="name"
              defaultValue={assistant.name}
              placeholder={a.namePlaceholder}
              className={field}
            />
          </div>
        </TopicModal>

        <TopicModal
          assistantId={assistant.id}
          section={SECTION.basics}
          title={a.topicGreetingTitle}
          subtitle={a.topicGreetingSub}
          summary={assistant.greeting}
        >
          <div>
            <label htmlFor="greeting" className={labelCls}>
              {a.welcomeMessage}
            </label>
            <textarea
              id="greeting"
              name="greeting"
              defaultValue={assistant.greeting}
              rows={3}
              className={`${field} resize-y`}
            />
          </div>
        </TopicModal>

        <TopicModal
          assistantId={assistant.id}
          section={SECTION.alerts}
          title={a.topicTransferTitle}
          subtitle={a.topicTransferSub}
          summary={transferTo ? formatPhone(transferTo) : null}
        >
          <div>
            <label htmlFor="transfer_to" className={labelCls}>
              {a.personalNumber}
            </label>
            <input
              id="transfer_to"
              name="transfer_to"
              defaultValue={transferTo}
              placeholder="+1 415 555 0199"
              className={field}
            />
            <p className="mt-1.5 text-xs text-neutral-400">{a.forwardedNote}</p>
          </div>
          <label className={toggleRow}>
            <span>
              <span className="block text-sm font-medium text-neutral-800">{a.textAlerts}</span>
              <span className="block text-xs text-neutral-400">{a.textAlertsSub}</span>
            </span>
            <input
              type="checkbox"
              name="sms_alerts"
              defaultChecked={smsAlerts}
              className="peer sr-only"
            />
            <span className={toggle} />
          </label>
        </TopicModal>

        <TopicModal
          assistantId={assistant.id}
          section={SECTION.calendar}
          title={a.topicBookingTitle}
          subtitle={a.topicBookingSub}
          summary={accessCount > 0 ? a.writeBook : null}
        >
          {calendars.length === 0 ? (
            <p className="text-sm text-neutral-500">
              {a.noCalendars}{" "}
              <Link
                href="/dashboard/calendar"
                className="font-medium text-neutral-900 underline underline-offset-2"
              >
                {a.connectOne}
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              {calendars.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200/70 bg-white/60 px-3 py-2.5"
                >
                  <div className="text-sm font-medium text-neutral-800">
                    {providerName(c.provider)}
                  </div>
                  {/* Three levels, deliberately not collapsed to a toggle. */}
                  <select
                    name={`cal_access_${c.id}`}
                    defaultValue={accessMap.get(c.id) ?? "none"}
                    className="shrink-0 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
                  >
                    <option value="none">{a.noAccess}</option>
                    <option value="read">{a.readAvailability}</option>
                    <option value="write">{a.writeBook}</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </TopicModal>

        <TopicModal
          assistantId={assistant.id}
          section={`${SECTION.role}`}
          title={a.topicTuneTitle}
          subtitle={a.topicTuneSub}
          summary={null}
        >
          {/* This modal owns three sections at once, so it carries all three
              markers - the two extra ride along as hidden inputs. */}
          <input type="hidden" name={SECTION.voice} value="1" />
          <input type="hidden" name={SECTION.voiceLang} value="1" />
          <input type="hidden" name={SECTION.email} value="1" />

          <div>
            <label htmlFor="system_prompt" className={labelCls}>
              {a.role}
            </label>
            <textarea
              id="system_prompt"
              name="system_prompt"
              defaultValue={assistant.system_prompt}
              rows={5}
              placeholder={a.rolePlaceholder}
              className={`${field} resize-y`}
            />
            <p className="mt-1.5 text-xs text-neutral-400">{a.roleHint}</p>
          </div>

          <div className="border-t border-neutral-100 pt-4">
            <AdvancedVoiceSettings
              defaultSpeed={typeof voiceCfg.speed === "number" ? voiceCfg.speed : 1}
              defaultStability={typeof voiceCfg.stability === "number" ? voiceCfg.stability : 0.5}
              voiceByLanguage={voiceByLanguage}
              languages={voiceLanguages}
            />
          </div>

          <div className="space-y-3 border-t border-neutral-100 pt-4">
            <label className={toggleRow}>
              <span>
                <span className="block text-sm font-medium text-neutral-800">
                  {a.sendEmailTranscripts}
                </span>
                <span className="block text-xs text-neutral-400">{a.sendEmailTranscriptsSub}</span>
              </span>
              <input
                type="checkbox"
                name="email_enabled"
                defaultChecked={emailCfg.enabled ?? false}
                className="peer sr-only"
              />
              <span className={toggle} />
            </label>
            <div>
              <label htmlFor="email_to" className={labelCls}>
                {a.sendTo}
              </label>
              <input
                id="email_to"
                name="email_to"
                type="email"
                defaultValue={emailCfg.to ?? ""}
                placeholder="you@business.com"
                className={field}
              />
            </div>
          </div>
        </TopicModal>

        {/* Delete sits with Fine-tune's topic, not under billing - but outside
            the modal's form, since it posts to a different action. */}
        <div className="shape-card glass flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900">{a.dangerZone}</p>
            <p className="mt-0.5 text-xs text-neutral-500">{a.deleteHint}</p>
          </div>
          <DeleteAssistant id={assistant.id} name={assistant.name} />
        </div>

        {canAddMore && (
          <div className="px-1 pb-2">
            <Link
              href="/dashboard/assistant?add=1"
              className="text-xs font-medium text-neutral-500 underline underline-offset-2 hover:text-neutral-900"
            >
              {a.addAnother}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
