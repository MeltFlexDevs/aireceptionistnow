"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "../icons";
import { createAssistantAction } from "./actions";

const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-violet-400";

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
];

const STEPS = [
  "Saving assistant",
  "Provisioning phone number",
  "Configuring webhook",
  "Almost ready",
];

function Progress() {
  const { pending } = useFormStatus();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!pending) {
      setStep(0);
      return;
    }
    const id = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      1400,
    );
    return () => clearInterval(id);
  }, [pending]);

  if (!pending) return null;
  const pct = Math.min(((step + 1) / STEPS.length) * 100, 95);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-base font-medium text-neutral-900">Creating your assistant</h3>
        <p className="mt-1 text-sm text-neutral-500">{STEPS[step]}…</p>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-violet-600 transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        <ul className="mt-4 space-y-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2 text-sm">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                  i < step
                    ? "bg-emerald-500 text-white"
                    : i === step
                      ? "bg-violet-600 text-white"
                      : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span className={i <= step ? "text-neutral-800" : "text-neutral-400"}>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-[38px] items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
    >
      <Plus className="h-4 w-4" />
      {pending ? "Creating…" : "Create assistant"}
    </button>
  );
}

export function CreateAssistantForm() {
  return (
    <form action={createAssistantAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-neutral-700">Name</label>
        <input id="name" name="name" placeholder="e.g. Front desk" className={field} />
      </div>
      <div className="sm:w-44">
        <label htmlFor="country" className="mb-1.5 block text-sm font-medium text-neutral-700">Number country</label>
        <select id="country" name="country" defaultValue="US" className={field}>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
          ))}
        </select>
      </div>
      <SubmitButton />
      <Progress />
    </form>
  );
}
