import type { CSSProperties, ReactNode } from "react";
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
import { NUMBER_COUNTRIES } from "@/lib/number-pricing";
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
import { AiAvatar } from "@/app/(main)/onboarding/AiAvatar";
import { Phone, Calendar, Sparkle, Check } from "../../icons";

export const dynamic = "force-dynamic";

// Borderless white card, lifted off the grey page by a soft shadow.
const CARD = "rounded-xl bg-white shadow-[0_1px_3px_rgba(16,24,40,0.07)]";
const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900";
const labelCls = "mb-1.5 block text-sm font-medium text-neutral-700";
const toggle =
  "relative h-5 w-9 shrink-0 rounded-full bg-neutral-200 transition-colors peer-checked:bg-neutral-900 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:after:translate-x-4";
const toggleRow =
  "flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-neutral-200/70 bg-white/60 px-4 py-3 transition-colors hover:border-neutral-300";

// A named group of feature cards, e.g. "General" or "Call handling".
function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2.5 px-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
        {title}
      </h2>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

const strokeIcon = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Mic({ className }: { className?: string }) {
  return (
    <svg className={className} {...strokeIcon} aria-hidden>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" />
    </svg>
  );
}
function Chat({ className }: { className?: string }) {
  return (
    <svg className={className} {...strokeIcon} aria-hidden>
      <path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z" />
    </svg>
  );
}
function Trash({ className }: { className?: string }) {
  return (
    <svg className={className} {...strokeIcon} aria-hidden>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" />
    </svg>
  );
}

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

  const freePool = number
    ? []
    : allNumbers.filter((n) => !n.assistant_id && n.enabled && n.twilio_sid);
  const availableNumbers = freePool.length;
  // Countries actually available in the free pool, for the assign-number picker.
  const poolCountryMap = new Map<
    string,
    { code: string; name: string; flag: string; count: number }
  >();
  for (const n of freePool) {
    const c = countryFromPhone(n.e164);
    if (!c) continue;
    const meta = NUMBER_COUNTRIES.find((x) => x.code === c.iso);
    const cur = poolCountryMap.get(c.iso);
    if (cur) cur.count += 1;
    else poolCountryMap.set(c.iso, { code: c.iso, name: meta?.name ?? c.iso, flag: c.flag, count: 1 });
  }
  const poolCountries = [...poolCountryMap.values()];
  const country = number ? countryFromPhone(number.e164) : null;
  const credits = planCtx?.limits.minutesIncluded ?? 1000;
  const multi = assistants.length > 1;

  const accessCount = calAccess.filter((acc) => acc.level !== "none").length;

  // No number yet -> the receptionist isn't in service, whatever its enabled flag.
  const live = assistant.enabled && Boolean(number);
  const statusLabel = !number ? t.home.statusNoNumber : assistant.enabled ? a.onDuty : a.paused;

  return (
    <div className="rise mx-auto flex w-full max-w-3xl flex-col gap-5 pb-4">
      <Link
        href="/dashboard/assistant"
        className="press inline-flex w-fit shrink-0 items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900"
      >
        <span aria-hidden="true">&larr;</span> {a.back}
      </Link>
      {(assistant.elevenlabs_multilingual === false || error || notice) && (
        <div className="shrink-0 space-y-3">
          {assistant.elevenlabs_multilingual === false && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
              <span className="font-medium">{a.englishOnlyTitle}</span> {a.englishOnlyBody}
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
              {error}
            </div>
          )}
          {notice && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
              <span>{notice}</span>
              <Link href="/pricing" className="font-medium underline underline-offset-2">
                {t.common.viewPlans}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* HERO: who is answering, on what number, and a quick way to try it. */}
      <div className={`${CARD} p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="ava-ring ava-breathe" style={{ "--ava-size": "64px" } as CSSProperties}>
              <span>
                <AiAvatar mood={live ? "friendly" : "greeting"} className="h-[82%] w-[82%]" />
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-neutral-900">
                {assistant.name}
              </h1>
              <p className="text-sm text-neutral-500">{t.onboarding.brand}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${live ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className={`text-sm font-medium ${live ? "text-emerald-600" : "text-amber-600"}`}>
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TestCall assistantId={assistant.id} transferTo={transferTo} />
            <AssistantPowerToggle
              id={assistant.id}
              enabled={assistant.enabled}
              pauseLabel={t.home.pause}
              resumeLabel={t.home.resume}
            />
          </div>
        </div>

        <div className="mt-6 border-t border-neutral-100 pt-5">
          {number ? (
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  {a.phoneNumber}
                </p>
                <p className="mt-1.5 flex min-w-0 flex-wrap items-center gap-2.5">
                  {country && (
                    <span className="text-2xl leading-none" role="img" aria-label={country.iso}>
                      {country.flag}
                    </span>
                  )}
                  <span className="text-2xl font-semibold tabular-nums tracking-tight text-neutral-900">
                    {formatPhone(number.e164)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                    <Check className="h-3 w-3" />
                    {a.connected}
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
              </div>
            ) : (
              <GetNumberForm
                assistantId={assistant.id}
                credits={credits}
                availableCount={availableNumbers}
                poolCountries={poolCountries}
              />
            )}
        </div>
      </div>

      {/* SETTINGS: grouped feature cards, each opening a self-saving modal. */}
      <div className="space-y-6">
        <Group title={a.groupGeneral}>
          <TopicModal
            assistantId={assistant.id}
            section={SECTION.basics}
            icon={<Mic className="h-5 w-5" />}
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
            icon={<Chat className="h-5 w-5" />}
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
        </Group>

        <Group title={a.groupCallHandling}>
          <TopicModal
            assistantId={assistant.id}
            section={SECTION.alerts}
            icon={<Phone className="h-5 w-5" />}
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
            icon={<Calendar className="h-5 w-5" />}
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
        </Group>

        <Group title={a.groupAi}>
          <TopicModal
            assistantId={assistant.id}
            section={`${SECTION.role}`}
            icon={<Sparkle className="h-5 w-5" />}
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
        </Group>

        <Group title={a.dangerZone}>
          {/* Delete posts to its own action, so it sits outside any modal form. */}
          <div className={`${CARD} flex flex-wrap items-center justify-between gap-3 p-5`}>
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                <Trash className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-neutral-900">{assistant.name}</p>
                <p className="text-[13px] text-neutral-500">{a.deleteHint}</p>
              </div>
            </div>
            <DeleteAssistant id={assistant.id} name={assistant.name} />
          </div>
        </Group>
      </div>
    </div>
  );
}
