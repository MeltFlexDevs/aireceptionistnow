"use client";

import { useState } from "react";
import Image from "next/image";

import { useAuthDialog } from "@/app/components/AuthDialog";
import { startCheckout } from "@/lib/billing-client";

// The plan a generic "Start now" sends a signed-in user to pay for.
const DEFAULT_PLAN = "team";
const DEFAULT_CYCLE = "monthly" as const;

const FONT = "var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, sans-serif";

// Type-only import: no content module is pulled into the client bundle, the
// localized page passes the four strings down as plain props.
type CtaCopy = import("@/content/i18n/_blog-copy").BlogCopy["cta"];

const EN_CTA: CtaCopy = {
  headline: "Never miss a call again",
  body: "An AI receptionist that answers 24/7, books appointments, and texts you the summary. Live in 10 minutes.",
  button: "Start now",
  busy: "Starting…",
};

export function BlogCtaCard({ copy = EN_CTA }: { copy?: CtaCopy }) {
  const { open } = useAuthDialog();
  const [busy, setBusy] = useState(false);

  const handleStart = async () => {
    setBusy(true);
    try {
      // Supabase is loaded only when a reader actually clicks Start, keeping it
      // out of the blog-route bundle.
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const session = supabase
        ? (await supabase.auth.getSession()).data.session
        : null;
      if (session) {
        // Already signed in → straight to the payment gateway.
        await startCheckout(DEFAULT_PLAN, DEFAULT_CYCLE);
        return; // browser navigates to Stripe on success
      }
      // Not signed in → same as clicking START NOW in the header.
      open("signup");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-8 overflow-hidden rounded-2xl bg-[#1D1D1D]" style={{ fontFamily: FONT }}>
      <div
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={{ background: "linear-gradient(160deg, #cdbef5 0%, #e4d6f2 44%, #ffd9c0 100%)" }}
      >
        <Image
          src="/sign-in-call.webp"
          alt="A live phone call answered on an iPhone"
          fill
          sizes="320px"
          className="object-contain"
          style={{ objectPosition: "50% 100%", transform: "scale(1.12)", transformOrigin: "50% 100%" }}
        />
      </div>
      <div className="px-6 py-8 text-center">
        <p className="text-[15px] leading-[1.35] font-semibold tracking-[0.04em] text-white uppercase" style={{ fontFamily: FONT }}>
          {copy.headline}
        </p>
        <p className="mt-3 text-[13px] leading-[1.6] font-light text-white/55" style={{ fontFamily: FONT }}>
          {copy.body}
        </p>
        <button
          type="button"
          onClick={handleStart}
          disabled={busy}
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white px-6 py-2.5 text-[12px] font-medium tracking-[0.08em] text-[#1D1D1D] uppercase transition-colors hover:bg-white/90 disabled:opacity-70"
          style={{ fontFamily: FONT }}
        >
          {busy ? (
            copy.busy
          ) : (
            <>
              {copy.button} <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
