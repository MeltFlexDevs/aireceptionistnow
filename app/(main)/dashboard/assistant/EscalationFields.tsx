"use client";

import { useState } from "react";

import type { EscalationConfig } from "@/lib/call-engine/escalation";
import { MAX_TARGETS } from "@/lib/call-engine/escalation";
import { TransferHoursFields, type TransferHoursLabels } from "./TransferHoursFields";

/**
 * Where a caller goes when they need a person.
 *
 * ROWS ARE KEYED, NOT NUMBERED. Every field in a destination is named after that
 * row's key (`esc_<key>_number`, `esc_<key>_day_3`, ...) and the submitted
 * `esc_keys` list says which rows exist. Numbering them by position would mean
 * that deleting the second of four destinations renames every field below it,
 * and each of those rows carries a whole uncontrolled weekly schedule that would
 * then submit under a name belonging to a different destination. Keys make
 * removal a pure list operation. buildAssistantPatch reads the same convention.
 *
 * Keys are generated here and validated server-side against /^[a-z0-9]{1,16}$/,
 * because they are interpolated straight into form-field lookups.
 */

export interface EscalationLabels {
  destinations: string;
  destinationsSub: string;
  add: string;
  remove: string;
  name: string;
  namePlaceholder: string;
  number: string;
  when: string;
  whenPlaceholder: string;
  handoff: string;
  handoffDefault: string;
  handoffWarm: string;
  handoffCold: string;
  empty: string;
  triggers: string;
  triggersSub: string;
  triggersPlaceholder: string;
  sla: string;
  slaSub: string;
  page: string;
  pageSub: string;
  pageNumber: string;
  pageNumberSub: string;
}

const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900";
const labelCls = "mb-1.5 block text-xs font-medium text-neutral-600";
const toggle =
  "relative h-5 w-9 shrink-0 rounded-full bg-neutral-200 transition-colors peer-checked:bg-neutral-900 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-4";

interface Row {
  key: string;
  label: string;
  number: string;
  when: string;
  warm: "" | "warm" | "cold";
  hours: EscalationConfig["targets"][number]["hours"];
}

function rowsFrom(cfg: EscalationConfig): Row[] {
  return cfg.targets.map((t, i) => ({
    // Stored ids came from this editor, but a legacy synthesized target is
    // "legacy" and older rows may be "t0" - neither matches the key shape the
    // server accepts, so re-key on load. The key only has to be stable for the
    // lifetime of this form.
    key: `r${i}`,
    label: t.label === "our team" ? "" : t.label,
    number: t.number,
    when: t.when,
    warm: t.warm === true ? "warm" : t.warm === false ? "cold" : "",
    hours: t.hours,
  }));
}

export function EscalationFields({
  escalation,
  fallbackTimezone,
  labels,
  hoursLabels,
}: {
  escalation: EscalationConfig;
  fallbackTimezone: string;
  labels: EscalationLabels;
  hoursLabels: TransferHoursLabels;
}) {
  const [rows, setRows] = useState<Row[]>(() => rowsFrom(escalation));
  const [nextKey, setNextKey] = useState(() => rows.length);
  const [paging, setPaging] = useState(escalation.page.enabled);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { key: `r${nextKey}`, label: "", number: "", when: "", warm: "", hours: null },
    ]);
    setNextKey((n) => n + 1);
  };

  return (
    <div className="space-y-4">
      {/* The guard field. Always submitted - an empty value is what tells the
          patch layer the operator removed every destination, as opposed to a
          form that never carried them. */}
      <input type="hidden" name="esc_keys" value={rows.map((r) => r.key).join(",")} />

      <div>
        <span className={labelCls}>{labels.destinations}</span>
        <p className="mb-2 text-xs text-neutral-400">{labels.destinationsSub}</p>

        {rows.length === 0 && <p className="text-sm text-neutral-500">{labels.empty}</p>}

        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.key}
              className="space-y-3 rounded-xl border border-neutral-200/70 bg-white/60 p-3"
            >
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <label className={labelCls} htmlFor={`esc_${row.key}_label`}>
                    {labels.name}
                  </label>
                  <input
                    id={`esc_${row.key}_label`}
                    name={`esc_${row.key}_label`}
                    defaultValue={row.label}
                    placeholder={labels.namePlaceholder}
                    className={field}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <label className={labelCls} htmlFor={`esc_${row.key}_number`}>
                    {labels.number}
                  </label>
                  <input
                    id={`esc_${row.key}_number`}
                    name={`esc_${row.key}_number`}
                    defaultValue={row.number}
                    placeholder="+1 415 555 0199"
                    inputMode="tel"
                    className={field}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                  aria-label={labels.remove}
                  title={labels.remove}
                  className="mt-6 h-9 shrink-0 rounded-lg px-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <div>
                <label className={labelCls} htmlFor={`esc_${row.key}_when`}>
                  {labels.when}
                </label>
                <input
                  id={`esc_${row.key}_when`}
                  name={`esc_${row.key}_when`}
                  defaultValue={row.when}
                  placeholder={labels.whenPlaceholder}
                  className={field}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor={`esc_${row.key}_warm`}>
                  {labels.handoff}
                </label>
                <select
                  id={`esc_${row.key}_warm`}
                  name={`esc_${row.key}_warm`}
                  defaultValue={row.warm}
                  className={field}
                >
                  <option value="">{labels.handoffDefault}</option>
                  <option value="warm">{labels.handoffWarm}</option>
                  <option value="cold">{labels.handoffCold}</option>
                </select>
              </div>

              <TransferHoursFields
                hours={row.hours}
                fallbackTimezone={fallbackTimezone}
                labels={hoursLabels}
                names={{
                  tz: `esc_${row.key}_tz`,
                  day: (d) => `esc_${row.key}_day_${d}`,
                  start: (d) => `esc_${row.key}_start_${d}`,
                  end: (d) => `esc_${row.key}_end_${d}`,
                }}
              />
            </div>
          ))}
        </div>

        {rows.length < MAX_TARGETS && (
          <button
            type="button"
            onClick={addRow}
            className="press mt-3 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400"
          >
            + {labels.add}
          </button>
        )}
      </div>

      <div className="border-t border-neutral-100 pt-4">
        <label className={labelCls} htmlFor="esc_triggers">
          {labels.triggers}
        </label>
        <p className="mb-1.5 text-xs text-neutral-400">{labels.triggersSub}</p>
        <textarea
          id="esc_triggers"
          name="esc_triggers"
          rows={3}
          defaultValue={escalation.triggers.join("\n")}
          placeholder={labels.triggersPlaceholder}
          className={`${field} resize-y`}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="esc_sla">
          {labels.sla}
        </label>
        <input
          id="esc_sla"
          name="esc_sla"
          type="number"
          min={5}
          max={1440}
          defaultValue={escalation.callbackSlaMinutes ?? ""}
          className={field}
        />
        <p className="mt-1.5 text-xs text-neutral-400">{labels.slaSub}</p>
      </div>

      <div className="space-y-3 border-t border-neutral-100 pt-4">
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-neutral-200/70 bg-white/60 px-4 py-3 transition-colors hover:border-neutral-300">
          <span>
            <span className="block text-sm font-medium text-neutral-800">{labels.page}</span>
            <span className="block text-xs text-neutral-400">{labels.pageSub}</span>
          </span>
          <input
            type="checkbox"
            name="esc_page"
            checked={paging}
            onChange={(e) => setPaging(e.target.checked)}
            className="peer sr-only"
          />
          <span className={toggle} />
        </label>
        {paging && (
          <div>
            <label className={labelCls} htmlFor="esc_page_number">
              {labels.pageNumber}
            </label>
            <input
              id="esc_page_number"
              name="esc_page_number"
              defaultValue={escalation.page.number}
              placeholder="+1 415 555 0199"
              inputMode="tel"
              className={field}
            />
            <p className="mt-1.5 text-xs text-neutral-400">{labels.pageNumberSub}</p>
          </div>
        )}
      </div>
    </div>
  );
}
