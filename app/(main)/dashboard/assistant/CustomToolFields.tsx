"use client";

import { useState } from "react";

import { MAX_CUSTOM_TOOLS, formatParamLines, type CustomTool } from "@/lib/call-engine/agent/custom-tools";

/**
 * The business's own actions: look up an order, check stock, quote a price.
 *
 * Rows are keyed exactly as in EscalationFields, and for the same reason -
 * removing a row must not rename the fields of the rows below it. See the note
 * there; buildAssistantPatch reads the same `ct_keys` convention.
 *
 * The auth header VALUE is write-only. It is never sent back down from the
 * server (only the workspace-secret id is stored at all), so the input renders
 * empty on every load and an empty submit means "keep what is saved". Showing a
 * masked placeholder that silently means "unchanged" is the only honest way to
 * render a credential you cannot read back.
 */

export interface CustomToolLabels {
  intro: string;
  empty: string;
  add: string;
  remove: string;
  name: string;
  nameHint: string;
  description: string;
  descriptionHint: string;
  url: string;
  method: string;
  params: string;
  paramsHint: string;
  paramsPlaceholder: string;
  timeout: string;
  timeoutHint: string;
  authHeader: string;
  authValue: string;
  authValueSaved: string;
  authValueHint: string;
  enabled: string;
}

const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900";
const labelCls = "mb-1.5 block text-xs font-medium text-neutral-600";

interface Row {
  key: string;
  tool: CustomTool | null;
}

export function CustomToolFields({
  tools,
  labels,
}: {
  tools: CustomTool[];
  labels: CustomToolLabels;
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    tools.map((tool, i) => ({ key: `c${i}`, tool })),
  );
  const [nextKey, setNextKey] = useState(() => tools.length);

  const addRow = () => {
    setRows((prev) => [...prev, { key: `c${nextKey}`, tool: null }]);
    setNextKey((n) => n + 1);
  };

  return (
    <div className="space-y-4">
      {/* Always submitted; an empty value is how the patch layer learns every
          action was removed. */}
      <input type="hidden" name="ct_keys" value={rows.map((r) => r.key).join(",")} />

      <p className="text-xs text-neutral-400">{labels.intro}</p>
      {rows.length === 0 && <p className="text-sm text-neutral-500">{labels.empty}</p>}

      <div className="space-y-3">
        {rows.map(({ key, tool }) => (
          <div key={key} className="space-y-3 rounded-xl border border-neutral-200/70 bg-white/60 p-3">
            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <label className={labelCls} htmlFor={`ct_${key}_name`}>
                  {labels.name}
                </label>
                <input
                  id={`ct_${key}_name`}
                  name={`ct_${key}_name`}
                  defaultValue={tool?.name ?? ""}
                  placeholder="check_order_status"
                  className={field}
                />
                <p className="mt-1 text-xs text-neutral-400">{labels.nameHint}</p>
              </div>
              <button
                type="button"
                onClick={() => setRows((prev) => prev.filter((r) => r.key !== key))}
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
              <label className={labelCls} htmlFor={`ct_${key}_description`}>
                {labels.description}
              </label>
              <textarea
                id={`ct_${key}_description`}
                name={`ct_${key}_description`}
                rows={2}
                defaultValue={tool?.description ?? ""}
                className={`${field} resize-y`}
              />
              <p className="mt-1 text-xs text-neutral-400">{labels.descriptionHint}</p>
            </div>

            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <label className={labelCls} htmlFor={`ct_${key}_url`}>
                  {labels.url}
                </label>
                <input
                  id={`ct_${key}_url`}
                  name={`ct_${key}_url`}
                  defaultValue={tool?.url ?? ""}
                  placeholder="https://api.yourbusiness.com/orders"
                  inputMode="url"
                  className={field}
                />
              </div>
              <div className="w-28 shrink-0">
                <label className={labelCls} htmlFor={`ct_${key}_method`}>
                  {labels.method}
                </label>
                <select
                  id={`ct_${key}_method`}
                  name={`ct_${key}_method`}
                  defaultValue={tool?.method ?? "POST"}
                  className={field}
                >
                  <option value="POST">POST</option>
                  <option value="GET">GET</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls} htmlFor={`ct_${key}_params`}>
                {labels.params}
              </label>
              <textarea
                id={`ct_${key}_params`}
                name={`ct_${key}_params`}
                rows={3}
                defaultValue={tool ? formatParamLines(tool.params) : ""}
                placeholder={labels.paramsPlaceholder}
                className={`${field} resize-y font-mono text-xs`}
              />
              <p className="mt-1 text-xs text-neutral-400">{labels.paramsHint}</p>
            </div>

            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <label className={labelCls} htmlFor={`ct_${key}_auth_header`}>
                  {labels.authHeader}
                </label>
                <input
                  id={`ct_${key}_auth_header`}
                  name={`ct_${key}_auth_header`}
                  defaultValue={tool?.authHeader ?? ""}
                  placeholder="Authorization"
                  className={field}
                />
              </div>
              <div className="min-w-0 flex-1">
                <label className={labelCls} htmlFor={`ct_${key}_auth_value`}>
                  {labels.authValue}
                </label>
                <input
                  id={`ct_${key}_auth_value`}
                  name={`ct_${key}_auth_value`}
                  type="password"
                  autoComplete="off"
                  placeholder={tool?.authSecretId ? labels.authValueSaved : ""}
                  className={field}
                />
              </div>
            </div>
            <p className="text-xs text-neutral-400">{labels.authValueHint}</p>

            <div className="w-32">
              <label className={labelCls} htmlFor={`ct_${key}_timeout`}>
                {labels.timeout}
              </label>
              <input
                id={`ct_${key}_timeout`}
                name={`ct_${key}_timeout`}
                type="number"
                min={1}
                max={20}
                defaultValue={tool?.timeoutSecs ?? 8}
                className={field}
              />
            </div>
            <p className="text-xs text-neutral-400">{labels.timeoutHint}</p>
          </div>
        ))}
      </div>

      {rows.length < MAX_CUSTOM_TOOLS && (
        <button
          type="button"
          onClick={addRow}
          className="press rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400"
        >
          + {labels.add}
        </button>
      )}
    </div>
  );
}
