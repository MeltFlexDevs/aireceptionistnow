"use client";

import * as React from "react";
import dynamic from "next/dynamic";

import { sameOriginNextPath } from "@/lib/safe-redirect";
import type { UiCopy } from "@/content/i18n/_ui-copy";

// Lean provider: owns only open/close state and the description/next passed to
// the modal. It imports NO Supabase code, so @supabase/supabase-js stays out of
// the shared marketing bundle that this provider (via app/_shared/root-shell)
// wraps around every page. The heavy modal + Supabase client live in
// AuthDialogBody, loaded on demand the first time the dialog opens.
const AuthDialogBody = dynamic(() => import("./AuthDialogBody"), { ssr: false });

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

// `copy` is only the small auth block of the page locale's UiCopy (picked in
// app/_shared/root-shell.tsx), so the dialog text is localized without
// serializing the whole UI copy.
export function AuthDialogProvider({ copy, children }: { copy: UiCopy["auth"]; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [description, setDescription] = React.useState<string | null>(null);
  const [nextPath, setNextPath] = React.useState("/dashboard");
  const [mode, setMode] = React.useState<AuthMode>("login");

  const open = React.useCallback<AuthDialogContextValue["open"]>((nextMode, opts) => {
    setMode(nextMode ?? "login");
    setDescription(opts?.description ?? null);
    // `next` can come from the page URL (?next=), so keep only a same-origin path.
    setNextPath(sameOriginNextPath(opts?.next));
    setIsOpen(true);
  }, []);
  const close = React.useCallback(() => setIsOpen(false), []);

  const value = React.useMemo(() => ({ open, close }), [open, close]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openFromUrl = params.get("auth") === "login";
    const next = params.get("next");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (openFromUrl) open("login", next ? { next } : undefined);
  }, [open]);

  return (
    <AuthDialogContext.Provider value={value}>
      {children}
      {isOpen ? (
        <AuthDialogBody
          copy={copy}
          mode={mode}
          description={description}
          nextPath={nextPath}
          onClose={close}
        />
      ) : null}
    </AuthDialogContext.Provider>
  );
}

export type { AuthMode };
