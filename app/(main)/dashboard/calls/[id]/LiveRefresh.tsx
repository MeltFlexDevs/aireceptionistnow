"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Calls in progress keep streaming transcript turns; refresh while live.
export function LiveRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
