"use client";

import * as React from "react";
import Image from "next/image";

import { createClient } from "@/lib/supabase/client";
import { resolveSameOriginNext } from "@/lib/safe-redirect";
import { authErrorKey } from "@/lib/auth-error-key";
import type { UiCopy } from "@/content/i18n/_ui-copy";
import type { AuthMode } from "./AuthDialog";
import { ValidatedForm, Field, FieldError, ValidatedSubmit } from "@/app/components/forms/validated-form";

// The heavy half of the auth dialog: the Supabase browser client plus the full
// modal markup. It is split out of AuthDialog.tsx and loaded with next/dynamic
// (ssr: false) only once the dialog opens, so @supabase/supabase-js never ships
// in the shared marketing bundle - every public/SEO page loads without it. The
// lean provider in AuthDialog.tsx owns open/close state and renders this only
// while open, so this component can assume it is always visible.

function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 7 15" fill="none" aria-hidden="true">
      <rect x="0" y="0" width="2.5" height="15" rx="1" fill="currentColor" />
      <rect x="4.5" y="0" width="2.5" height="15" rx="1" fill="currentColor" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function LockGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M13.5 7.5H4.5C3.67157 7.5 3 8.17157 3 9V14.25C3 15.0784 3.67157 15.75 4.5 15.75H13.5C14.3284 15.75 15 15.0784 15 14.25V9C15 8.17157 14.3284 7.5 13.5 7.5Z" fill="currentColor" />
      <path d="M5.25 7.5V5.25C5.25 4.25544 5.64509 3.30161 6.34835 2.59835C7.05161 1.89509 8.00544 1.5 9 1.5C9.99456 1.5 10.9484 1.89509 11.6517 2.59835C12.3549 3.30161 12.75 4.25544 12.75 5.25V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

type Pending = "google" | "apple" | "email" | "verify" | null;

export default function AuthDialogBody({
  copy,
  mode,
  description,
  nextPath,
  onClose,
}: {
  copy: UiCopy["auth"];
  mode: AuthMode;
  description: string | null;
  nextPath: string;
  onClose: () => void;
}) {
  const [supabase] = React.useState(() => createClient());

  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [pending, setPending] = React.useState<Pending>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const [emailInvalid, setEmailInvalid] = React.useState(false);

  // Never show error.message: it is raw English GoTrue text. Map the error to a
  // localized text instead.
  const authError = (e: Parameters<typeof authErrorKey>[0]) => copy.errors[authErrorKey(e)];

  const resetState = React.useCallback(() => {
    setPending(null);
    setError(null);
    setSentTo(null);
    setCode("");
  }, []);

  const panelRef = React.useRef<HTMLDivElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const titleId = React.useId();
  const errorId = React.useId();

  // Remember what had focus when the dialog opened (the trigger) and give
  // focus back to it on every close path: Escape, Close, overlay click.
  React.useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    return () => {
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  // Focus the email input on open and after "Use a different email". The
  // code input focuses itself (autoFocus).
  React.useEffect(() => {
    if (!sentTo) emailRef.current?.focus();
  }, [sentTo]);

  // Lock body scroll, close on Escape and keep Tab inside the panel while
  // mounted (mounted === open).
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      // Wrap at both ends so aria-modal is honest: focus never reaches the
      // page behind the overlay.
      const panel = panelRef.current;
      if (!panel) return;
      const items = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  async function signInWithGoogle() {
    if (!supabase) return setError(copy.errors.notConfigured);
    setError(null);
    setEmailInvalid(false);
    setPending("google");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
    if (error) {
      setError(authError(error));
      setPending(null);
    }
  }

  async function signInWithApple() {
    if (!supabase) return setError(copy.errors.notConfigured);
    setError(null);
    setEmailInvalid(false);
    setPending("apple");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
    if (error) {
      setError(authError(error));
      setPending(null);
    }
  }

  async function signInWithEmail(event: React.FormEvent) {
    event.preventDefault();
    if (!email) return;
    if (!supabase) return setError(copy.errors.notConfigured);
    setError(null);
    setPending("email");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setPending(null);
    setEmailInvalid(error ? authErrorKey(error) === "invalidEmail" : false);
    if (error) setError(authError(error));
    else {
      setCode("");
      setSentTo(email);
    }
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault();
    if (!sentTo || code.length < 6) return;
    if (!supabase) return setError(copy.errors.notConfigured);
    setError(null);
    setPending("verify");
    const { error } = await supabase.auth.verifyOtp({
      email: sentTo,
      token: code,
      type: "email",
    });
    if (error) {
      setError(authError(error));
      setPending(null);
      return;
    }
    window.location.assign(resolveSameOriginNext(nextPath, window.location.origin));
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
      style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-[880px] overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <button
          type="button"
          aria-label={copy.close}
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
        >
          <CloseGlyph />
        </button>

        <div className="grid sm:grid-cols-2">
          <div
            className="relative hidden min-h-[600px] overflow-hidden sm:block"
            style={{ background: "linear-gradient(160deg, #cdbef5 0%, #e4d6f2 44%, #ffd9c0 100%)" }}
          >
            <Image
              src="/sign-in-call.webp"
              alt=""
              fill
              sizes="440px"
              className="object-contain"
              style={{ objectPosition: "50% 100%", transform: "scale(1.18)", transformOrigin: "50% 100%" }}
            />
          </div>

          <div className="flex flex-col items-center px-8 py-12 text-center sm:px-12 sm:py-14">
            <div className="mb-8 flex justify-center text-neutral-900">
              <BrandMark className="h-9 w-auto" />
            </div>

            {sentTo ? (
              <>
                <h2 id={titleId} className="mb-2 text-2xl font-light uppercase tracking-[0.04em] text-neutral-900">
                  {copy.codeTitle}
                </h2>
                <p className="mb-8 text-[13px] font-light tracking-[0.3px] text-neutral-500">
                  {copy.codeSent.split("{email}")[0]}
                  <span className="font-normal text-neutral-900">{sentTo}</span>
                  {copy.codeSent.split("{email}")[1]}
                </p>

                {error ? <ErrorBox id={errorId} message={error} /> : null}

                <ValidatedForm className="w-full" onSubmit={verifyCode}>
                  <input
                    id="auth-code"
                    name="auth-code"
                    aria-labelledby={titleId}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    required
                    pattern="\d{6}"
                    maxLength={6}
                    data-error-valuemissing={copy.required}
                    data-error-patternmismatch={copy.codePattern}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="••••••"
                    className="mb-3.5 w-full rounded-[10px] border border-neutral-200 bg-white px-3.5 py-3 text-center text-2xl font-light tracking-[0.4em] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                  />
                  <FieldError name="auth-code" className="mb-3.5 text-center" />
                  <ValidatedSubmit
                    disabled={pending !== null || code.length < 6}
                    className="w-full rounded-[10px] bg-neutral-900 px-4 py-3 text-[13px] font-light uppercase tracking-[0.08em] text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    {pending === "verify" ? copy.verifying : copy.verify}
                  </ValidatedSubmit>
                </ValidatedForm>

                <button
                  type="button"
                  onClick={resetState}
                  className="mt-4 text-[11px] uppercase tracking-[0.08em] text-neutral-500 transition-colors hover:text-neutral-900"
                >
                  {copy.differentEmail}
                </button>
              </>
            ) : (
              <>
                <h2 id={titleId} className="mb-2 text-2xl font-light uppercase tracking-[0.04em] text-neutral-900">
                  {copy.welcome}
                </h2>
                <p className="mb-10 text-[13px] font-light tracking-[0.3px] text-neutral-500">
                  {description ?? (mode === "signup" ? copy.signupDescription : copy.defaultDescription)}
                </p>

                {error ? <ErrorBox id={errorId} message={error} /> : null}

                <button
                  type="button"
                  onClick={signInWithGoogle}
                  disabled={pending !== null}
                  className="mb-3 flex w-full items-center justify-center gap-3 rounded-[10px] border border-neutral-200 bg-white px-6 py-3.5 text-sm font-light tracking-[0.2px] text-neutral-900 transition hover:border-neutral-400 disabled:opacity-60"
                >
                  <GoogleGlyph />
                  {pending === "google" ? copy.redirecting : copy.continueGoogle}
                </button>

                <button
                  type="button"
                  onClick={signInWithApple}
                  disabled={pending !== null}
                  className="mb-3 flex w-full items-center justify-center gap-3 rounded-[10px] border border-neutral-200 bg-white px-6 py-3.5 text-sm font-light tracking-[0.2px] text-neutral-900 transition hover:border-neutral-400 disabled:opacity-60"
                >
                  <AppleGlyph />
                  {pending === "apple" ? copy.redirecting : copy.continueApple}
                </button>

                <div className="mb-5 flex w-full items-center gap-3 text-[11px] uppercase tracking-[0.5px] text-neutral-500">
                  <span className="h-px flex-1 bg-neutral-200" />
                  {copy.or}
                  <span className="h-px flex-1 bg-neutral-200" />
                </div>

                <ValidatedForm className="w-full text-left" onSubmit={signInWithEmail}>
                  <Field
                    name="auth-email"
                    label={copy.emailLabel}
                    required
                    labelClassName="mb-1.5 block text-[11px] font-normal uppercase tracking-[0.08em] text-neutral-500"
                  >
                    <input
                      ref={emailRef}
                      id="auth-email"
                      name="auth-email"
                      aria-invalid={error && emailInvalid ? true : undefined}
                      aria-describedby={error && emailInvalid ? errorId : undefined}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-error-valuemissing={copy.required}
                      data-error-typemismatch={copy.emailInvalid}
                      placeholder="you@example.com"
                      className="mb-3.5 w-full rounded-[10px] border border-neutral-200 bg-white px-3.5 py-3 text-base font-light outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                    />
                  </Field>
                  <ValidatedSubmit
                    disabled={pending !== null}
                    className="w-full rounded-[10px] bg-neutral-900 px-4 py-3 text-[13px] font-light uppercase tracking-[0.08em] text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    {pending === "email" ? copy.sendingCode : copy.continueEmail}
                  </ValidatedSubmit>
                </ValidatedForm>

                <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[11px] font-light text-neutral-500">
                  <LockGlyph />
                  <span>{copy.privacy}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ id, message }: { id: string; message: string }) {
  return (
    <div id={id} role="alert" className="mb-4 flex w-full items-start gap-2 rounded-[10px] bg-red-50 px-3 py-2.5 text-left text-[13px] text-red-600">
      <span>{message}</span>
    </div>
  );
}
