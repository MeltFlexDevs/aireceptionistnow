"use client";

import { useState } from "react";
import Image from "next/image";

import { useAuthDialog } from "../../components/AuthDialog";
import { createClient } from "@/lib/supabase/client";
import { startCheckout } from "@/lib/billing-client";

// The plan a generic "Start now" sends a signed-in user to pay for.
const DEFAULT_PLAN = "team";
const DEFAULT_CYCLE = "monthly" as const;

const FONT = "var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, sans-serif";

export function BlogCtaCard() {
  const { open } = useAuthDialog();
  const [busy, setBusy] = useState(false);

  const handleStart = async () => {
    setBusy(true);
    try {
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
    <div className="mt-8 overflow-hidden rounded-2xl bg-[#111]" style={{ fontFamily: FONT }}>
      {/* Image banner on the landing "voice" palette — same call image as the sign-in screen */}
      <div
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={{ background: "linear-gradient(160deg, #cdbef5 0%, #e4d6f2 44%, #ffd9c0 100%)" }}
      >
        <Image
          src="/sign-in-call.png"
          alt=""
          fill
          sizes="320px"
          className="object-contain"
          style={{ objectPosition: "50% 100%", transform: "scale(1.12)", transformOrigin: "50% 100%" }}
        />
      </div>
      <div className="px-6 py-8 text-center">
        <p className="text-[15px] leading-[1.35] font-semibold tracking-[0.04em] text-white uppercase" style={{ fontFamily: FONT }}>
          Never miss a call again
        </p>
        <p className="mt-3 text-[13px] leading-[1.6] font-light text-white/55" style={{ fontFamily: FONT }}>
          An AI receptionist that answers 24/7, books appointments, and texts
          you the summary. Live in 10 minutes.
        </p>
        <button
          type="button"
          onClick={handleStart}
          disabled={busy}
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white px-6 py-2.5 text-[12px] font-medium tracking-[0.08em] text-[#1a1a1a] uppercase transition-colors hover:bg-white/90 disabled:opacity-70"
          style={{ fontFamily: FONT }}
        >
          {busy ? "Starting…" : <>Start now <span aria-hidden="true">→</span></>}
        </button>
      </div>
    </div>
  );
}
