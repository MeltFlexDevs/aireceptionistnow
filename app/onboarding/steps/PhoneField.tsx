"use client";

import { useState } from "react";
import { DIAL_OPTIONS, joinPhone, splitPhone } from "@/lib/number-pricing";

// Phone input with a leading dial-prefix picker (flag +xxx). The prefix defaults
// to the funnel's country; the user can type just the local part or paste a full
// international number - joinPhone reconciles both into one E.164 hidden value.
export function PhoneField({
  name,
  defaultCountry,
  defaultValue = "",
  placeholder,
}: {
  name: string;
  defaultCountry: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const initial = splitPhone(defaultValue, defaultCountry);
  const [code, setCode] = useState(initial.code);
  const [local, setLocal] = useState(initial.local);

  const dial = DIAL_OPTIONS.find((d) => d.code === code)?.dial ?? "";
  const value = joinPhone(dial, local);

  return (
    <div className="flex rounded-lg border border-neutral-200 bg-white transition-colors focus-within:border-neutral-900">
      <input type="hidden" name={name} value={value} />
      <div className="relative">
        <select
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-label="Country code"
          className="h-full appearance-none rounded-l-lg bg-transparent py-2 pl-3 pr-7 text-base text-neutral-900 outline-none sm:text-sm"
        >
          {DIAL_OPTIONS.map((d) => (
            <option key={d.code} value={d.code}>
              {d.flag} {d.dial}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
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
      <input
        type="tel"
        inputMode="tel"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-r-lg bg-transparent py-2 pl-1 pr-3 text-base text-neutral-900 outline-none placeholder:text-neutral-400 sm:text-sm"
      />
    </div>
  );
}
