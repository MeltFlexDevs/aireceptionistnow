"use client";

import { useActionState, useState } from "react";
import {
  DEFAULT_COUNTRY,
  NUMBER_COUNTRIES,
  getCountryPricing,
  minutesForCredits,
} from "@/lib/number-pricing";
import { SubmitButton } from "../components/SubmitButton";
import { SavePill } from "../components/SavePill";
import { IDLE, type ActionState } from "@/lib/dashboard/action-state";
import { getAgentNumberAction } from "./actions";
import { useT } from "@/lib/i18n/client";

const field =
  "w-full appearance-none rounded-lg border border-neutral-200 bg-white py-2 pl-3 pr-9 text-sm text-neutral-900 outline-none transition-colors hover:border-neutral-300 focus:border-neutral-900";

interface Props {
  assistantId: string;
  credits: number;
  availableCount?: number;
}

export function GetNumberForm({ assistantId, credits, availableCount = 0 }: Props) {
  const t = useT();
  const [code, setCode] = useState(DEFAULT_COUNTRY);
  const [state, formAction] = useActionState<ActionState, FormData>(getAgentNumberAction, IDLE);
  const country = getCountryPricing(code);
  const cpm = country.creditsPerMinute;
  const minutes = minutesForCredits(credits, cpm);

  if (availableCount > 0) {
    return (
      <form
        action={formAction}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <input type="hidden" name="assistant_id" value={assistantId} />
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {availableCount} {t.common.available.toLowerCase()}
          </span>
          <span>{t.numbers.poolNote}</span>
        </div>
        <span className="flex shrink-0 items-center gap-2">
          <SavePill state={state} />
          <SubmitButton pendingText={t.numbers.assigning} className="press h-9 px-4">
            {t.numbers.assignNumber}
          </SubmitButton>
        </span>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <input type="hidden" name="assistant_id" value={assistantId} />
        <div className="flex-1">
          <label htmlFor="country" className="mb-1.5 block text-sm font-medium text-neutral-700">
            {t.numbers.numberCountry}
          </label>
          <div className="relative">
            <select
              id="country"
              name="country"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={field}
            >
              {NUMBER_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag}  {c.name}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
        <SubmitButton pendingText={t.numbers.gettingNumber} className="press h-[38px] w-full sm:w-auto">
          {t.numbers.getNumber}
        </SubmitButton>
      </form>

      <SavePill state={state} />

      <div className="grid grid-cols-3 divide-x divide-neutral-200/70 overflow-hidden rounded-lg border border-neutral-200/70 bg-white/60">
        <Stat label={t.numbers.country} value={`${country.flag} ${country.name}`} />
        <Stat label={t.numbers.rate} value={`${cpm} credit${cpm === 1 ? "" : "s"}/min`} />
        <Stat label={t.numbers.estTalkTime} value={`~${minutes.toLocaleString()} min`} />
      </div>

      <p className="text-xs text-neutral-400">{t.numbers.billedNote}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2.5">
      <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="mt-0.5 truncate text-sm font-medium text-neutral-900">{value}</div>
    </div>
  );
}
