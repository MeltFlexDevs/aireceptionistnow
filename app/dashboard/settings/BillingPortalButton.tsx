"use client";

import { useState } from "react";

// Opens the Stripe Customer Portal (update card, change plan, cancel). Posts to
// the billing-portal route and follows the returned URL.
export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function open() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const body = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !body.url) {
        setError(body.error ?? "Could not open billing.");
        return;
      }
      window.location.href = body.url;
    } catch {
      setError("Could not open billing.");
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
        {loading ? "Opening…" : "Manage billing"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
