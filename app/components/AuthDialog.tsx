"use client";

import * as React from "react";

import { createClient } from "@/lib/supabase/client";

type AuthMode = "signup" | "login";

type AuthDialogContextValue = {
  open: (mode?: AuthMode, opts?: { description?: string; next?: string }) => void;
  close: () => void;
};

const AuthDialogContext = React.createContext<AuthDialogContextValue | null>(null);

export function useAuthDialog() {
  const ctx = React.useContext(AuthDialogContext);
  if (!ctx) {
    throw new Error("useAuthDialog must be used within <AuthDialogProvider>");
  }
  return ctx;
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type Pending = "google" | "email" | "verify" | null;

const fieldStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #e5e5e5",
  borderRadius: "10px",
  padding: "12px 14px",
  fontSize: "15px",
  fontWeight: 300,
  outline: "none",
  background: "#fff",
  color: "#111",
};

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  borderRadius: "10px",
  padding: "13px 16px",
  background: "#000",
  color: "#fff",
  fontSize: "12px",
  fontWeight: 400,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const oauthBtnStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  border: "1px solid #e5e5e5",
  borderRadius: "10px",
  padding: "12px 16px",
  background: "#fff",
  color: "#111",
  fontSize: "14px",
  fontWeight: 300,
  cursor: "pointer",
};

export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = React.useState(() => createClient());
  const [isOpen, setIsOpen] = React.useState(false);

  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [pending, setPending] = React.useState<Pending>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const [description, setDescription] = React.useState<string | null>(null);
  const [nextPath, setNextPath] = React.useState("/dashboard");

  const resetState = React.useCallback(() => {
    setPending(null);
    setError(null);
    setSentTo(null);
    setCode("");
  }, []);

  const open = React.useCallback<AuthDialogContextValue["open"]>(
    (_mode, opts) => {
      resetState();
      setDescription(opts?.description ?? null);
      setNextPath(opts?.next ?? "/dashboard");
      setIsOpen(true);
    },
    [resetState],
  );
  const close = React.useCallback(() => setIsOpen(false), []);

  const value = React.useMemo(() => ({ open, close }), [open, close]);

  // Open automatically when redirected here with `?auth=login` (e.g. the proxy
  // bouncing an unauthenticated visitor away from /dashboard).
  React.useEffect(() => {
    const openFromUrl =
      new URLSearchParams(window.location.search).get("auth") === "login";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (openFromUrl) open("login");
  }, [open]);

  // Lock body scroll + close on Escape while open.
  React.useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  async function signInWithGoogle() {
    setError(null);
    setPending("google");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
    // On success the browser navigates to Google; we only land here on error.
    if (error) {
      setError(error.message);
      setPending(null);
    }
  }

  async function signInWithEmail(event: React.FormEvent) {
    event.preventDefault();
    if (!email) return;
    setError(null);
    setPending("email");
    // Send a 6-digit code (email template must include {{ .Token }}).
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setPending(null);
    if (error) setError(error.message);
    else {
      setCode("");
      setSentTo(email);
    }
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault();
    if (!sentTo || code.length < 6) return;
    setError(null);
    setPending("verify");
    const { error } = await supabase.auth.verifyOtp({
      email: sentTo,
      token: code,
      type: "email",
    });
    if (error) {
      setError(error.message);
      setPending(null);
      return;
    }
    // A full navigation lets the server read the new session cookies and drop
    // us into the workspace.
    window.location.assign(nextPath);
  }

  return (
    <AuthDialogContext.Provider value={value}>
      {children}
      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
            fontFamily: "var(--font-inter), Inter, sans-serif",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "400px",
              background: "#fff",
              borderRadius: "18px",
              padding: "40px 32px 28px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
              textAlign: "center",
            }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setIsOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "28px",
                height: "28px",
                border: "none",
                background: "transparent",
                color: "#999",
                fontSize: "20px",
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              ×
            </button>

            {/* Brand */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                marginBottom: "22px",
              }}
            >
              <svg width="7" height="15" viewBox="0 0 7 15" fill="none">
                <rect x="0" y="0" width="2.5" height="15" rx="1" fill="#000" />
                <rect x="4.5" y="0" width="2.5" height="15" rx="1" fill="#000" />
              </svg>
              <span style={{ fontWeight: 500, fontSize: "16px", letterSpacing: "-0.02em" }}>
                AI RECEPTIONIST
              </span>
            </div>

            {sentTo ? (
              <>
                <h2 style={{ margin: "0 0 8px", fontSize: "22px", fontWeight: 300, letterSpacing: "0.02em", textTransform: "uppercase" }}>
                  Enter your code
                </h2>
                <p style={{ margin: "0 0 26px", fontSize: "13px", color: "#666", fontWeight: 300 }}>
                  We sent a 6-digit code to{" "}
                  <span style={{ color: "#111", fontWeight: 400 }}>{sentTo}</span>.
                </p>

                {error ? <ErrorBox message={error} /> : null}

                <form onSubmit={verifyCode}>
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    maxLength={6}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="••••••"
                    style={{
                      ...fieldStyle,
                      marginBottom: "14px",
                      textAlign: "center",
                      fontSize: "24px",
                      letterSpacing: "0.4em",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={pending !== null || code.length < 6}
                    style={{ ...primaryBtnStyle, opacity: pending !== null || code.length < 6 ? 0.6 : 1 }}
                  >
                    {pending === "verify" ? "Verifying…" : "Verify & continue"}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={resetState}
                  style={{
                    marginTop: "16px",
                    border: "none",
                    background: "transparent",
                    color: "#888",
                    fontSize: "11px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Use a different email
                </button>
              </>
            ) : (
              <>
                <h2 style={{ margin: "0 0 8px", fontSize: "22px", fontWeight: 300, letterSpacing: "0.02em", textTransform: "uppercase" }}>
                  Welcome
                </h2>
                <p style={{ margin: "0 0 28px", fontSize: "13px", color: "#666", fontWeight: 300 }}>
                  {description ?? "Sign in to manage your AI receptionist"}
                </p>

                {error ? <ErrorBox message={error} /> : null}

                <button
                  type="button"
                  onClick={signInWithGoogle}
                  disabled={pending !== null}
                  style={{ ...oauthBtnStyle, marginBottom: "20px", opacity: pending !== null ? 0.6 : 1 }}
                >
                  <GoogleGlyph />
                  {pending === "google" ? "Redirecting…" : "Continue with Google"}
                </button>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    margin: "0 0 20px",
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    color: "#999",
                    textTransform: "uppercase",
                  }}
                >
                  <span style={{ flex: 1, height: "1px", background: "#eee" }} />
                  or
                  <span style={{ flex: 1, height: "1px", background: "#eee" }} />
                </div>

                <form onSubmit={signInWithEmail} style={{ textAlign: "left" }}>
                  <label
                    htmlFor="auth-email"
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "11px",
                      letterSpacing: "0.08em",
                      color: "#888",
                      textTransform: "uppercase",
                    }}
                  >
                    Email
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{ ...fieldStyle, marginBottom: "14px" }}
                  />
                  <button
                    type="submit"
                    disabled={pending !== null}
                    style={{ ...primaryBtnStyle, opacity: pending !== null ? 0.6 : 1 }}
                  >
                    {pending === "email" ? "Sending code…" : "Continue with email"}
                  </button>
                </form>

                <p style={{ marginTop: "16px", fontSize: "11px", color: "#999", fontWeight: 300 }}>
                  Your data is safe, secure and fully private.
                </p>
              </>
            )}
          </div>
        </div>
      ) : null}
    </AuthDialogContext.Provider>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      style={{
        marginBottom: "16px",
        borderRadius: "10px",
        background: "rgba(220,38,38,0.08)",
        color: "#dc2626",
        padding: "10px 12px",
        fontSize: "13px",
        textAlign: "left",
      }}
    >
      {message}
    </div>
  );
}

export type { AuthMode };
