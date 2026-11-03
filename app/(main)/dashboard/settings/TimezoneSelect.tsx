"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

import { useT } from "@/lib/i18n/client";

interface Props {
  value: string;
  className: string;
  disabled?: boolean;
  zones: string[];
}

function label(zone: string): string {
  const city = zone.split("/").join(" / ").replace(/_/g, " ");
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "shortOffset" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName");
    return parts ? `${city} (${parts.value})` : city;
  } catch {
    return city;
  }
}

function browserZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    return "";
  }
}

// Nothing to subscribe to: the browser zone and "mounted" do not change after load.
const subscribe = () => () => {};

export function TimezoneSelect({ value, className, disabled, zones }: Props) {
  const t = useT();
  // The browser zone and the clock exist only in the browser. The server and
  // the hydration render use "" and no clock, so the HTML matches (React threw
  // #418 when it did not); React swaps in the real values right after hydration.
  const detected = useSyncExternalStore(subscribe, browserZone, () => "");
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const valid = useMemo(() => new Set(zones), [zones]);
  // null until the user picks a zone, so the detected zone can still apply after hydration.
  const [picked, setPicked] = useState<string | null>(null);
  const selected = picked ?? (valid.has(value) ? value : valid.has(detected) ? detected : "UTC");

  const now = useMemo(() => {
    if (!mounted) return "";
    try {
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: selected,
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());
    } catch {
      return "";
    }
  }, [selected, mounted]);

  const repaired = Boolean(value) && !valid.has(value);

  return (
    <>
      <select
        id="timezone"
        name="timezone"
        value={selected}
        onChange={(e) => setPicked(e.target.value)}
        disabled={disabled}
        className={className}
      >
        {zones.map((z) => (
          <option key={z} value={z}>
            {label(z)}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-neutral-500">
        {repaired ? (
          <span className="text-amber-700">
            {t.settings.tzInvalid.replace("{value}", value)}{" "}
          </span>
        ) : null}
        {now && `${t.settings.tzNow.replace("{time}", now)} `}
        {t.settings.tzUsage}
      </p>
    </>
  );
}
