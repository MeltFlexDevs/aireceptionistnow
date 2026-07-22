"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Captures the browser timezone into a `tz` cookie so the dashboard can show
 * times in the viewer's local zone when they have not set an account timezone
 * (see displayTimezone). Refreshes once when the cookie is missing or stale so
 * the server re-renders with the right zone. Renders nothing.
 */
export function TimezoneSync() {
  const router = useRouter();
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return;
    const want = encodeURIComponent(tz);
    const current = document.cookie
      .split("; ")
      .find((c) => c.startsWith("tz="))
      ?.slice("tz=".length);
    if (current === want) return;
    document.cookie = `tz=${want}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);
  return null;
}
