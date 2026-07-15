"use client";

import { useMemo, useState } from "react";

// The timezone field, which drives every timestamp on the dashboard (call log,
// transcripts, calendar, analytics day buckets). It used to be a free-text box:
// "bratislava" is not an IANA zone, so Intl threw, every formatter fell back to
// UTC, and the whole dashboard was quietly hours off with nothing to indicate
// why. So: a real list, and the browser's own zone detected as the default -
// nobody should have to know they live in "Europe/Bratislava".

interface Props {
  /** Stored value; may be blank or (historically) invalid. */
  value: string;
  className: string;
  disabled?: boolean;
  zones: string[];
}

/** "Europe/Bratislava" → "Europe / Bratislava (UTC+02:00)" */
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

export function TimezoneSelect({ value, className, disabled, zones }: Props) {
  // Detect once on the client. Runs during the first render rather than in an
  // effect so the correct zone is selected on paint, not after a flash of UTC.
  const [detected] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    } catch {
      return "";
    }
  });

  const valid = useMemo(() => new Set(zones), [zones]);
  // A stored value we can't honour is the same as having none - fall back to the
  // browser's zone so the field shows what the dashboard will actually use.
  const initial = valid.has(value) ? value : valid.has(detected) ? detected : "UTC";
  const [selected, setSelected] = useState(initial);

  const now = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: selected,
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());
    } catch {
      return "";
    }
  }, [selected]);

  const repaired = Boolean(value) && !valid.has(value);

  return (
    <>
      <select
        id="timezone"
        name="timezone"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        disabled={disabled}
        className={className}
      >
        {zones.map((z) => (
          <option key={z} value={z}>
            {label(z)}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-neutral-400">
        {repaired ? (
          <span className="text-amber-600">
            &quot;{value}&quot; isn&apos;t a valid time zone, so times were showing in UTC. Save to
            fix them.{" "}
          </span>
        ) : null}
        {now && `It's ${now} there now.`} Used for call times, your calendar, and analytics.
      </p>
    </>
  );
}
