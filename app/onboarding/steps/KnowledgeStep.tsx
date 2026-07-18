"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useT } from "@/lib/i18n/client";
import type { KnowledgeSource } from "@/lib/knowledge/sources";
import { LiveAvatar } from "../LiveAvatar";
import { PdfForm } from "./PdfForm";
import {
  importTextAction,
  importUrlAction,
  knowledgeContinueAction,
  removeSourceAction,
} from "../actions";

const field =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-base text-neutral-900 outline-none transition-colors placeholder:text-neutral-300 focus:border-neutral-900 sm:text-sm";

// Step 2 has its own shape, distinct from step 1's single centred card: a split
// panel. On the left the receptionist sits "studying"; on the right the caller
// feeds it a website or PDF and watches the list of what it has learned grow.
export function KnowledgeStep({ sources }: { sources: KnowledgeSource[] }) {
  const o = useT().onboarding;
  const has = sources.length > 0;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="shape-card glass relative flex h-[min(46rem,calc(100dvh_-_11rem))] flex-col overflow-hidden sm:h-[min(34rem,calc(100dvh_-_11.5rem))] sm:flex-row">
        {/* Left: the studying receptionist - a calm hero panel. */}
        <div className="relative flex shrink-0 flex-col items-center justify-center gap-3 border-b border-neutral-200/70 bg-gradient-to-br from-neutral-100/90 to-neutral-50/30 px-6 py-5 text-center sm:w-[42%] sm:gap-4 sm:border-b-0 sm:border-r sm:py-10">
          <div className="relative flex items-center justify-center">
            <span className="onb-study-glow" aria-hidden />
            <div className="onb-aura onb-aura-sm">
              <div className="onb-avatar-disc">
                <LiveAvatar mood="studying" className="h-[74%] w-[74%]" label={o.role} />
              </div>
            </div>
          </div>
          <div className="relative">
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-[1.4rem]">
              {o.step2Title}
            </h1>
            <p className="mx-auto mt-2 max-w-[15rem] text-sm leading-relaxed text-neutral-500">
              {o.step2Sub}
            </p>
          </div>
        </div>

        {/* Right: feed it knowledge, then see what it learned. */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col p-5 sm:p-6">
          <div className="space-y-3">
            <form action={importUrlAction} className="space-y-1.5">
              <label htmlFor="url" className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                <Globe className="h-4 w-4 text-neutral-400" />
                {o.websiteUrl}
              </label>
              <div className="flex items-stretch gap-2">
                <input
                  id="url"
                  name="url"
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  placeholder={o.websitePlaceholder}
                  className={`${field} min-w-0`}
                />
                <ImportButton>{o.importBtn}</ImportButton>
              </div>
            </form>

            <PdfForm />

            <form action={importTextAction} className="space-y-1.5">
              <label htmlFor="text" className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                <Pencil className="h-4 w-4 text-neutral-400" />
                {o.ownKnowledge}
              </label>
              <textarea
                id="text"
                name="text"
                rows={2}
                placeholder={o.ownKnowledgePlaceholder}
                className={`${field} resize-none`}
              />
              <div className="flex justify-end">
                <ImportButton>{o.addKnowledge}</ImportButton>
              </div>
            </form>
          </div>

          <div className="mt-4 flex min-h-0 flex-1 flex-col">
            <h2 className="text-sm font-medium text-neutral-700">{o.importedTitle}</h2>
            <div className="mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {!has ? (
                <p className="text-sm leading-relaxed text-neutral-400">{o.knowledgeEmpty}</p>
              ) : (
                <ul className="space-y-2">
                  {sources.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50/80 px-3 py-2.5"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-neutral-500">
                        {s.kind === "website" ? <Globe className="h-4 w-4" /> : <BookIcon className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-neutral-900">{s.title}</p>
                        {s.summary && <p className="truncate text-xs text-neutral-500">{s.summary}</p>}
                      </div>
                      <form action={removeSourceAction}>
                        <input type="hidden" name="id" value={s.id} />
                        <RemoveButton label={o.remove} />
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <form action={knowledgeContinueAction} className="mt-4">
            <ContinueButton>{has ? o.continue : o.skipForNow}</ContinueButton>
          </form>
        </div>
      </div>
    </div>
  );
}

function ImportButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="press inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-800 transition-colors hover:border-neutral-300 disabled:opacity-60"
    >
      {pending && <Spinner />}
      {children}
    </button>
  );
}

function ContinueButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="onb-cta w-full">
      {pending ? <Spinner /> : null}
      {children}
      {!pending && <Arrow />}
    </button>
  );
}

function RemoveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={label}
      className="press shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-neutral-400 transition-colors hover:text-rose-600 disabled:opacity-50"
    >
      {pending ? "…" : label}
    </button>
  );
}

function Globe({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function Pencil({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
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

function Spinner() {
  return (
    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
    </svg>
  );
}
