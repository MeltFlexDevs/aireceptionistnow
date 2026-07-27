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
import { NUMBER_COUNTRIES } from "@/lib/number-pricing";
import { currentUserId } from "@/lib/auth";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { ownerTimezone } from "@/lib/dashboard/timezone";
import { describeTransferHours, parseTransferHours } from "@/lib/call-engine/transfer-hours";
import {
  buildSetupItems,
  greetingWordCount,
  setupProgress,
  voiceName,
  type SetupKey,
} from "@/lib/dashboard/assistant-setup";
import { TransferHoursFields } from "../TransferHoursFields";
import { SECTION } from "@/lib/dashboard/assistant-patch";
import { CARD, SECTION_HEADING } from "../../components/card";
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


const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900";
const labelCls = "mb-1.5 block text-sm font-medium text-neutral-700";
const toggle =
  "relative h-5 w-9 shrink-0 rounded-full bg-neutral-200 transition-colors peer-checked:bg-neutral-900 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-4";
const toggleRow =
  "flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-neutral-200/70 bg-white/60 px-4 py-3 transition-colors hover:border-neutral-300";

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
  // params, searchParams and the (cached) dictionary are independent - resolve
  // them together. Saves report inline now; only cross-page redirects use params.
  const [{ id }, { error, notice }, t, locale] = await Promise.all([params, searchParams, getDictionary(), getLocale()]);
  const a = t.assistants;

  // First batch: everything keyed only on the id param (or nothing) - no
  // dependency on the assistant row or ownerId. getAssistant is cache()-wrapped,
  // so the owner check below reuses this result without a second query, and
  // getAssistantNumber takes the id directly (it equals assistant.id).
  const [assistant, ownerId, number, allNumbers] = await Promise.all([
    getAssistant(id).catch(() => null),
    currentUserId(),
    getAssistantNumber(id).catch(() => null),
    listNumbers().catch(() => [] as Awaited<ReturnType<typeof listNumbers>>),
  ]);
  if (!assistant) notFound();
  if (ownerId && assistant.owner_id && assistant.owner_id !== ownerId) notFound();

  // Second batch: the ownerId-scoped reads, run only once the owner check passes.
  const [integrations, planCtx, assistants, accountTimezone] = await Promise.all([
    listIntegrations(ownerId ?? undefined).catch(
      () => [] as Awaited<ReturnType<typeof listIntegrations>>,
    ),
    getPlanContextCached(ownerId).catch(() => null),
    listAssistants(ownerId ?? undefined).catch(() => []),
    ownerTimezone(ownerId ?? "").catch(() => "UTC"),
  ]);
  const calendars = integrations.filter((i) => i.type === "calendar");

  const emailCfg =
    (assistant.routing as { emailTranscripts?: { enabled?: boolean; to?: string } })
      ?.emailTranscripts ?? {};
  const transferTo = String((assistant.routing as { transferTo?: string })?.transferTo ?? "");
  const smsAlerts = (assistant.routing as { smsAlerts?: boolean })?.smsAlerts ?? true;
  const transferHours = parseTransferHours(
    (assistant.routing as Record<string, unknown>)?.transferHours,
  );
  // accountTimezone (resolved in the batch above) is only a seed for a schedule
  // that has none yet - once saved, the timezone travels inside
  // routing.transferHours, because the call-start webhook resolves a
  // NumberConfig and never sees account settings.
  //
  // Weekday names come from Intl rather than the dictionaries: eight locales
  // times seven days is 56 strings the platform already knows, and Intl gets
  // the capitalisation conventions right per language.
  const weekdayNames = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const weekdayLabels = Array.from({ length: 7 }, (_, day) =>
    // 2026-07-26 was a Sunday, so day 0 lands on Sunday to match getDay().
    weekdayNames.format(new Date(Date.UTC(2026, 6, 26 + day))),
  );
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

  // One source of truth for "is this set up?", shared by the cards and the
  // progress bar so the badges and the percentage can never disagree.
  const setupItems = buildSetupItems({
    voiceId: assistant.voice_id ?? "",
    greeting: assistant.greeting ?? "",
    transferTo,
    calendarsConnected: calendars.length,
    calendarAccessCount: accessCount,
    systemPrompt: assistant.system_prompt ?? "",
  });
  const progress = setupProgress(setupItems);
  const isDone = (key: SetupKey) => setupItems.find((i) => i.key === key)?.done ?? false;

  // What each card shows at rest. A configured card states its current value;
  // an unconfigured one shows its todoLabel instead, so this is only read when
  // the topic is done.
  const greetingWords = greetingWordCount(assistant.greeting ?? "");
  const voiceSummary = voiceName(assistant.voice_id ?? "") || a.customVoice;
  const calendarSummary = calendars
    .filter((c) => accessMap.has(c.id))
    .map((c) => providerName(c.provider))
    .join(", ");

  return (
    <div className="rise flex w-full flex-col gap-4 pb-2">
      <Link
        href="/dashboard/assistant"
        className="press inline-flex w-fit shrink-0 items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900"
      >
        <span aria-hidden="true">&larr;</span> {a.back}
      </Link>

      {(assistant.elevenlabs_multilingual === false || error || notice) && (
        <div className="shrink-0 space-y-2">
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

      {/* HERO BAR: who is answering, on what number, and the two primary actions. */}
      <div className={`${CARD} shrink-0 p-4 sm:p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="ava-ring ava-breathe" style={{ "--ava-size": "56px" } as CSSProperties}>
              <span>
                <AiAvatar mood={live ? "friendly" : "greeting"} className="h-[82%] w-[82%]" />
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight text-neutral-900">
                {assistant.name}
              </h1>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${live ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className={`text-sm font-medium ${live ? "text-emerald-600" : "text-amber-600"}`}>
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-x-4 gap-y-3">
            {number ? (
              <div className="flex flex-wrap items-center gap-2">
                {country && (
                  <span className="text-xl leading-none" role="img" aria-label={country.iso}>
                    {country.flag}
                  </span>
                )}
                <span className="text-lg font-semibold tabular-nums tracking-tight text-neutral-900">
                  {formatPhone(number.e164)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                  <Check className="h-3 w-3" />
                  {a.connected}
                </span>
                <UnlinkNumber assistantId={assistant.id} numberId={number.id} />
                {multi && (
                  <ReassignNumber
                    numberId={number.id}
                    currentAssistantId={assistant.id}
                    assistants={assistants.map((x) => ({ id: x.id, name: x.name }))}
                  />
                )}
              </div>
            ) : (
              <GetNumberForm
                assistantId={assistant.id}
                credits={credits}
                availableCount={availableNumbers}
                poolCountries={poolCountries}
              />
            )}
            <div className="flex items-center gap-2">
              <TestCall assistantId={assistant.id} transferTo={transferTo} />
              <AssistantPowerToggle
                id={assistant.id}
                enabled={assistant.enabled}
                pauseLabel={t.home.pause}
                resumeLabel={t.home.resume}
              />
            </div>
          </div>
        </div>

        {/* Setup progress. Reads the same items as the card badges, so the bar
            and the badges cannot disagree. Hidden once everything is done -
            a permanent 100% bar is decoration, not information. */}
        {progress.done < progress.total && (
          <div className="mt-5 border-t border-neutral-100 pt-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] font-medium text-neutral-600">{a.setupProgress}</span>
              <span className="text-[13px] font-medium tabular-nums text-neutral-500">
                {progress.done}/{progress.total}
              </span>
            </div>
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"
              role="progressbar"
              aria-valuenow={progress.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={a.setupProgress}
            >
              <div
                className="h-full rounded-full bg-neutral-900 transition-[width] duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* SETTINGS: one card per topic, each opening a self-saving modal. Full-
          width grid so it all reads on one screen instead of a long scroll. */}
      <section>
        <h2 className={SECTION_HEADING}>
          {a.groupGeneral}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TopicModal
          assistantId={assistant.id}
          section={SECTION.basics}
          icon={<Mic className="h-6 w-6" />}
          title={a.topicVoiceTitle}
          subtitle={a.topicVoiceSub}
          summary={voiceSummary}
          done={isDone("voice")}
          todoLabel={a.voiceTodo}
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
          icon={<Chat className="h-6 w-6" />}
          title={a.topicGreetingTitle}
          subtitle={a.topicGreetingSub}
          summary={`${greetingWords} ${a.wordsLabel}`}
          done={isDone("greeting")}
          todoLabel={a.greetingTodo}
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

        </div>
      </section>

      <section>
        <h2 className={SECTION_HEADING}>
          {a.groupCallHandling}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TopicModal
          assistantId={assistant.id}
          section={SECTION.alerts}
          icon={<Phone className="h-6 w-6" />}
          title={a.topicTransferTitle}
          subtitle={a.topicTransferSub}
          summary={
            transferHours
              ? `${formatPhone(transferTo)} · ${describeTransferHours(transferHours)}`
              : formatPhone(transferTo)
          }
          done={isDone("transfer")}
          todoLabel={a.transferTodo}
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
            <input type="checkbox" name="sms_alerts" defaultChecked={smsAlerts} className="peer sr-only" />
            <span className={toggle} />
          </label>
          <TransferHoursFields
            hours={transferHours}
            fallbackTimezone={accountTimezone}
            labels={{
              scheduleTitle: a.transferScheduleTitle,
              scheduleSub: a.transferScheduleSub,
              alwaysLabel: a.transferAlways,
              scheduledLabel: a.transferScheduled,
              timezoneLabel: a.transferTimezone,
              fromLabel: a.transferFrom,
              toLabel: a.transferTo,
              closedNote: a.transferClosedNote,
              days: weekdayLabels,
            }}
          />
        </TopicModal>

        <TopicModal
          assistantId={assistant.id}
          section={SECTION.calendar}
          icon={<Calendar className="h-6 w-6" />}
          title={a.topicBookingTitle}
          subtitle={a.topicBookingSub}
          summary={calendarSummary}
          done={isDone("calendar")}
          todoLabel={a.calendarTodo}
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
                  <div className="text-sm font-medium text-neutral-800">{providerName(c.provider)}</div>
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

        </div>
      </section>

      <section>
        <h2 className={SECTION_HEADING}>
          {a.groupAi}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TopicModal
          assistantId={assistant.id}
          section={`${SECTION.role}`}
          icon={<Sparkle className="h-6 w-6" />}
          title={a.topicTuneTitle}
          subtitle={a.topicTuneSub}
          summary={(assistant.system_prompt ?? "").trim() ? a.role : a.behaviourDefault}
          done={isDone("behaviour")}
          todoLabel={a.behaviourTodo}
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
        </div>
      </section>

      {/* ADVANCED: still the last thing on the page and still set apart, but no
          longer a red slab. A permanent alarm around a button nobody is about to
          press just spends attention that the unfinished setup cards need more.
          DeleteAssistant already confirms by name, so the danger lives in the
          interaction rather than in the decoration around it. */}
      <section className="mt-2 border-t border-neutral-200 pt-5">
        <h2 className={SECTION_HEADING}>
          {a.advancedSection}
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white px-5 py-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
              <Trash className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-neutral-900">{a.dangerZone}</p>
              <p className="text-[13px] text-neutral-500">{a.deleteHint}</p>
            </div>
          </div>
          <DeleteAssistant id={assistant.id} name={assistant.name} />
        </div>
      </section>
    </div>
  );
}
