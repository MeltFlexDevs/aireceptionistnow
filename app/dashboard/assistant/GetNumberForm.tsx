"use client";

import { useState } from "react";
import {
  DEFAULT_COUNTRY,
  NUMBER_COUNTRIES,
  getCountryPricing,
  minutesForCredits,
} from "@/lib/number-pricing";
import { SubmitButton } from "../components/SubmitButton";
import { getAgentNumberAction } from "./actions";

const field =
  "w-full appearance-none rounded-lg border border-neutral-200 bg-white py-2 pl-3 pr-9 text-sm text-neutral-900 outline-none transition-colors hover:border-neutral-300 focus:border-neutral-900";

interface Props {
  assistantId: string;
  credits: number;
}

// Get-number form with a live pricing readout. Buying provisions a number from
// our Twilio account and connects it to the assistant, so calls are logged here.
export function GetNumberForm({ assistantId, credits }: Props) {
  const [code, setCode] = useState(DEFAULT_COUNTRY);
  const country = getCountryPricing(code);
  const cpm = country.creditsPerMinute;
  const minutes = minutesForCredits(credits, cpm);

  return (
    <div className="space-y-3">
      <form action={getAgentNumberAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <input type="hidden" name="assistant_id" value={assistantId} />
        <div className="flex-1">
          <label htmlFor="country" className="mb-1.5 block text-sm font-medium text-neutral-700">
            Number country
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
        <SubmitButton pendingText="Getting number…" className="h-[38px]">
          Get number
        </SubmitButton>
      </form>

      {/* Live pricing readout */}
      <div className="grid grid-cols-3 divide-x divide-neutral-200/70 overflow-hidden rounded-lg border border-neutral-200/70 bg-white/60">
        <Stat label="Country" value={`${country.flag} ${country.name}`} />
        <Stat label="Rate" value={`${cpm} credit${cpm === 1 ? "" : "s"}/min`} />
        <Stat label="Est. talk time" value={`~${minutes.toLocaleString()} min`} />
      </div>

      <p className="text-xs text-neutral-400">
        Billed from your plan credits. Cancel the number anytime.
      </p>
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
