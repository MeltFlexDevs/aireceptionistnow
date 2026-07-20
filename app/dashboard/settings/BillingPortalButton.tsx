"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/client";

export function BillingPortalButton() {
  const s = useT().settings;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function open() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const body = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !body.url) {
        // The API's own message is operator detail; show one plain sentence.
        setError(s.manageBillingError);
        return;
      }
      window.location.href = body.url;
    } catch {
      setError(s.manageBillingError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={open}
        disabled={loading}
        className="inline-flex h-9 items-center rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 disabled:opacity-60"
      >
        {loading ? s.manageBillingPending : s.manageBilling}
      </button>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
}
