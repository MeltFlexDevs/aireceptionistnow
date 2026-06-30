"use client";

import { useState } from "react";
import {
  DEFAULT_COUNTRY,
  NUMBER_COUNTRIES,
  getCountryPricing,
  minutesForCredits,
} from "@/lib/number-pricing";

const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900";

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
      <select
        id="country"
        name="country"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className={field}
      >
        {NUMBER_COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.name}: {c.creditsPerMinute} credit{c.creditsPerMinute === 1 ? "" : "s"}/min
          </option>
        ))}
      </select>
      {/* In flow on mobile (stacked form); pinned below the select on sm+ so the
          row's inputs and button still bottom-align despite this helper line. */}
      <p className="mt-1.5 text-xs leading-snug text-neutral-500 sm:absolute sm:inset-x-0 sm:top-full sm:mt-1">
        {country.flag} {country.name}: <span className="font-medium text-neutral-700">{cpm} credit{cpm === 1 ? "" : "s"}/min</span>
        {". "}
        About {minutes.toLocaleString()} min of your {credits.toLocaleString()} credits.
      </p>
    </div>
  );
}
