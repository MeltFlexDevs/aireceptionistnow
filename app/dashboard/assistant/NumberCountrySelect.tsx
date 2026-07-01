"use client";

import { useState } from "react";
import {
  DEFAULT_COUNTRY,
  NUMBER_COUNTRIES,
  getCountryPricing,
  minutesForCredits,
} from "@/lib/number-pricing";

const field =
  "w-full appearance-none rounded-lg border border-neutral-200 bg-white py-2 pl-3 pr-9 text-sm text-neutral-900 outline-none transition-colors hover:border-neutral-300 focus:border-neutral-900";

interface Props {
  /** Credits in the account's plan, used to show how many minutes the choice buys. */
  credits: number;
  /** Wrapper width class (the picker matches the surrounding form layout). */
  className?: string;
  defaultCode?: string;
}

/**
 * Country dropdown for a phone number plus a live note explaining the chosen
 * country's per-minute credit cost and how many minutes the plan's credits buy.
 * Posts the selected ISO code as `country` (consumed by the create/buy actions).
 */
export function NumberCountrySelect({
  credits,
  className = "sm:w-48",
  defaultCode = DEFAULT_COUNTRY,
}: Props) {
  const [code, setCode] = useState(defaultCode);
  const country = getCountryPricing(code);
  const { creditsPerMinute: cpm } = country;
  const minutes = minutesForCredits(credits, cpm);

  return (
    <div className={`relative ${className}`}>
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
              {c.flag}  {c.name} · {c.creditsPerMinute}/min
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
      {/* In flow on mobile (stacked form); pinned below the select on sm+ so the
          row's inputs and button still bottom-align despite this helper line. */}
      <p className="mt-1.5 text-xs leading-snug text-neutral-500 sm:absolute sm:inset-x-0 sm:top-full sm:mt-1">
        About <span className="font-medium text-neutral-700">{minutes.toLocaleString()} min</span> with your credits.
      </p>
    </div>
  );
}
