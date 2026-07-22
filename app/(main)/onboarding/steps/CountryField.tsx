"use client";

import { useState } from "react";
import { DEFAULT_COUNTRY, NUMBER_COUNTRIES } from "@/lib/number-pricing";
import { useT } from "@/lib/i18n/client";

const field =
  "w-full appearance-none rounded-lg border border-neutral-200 bg-white py-2 pl-3 pr-9 text-base text-neutral-900 outline-none transition-colors hover:border-neutral-300 focus:border-neutral-900 sm:text-sm";

// Localized country picker for the funnel.
export function CountryField({
  defaultCode,
  onChange,
}: {
  defaultCode?: string;
  /** Notifies a parent when the number country changes (live preview flag). */
  onChange?: (code: string) => void;
}) {
  const t = useT();
  const o = t.onboarding;
  const [code, setCode] = useState(defaultCode || DEFAULT_COUNTRY);

  return (
    <div>
      <label htmlFor="country" className="mb-1.5 block text-sm font-medium text-neutral-700">
        {o.numberCountry}
      </label>
      <div className="relative">
        <select
          id="country"
          name="country"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            onChange?.(e.target.value);
          }}
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
  );
}
