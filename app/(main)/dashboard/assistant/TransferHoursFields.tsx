"use client";

import { useState } from "react";

import type { TransferHours } from "@/lib/call-engine/transfer-hours";

/**
 * The weekly window during which the receptionist may hand a caller to a human.
 *
 * Field names match what buildAssistantPatch reads: transfer_hours_tz, and per
 * day transfer_day_<i> / transfer_start_<i> / transfer_end_<i>, where i is the
 * JS weekday (0 = Sunday). The day checkbox is the source of truth - the time
 * inputs stay mounted and populated when a day is switched off, so the patch
 * layer ignores them unless the checkbox is on.
 *
 * Client component only because switching a day off should visibly disable its
 * times. Everything else is plain uncontrolled form state, which is what the
 * surrounding TopicModal submits.
 */

export interface TransferHoursLabels {
  scheduleTitle: string;
  scheduleSub: string;
  alwaysLabel: string;
  scheduledLabel: string;
  timezoneLabel: string;
  fromLabel: string;
  toLabel: string;
  closedNote: string;
  days: string[]; // 7 entries, Sunday first
}

const DEFAULT_WINDOW = { start: "09:00", end: "17:00" };
// Monday first: the schedule reads as a working week, even though the array is
// indexed Sunday-first to match Date.prototype.getDay().
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function TransferHoursFields({
  hours,
  fallbackTimezone,
  labels,
}: {
  hours: TransferHours | null;
  /** Account timezone, used when no schedule has been saved yet. */
  fallbackTimezone: string;
  labels: TransferHoursLabels;
}) {
  const [enabled, setEnabled] = useState(hours !== null);
  const [openDays, setOpenDays] = useState<boolean[]>(() =>
    Array.from({ length: 7 }, (_, i) => hours?.days[i] != null),
  );

  const timezone = hours?.timezone || fallbackTimezone || "UTC";

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-neutral-200/70 bg-white/60 px-4 py-3 transition-colors hover:border-neutral-300">
        <span>
          <span className="block text-sm font-medium text-neutral-800">
            {labels.scheduleTitle}
          </span>
          <span className="block text-xs text-neutral-400">{labels.scheduleSub}</span>
        </span>
        <span className="shrink-0 text-xs font-medium text-neutral-500">
          {enabled ? labels.scheduledLabel : labels.alwaysLabel}
        </span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="peer sr-only"
        />
        <span className="relative h-5 w-9 shrink-0 rounded-full bg-neutral-200 transition-colors after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-neutral-900 peer-checked:after:translate-x-4" />
      </label>

      {/* Always submitted. Blank when the schedule is off, which is what makes
          buildAssistantPatch delete a previously saved schedule. */}
      <input type="hidden" name="transfer_hours_tz" value={enabled ? timezone : ""} />

      {enabled && (
        <div className="space-y-2 rounded-lg border border-neutral-200/70 bg-white/60 p-3">
          <div className="flex items-center justify-between gap-3 pb-1">
            <span className="text-xs font-medium text-neutral-500">
              {labels.timezoneLabel}
            </span>
            <span className="text-xs text-neutral-700">{timezone}</span>
          </div>

          {DISPLAY_ORDER.map((day) => {
            const on = openDays[day];
            const win = hours?.days[day] ?? DEFAULT_WINDOW;
            return (
              <div key={day} className="flex items-center gap-2">
                <label className="flex w-28 shrink-0 cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name={`transfer_day_${day}`}
                    checked={on}
                    onChange={(e) =>
                      setOpenDays((prev) => {
                        const next = [...prev];
                        next[day] = e.target.checked;
                        return next;
                      })
                    }
                    className="h-4 w-4 shrink-0 rounded border-neutral-300 accent-neutral-900"
                  />
                  <span className="text-sm text-neutral-700">{labels.days[day]}</span>
                </label>

                <input
                  type="time"
                  name={`transfer_start_${day}`}
                  defaultValue={win.start}
                  disabled={!on}
                  aria-label={`${labels.days[day]} ${labels.fromLabel}`}
                  className="w-28 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 disabled:bg-neutral-50 disabled:text-neutral-300"
                />
                <span className="text-xs text-neutral-400">{labels.toLabel}</span>
                <input
                  type="time"
                  name={`transfer_end_${day}`}
                  defaultValue={win.end}
                  disabled={!on}
                  aria-label={`${labels.days[day]} ${labels.toLabel}`}
                  className="w-28 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 disabled:bg-neutral-50 disabled:text-neutral-300"
                />
              </div>
            );
          })}

          <p className="pt-1 text-xs text-neutral-400">{labels.closedNote}</p>
        </div>
      )}
    </div>
  );
}
