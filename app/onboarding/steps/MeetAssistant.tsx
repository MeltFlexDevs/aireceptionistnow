"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, MotionConfig, type Variants } from "motion/react";
import { useT } from "@/lib/i18n/client";
import {
  DIAL_OPTIONS,
  NUMBER_COUNTRIES,
  getCountryPricing,
  joinPhone,
  splitPhone,
} from "@/lib/number-pricing";
import type { OnboardingConfig } from "@/lib/dashboard/onboarding-profile";
import type { VoiceOption } from "@/app/dashboard/numbers/voices";
import { fillTemplate, genderOf, voicePersonality, type Mood } from "../personality";
import { LiveAvatar } from "../LiveAvatar";
import { VoicePicker } from "../VoicePicker";
import { languageForCountry } from "../voice-region";
import { saveBasicsAction } from "../actions";

const field =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 outline-none transition-colors placeholder:text-neutral-300 focus:border-neutral-900";

const LAST_STEP = 4; // 0 business, 1 name, 2 country, 3 voice, 4 phone, then 5 = done
const TABS = ["tabBusiness", "tabName", "tabCountry", "voice", "tabPhone"] as const;

const stepVariants: Variants = {
  enter: (dir: number) => ({ y: dir >= 0 ? 10 : -10, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (dir: number) => ({ y: dir >= 0 ? -10 : 10, opacity: 0 }),
};

interface Props {
  config: OnboardingConfig;
  voiceDefault: string;
  countryDefault: string;
  emailDefault: string;
  defaults: VoiceOption[];
}

// Step 1, reimagined as building a custom avatar for the business: one question
// at a time in a single card that grows and morphs, with a receptionist that
// comes alive between answers. The real form fields live hidden and get
// submitted once, at the end, to advance the funnel.
export function MeetAssistant({
  config,
  voiceDefault,
  countryDefault,
  emailDefault,
  defaults,
}: Props) {
  const o = useT().onboarding;
  const formRef = useRef<HTMLFormElement>(null);
  // Unrecognisable field names so browser/password autofill can't inject a
  // remembered value (e.g. a stray "A") into the nominally-empty inputs.
  const uid = useId().replace(/[:]/g, "");

  const initialPhone = splitPhone(config.alertPhone ?? "", countryDefault);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [nudge, setNudge] = useState(0);
  const [rewind, setRewind] = useState(0);

  // Always start blank so a stale saved value never shows pre-typed; the caller
  // types their business name fresh (they can't advance without it anyway).
  const [business, setBusiness] = useState("");
  const [name, setName] = useState(config.assistantName ?? "");
  const [countryCode, setCountryCode] = useState(countryDefault);
  const [phoneCode, setPhoneCode] = useState(initialPhone.code);
  const [phoneLocal, setPhoneLocal] = useState(initialPhone.local);
  const [voiceId, setVoiceId] = useState(voiceDefault);
  const [voice, setVoice] = useState<VoiceOption | null>(
    () => defaults.find((v) => v.voiceId === voiceDefault) ?? null,
  );
  const [gender, setGender] = useState<"f" | "m">(
    () => genderOf(defaults.find((v) => v.voiceId === voiceDefault)?.description) ?? "f",
  );

  const done = step > LAST_STEP;
  const dial = DIAL_OPTIONS.find((d) => d.code === phoneCode)?.dial ?? "";
  const phoneE164 = joinPhone(dial, phoneLocal);
  const country = getCountryPricing(countryCode);
  const trimmedName = name.trim();
  // How far the caller may jump: business unlocks the name tab, business+name
  // unlock the rest. Keeps them from reaching the last tab (or finishing) unfilled.
  const maxOpenable = !business.trim() ? 0 : !trimmedName ? 1 : LAST_STEP;
  const voiceLanguage = languageForCountry(countryCode);
  const mood: Mood = done
    ? "celebrate"
    : step === 0 && !business.trim()
      ? "greeting"
      : voicePersonality(voice?.name, voice?.description).mood;

  // On the success beat, hold the celebration, then submit once to move on.
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => formRef.current?.requestSubmit(), 1300);
    return () => clearTimeout(t);
  }, [done]);

  function go(target: number) {
    const next = Math.max(0, Math.min(target, LAST_STEP + 1));
    setDir(next >= step ? 1 : -1);
    if (next > step) setNudge((n) => n + 1);
    else if (next < step) setRewind((r) => r + 1);
    setStep(next);
  }
  const move = (delta: number) => go(step + delta);
  const jumpTo = (target: number) => {
    if (target !== step && (target < step || target <= maxOpenable)) go(target);
  };

  function pickVoice(id: string, v: VoiceOption) {
    setVoiceId(id);
    setVoice(v);
    const g = genderOf(v.description);
    if (g) setGender(g);
  }

  // The name-step gender toggle also defaults the voice to that gender - the
  // preference then carries to whatever language a caller phones in.
  function pickGender(g: "f" | "m") {
    setGender(g);
    const dv = defaults.find((v) => genderOf(v.description) === g) ?? defaults[0];
    if (dv) {
      setVoiceId(dv.voiceId);
      setVoice(dv);
    }
  }

  const canAdvance =
    step === 0
      ? business.trim().length > 0
      : step === 1
        ? trimmedName.length > 0
        : business.trim().length > 0 && trimmedName.length > 0;

  function onEnter(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (canAdvance) move(1);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto w-full max-w-lg">
        <div className="text-center">
          <h1 className="text-[1.7rem] font-semibold leading-tight tracking-tight text-neutral-900">
            {o.setupTitle}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">{o.setupSub}</p>
        </div>

        {/* Fixed-size card: the box never resizes between substeps. The avatar
            and progress rail sit at the top, the CTA is pinned to the bottom,
            and the changing question floats in the flexible middle. */}
        <div className="shape-card glass relative mt-4 flex h-[min(33rem,calc(100dvh_-_13.5rem))] flex-col px-5 pb-6 pt-7 sm:h-[min(33rem,calc(100dvh_-_11.5rem))] sm:px-8 sm:pb-8">
          {/* Back: an arrow in the top-left corner, shown once past the first
              substep. Replaces the old inline "Back" text link. */}
          {!done && step > 0 && (
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label={o.back}
              className="press absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white/70 text-neutral-500 backdrop-blur transition-colors hover:border-neutral-300 hover:text-neutral-900"
            >
              <BackArrow />
            </button>
          )}

          {/* Avatar, progress rail and the question form one top-anchored
              cluster - the avatar sits near the top, the tabs and question
              follow tightly, and the slack collects above the docked button. */}
          <div className="flex flex-1 flex-col items-center justify-start">
            <div className="onb-aura">
              <div className="onb-avatar-disc">
                <LiveAvatar mood={mood} nudge={nudge} rewind={rewind} celebrate={done} className="h-[74%] w-[74%]" />
              </div>
            </div>

            {!done && (
              <div className="mt-6 w-full">
                <StepRail
                  tabs={TABS}
                  labels={TABS.map((tab) => o[tab])}
                  step={step}
                  maxOpenable={maxOpenable}
                  onJump={jumpTo}
                />
              </div>
            )}

            <div className="mt-7 w-full">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              {done ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 250, damping: 22 }}
                  className="py-2 text-center"
                >
                  <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                    {o.allSet}
                  </h2>
                  <p className="mt-2 text-sm text-neutral-500">
                    {fillTemplate(o.previewReady, { name: trimmedName })}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={step}
                  custom={dir}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.26, ease: "easeOut" }}
                >
                  {step === 0 && (
                    <Question label={o.qBusiness}>
                      <input
                        autoFocus
                        name={`co-${uid}`}
                        autoComplete="off"
                        autoCapitalize="words"
                        spellCheck={false}
                        data-1p-ignore
                        data-lpignore="true"
                        data-form-type="other"
                        value={business}
                        onChange={(e) => setBusiness(e.target.value)}
                        onKeyDown={onEnter}
                        placeholder={o.companyPlaceholder}
                        className={field}
                      />
                    </Question>
                  )}

                  {step === 1 && (
                    <Question label={o.qName}>
                      <input
                        autoFocus
                        name={`nm-${uid}`}
                        autoComplete="off"
                        spellCheck={false}
                        data-1p-ignore
                        data-lpignore="true"
                        data-form-type="other"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={onEnter}
                        placeholder={o.assistantPlaceholder}
                        className={field}
                      />
                      <div className="mt-3 flex justify-center gap-2">
                        {(["f", "m"] as const).map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => pickGender(g)}
                            className={`press rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                              gender === g
                                ? "bg-neutral-900 text-white"
                                : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                            }`}
                          >
                            {g === "f" ? o.filterFemale : o.filterMale}
                          </button>
                        ))}
                      </div>
                    </Question>
                  )}

                  {step === 2 && (
                    <Question label={o.qCountry}>
                      <div className="mb-3 flex justify-center">
                        <span className="text-5xl leading-none">{country.flag}</span>
                      </div>
                      <SelectField value={countryCode} onChange={setCountryCode}>
                        {NUMBER_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag}  {c.name}
                          </option>
                        ))}
                      </SelectField>
                    </Question>
                  )}

                  {step === 3 && (
                    <Question label={o.qVoice}>
                      <VoicePicker
                        defaults={defaults}
                        language={voiceLanguage}
                        gender={gender}
                        value={voiceId}
                        onChange={pickVoice}
                      />
                    </Question>
                  )}

                  {step === 4 && (
                    <Question label={o.qPhone}>
                      <div className="flex rounded-xl border border-neutral-200 bg-white transition-colors focus-within:border-neutral-900">
                        <div className="relative">
                          <select
                            value={phoneCode}
                            onChange={(e) => setPhoneCode(e.target.value)}
                            aria-label="Country code"
                            className="h-full appearance-none rounded-l-xl bg-transparent py-3 pl-4 pr-7 text-base text-neutral-900 outline-none"
                          >
                            {DIAL_OPTIONS.map((d) => (
                              <option key={d.code} value={d.code}>
                                {d.flag} {d.dial}
                              </option>
                            ))}
                          </select>
                          <Chevron className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                        </div>
                        <input
                          type="tel"
                          inputMode="tel"
                          autoFocus
                          value={phoneLocal}
                          onChange={(e) => setPhoneLocal(e.target.value)}
                          onKeyDown={onEnter}
                          placeholder="903 123 456"
                          className="w-full rounded-r-xl bg-transparent py-3 pl-1 pr-4 text-base text-neutral-900 outline-none placeholder:text-neutral-300"
                        />
                      </div>
                    </Question>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </div>

          {/* Secondary action sits above the primary button so Next stays
              docked to the bottom of the card on every substep. */}
          {!done && (
            <div className="flex flex-col items-center gap-3">
              {step === LAST_STEP && (
                <button
                  type="button"
                  onClick={() => move(1)}
                  disabled={!canAdvance}
                  className="press text-sm font-medium text-neutral-400 hover:text-neutral-700 disabled:opacity-40"
                >
                  {o.skipForNow}
                </button>
              )}
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                disabled={!canAdvance}
                data-ready={canAdvance ? "true" : undefined}
                onClick={() => move(1)}
                className="onb-cta w-full"
              >
                {step === LAST_STEP ? o.continue : o.next}
                <Arrow />
              </motion.button>
            </div>
          )}
        </div>

        {/* Hidden form: the funnel's real payload, submitted once at the end. */}
        <form ref={formRef} action={saveBasicsAction} className="hidden">
          <input type="hidden" name="company_name" value={business} readOnly />
          <input type="hidden" name="assistant_name" value={name} readOnly />
          <input type="hidden" name="voice_id" value={voiceId} readOnly />
          <input type="hidden" name="voice_gender" value={gender} readOnly />
          <input type="hidden" name="country" value={countryCode} readOnly />
          <input type="hidden" name="alerts_email" value={emailDefault} readOnly />
          <input type="hidden" name="alert_phone" value={phoneE164} readOnly />
        </form>
      </div>
    </MotionConfig>
  );
}

// Clean, labelled progress rail: a short bar per substep with its name above.
// Completed and reachable steps are clickable to jump back; future steps stay
// quiet. Replaces the old filled-pill row so the substeps read as progress.
function StepRail({
  tabs,
  labels,
  step,
  maxOpenable,
  onJump,
}: {
  tabs: readonly string[];
  labels: string[];
  step: number;
  maxOpenable: number;
  onJump: (i: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {tabs.map((tab, i) => {
        const isCurrent = i === step;
        const isPast = i < step;
        const openable = isPast || i <= maxOpenable;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onJump(i)}
            disabled={!isCurrent && !openable}
            aria-current={isCurrent ? "step" : undefined}
            className={`group flex flex-col items-center gap-2 ${
              openable && !isCurrent ? "cursor-pointer" : "cursor-default"
            }`}
          >
            <span
              className={`w-full truncate text-center text-[11px] font-medium transition-colors ${
                isCurrent
                  ? "text-neutral-900"
                  : openable
                    ? "text-neutral-400 group-hover:text-neutral-700"
                    : "text-neutral-300"
              }`}
            >
              {labels[i]}
            </span>
            <span
              className={`h-[3px] w-full rounded-full transition-colors ${
                isCurrent || isPast
                  ? "bg-neutral-900"
                  : openable
                    ? "bg-neutral-200 group-hover:bg-neutral-300"
                    : "bg-neutral-200"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

function Question({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-center text-lg font-medium text-neutral-900">{label}</p>
      {children}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${field} appearance-none pr-9`}
      >
        {children}
      </select>
      <Chevron className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
    </div>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function BackArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}
