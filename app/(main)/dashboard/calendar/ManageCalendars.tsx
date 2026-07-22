"use client";

import { useActionState, useState } from "react";
import { useT } from "@/lib/i18n/client";
import { IDLE, type ActionState } from "@/lib/dashboard/action-state";
import { SavePill } from "../components/SavePill";
import { SubmitButton } from "../components/SubmitButton";
import { ProviderIcon } from "../components/ProviderIcon";
import { setPrimaryCalendarAction, disconnectCalendarAction } from "./actions";

export interface CalendarRow {
  id: string;
  provider: string;
  name: string;
  account: string;
  isPrimary: boolean;
  needsReconnect: boolean;
}

export interface ConnectableProvider {
  id: string;
  name: string;
  href: string;
}

function RowActions({ row, showPrimary }: { row: CalendarRow; showPrimary: boolean }) {
  const t = useT();
  const c = t.calendar;
  const [primaryState, primaryAction] = useActionState<ActionState, FormData>(
    setPrimaryCalendarAction,
    IDLE,
  );
  const [dropState, dropAction] = useActionState<ActionState, FormData>(
    disconnectCalendarAction,
    IDLE,
  );
  // Disconnecting is destructive and irreversible from here, so it takes two
  // clicks rather than a confirm() the browser can suppress.
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <SavePill state={primaryState.ok !== null ? primaryState : dropState} />

      {showPrimary && !row.isPrimary && (
        <form action={primaryAction}>
          <input type="hidden" name="id" value={row.id} />
          <SubmitButton variant="secondary" className="h-8 px-2.5 text-xs">
            {c.setPrimary}
          </SubmitButton>
        </form>
      )}

      {confirming ? (
        <form action={dropAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={row.id} />
          <span className="text-xs text-neutral-500">{c.disconnectConfirm}</span>
          <SubmitButton variant="danger" className="h-8 px-2.5 text-xs">
            {t.common.disconnect}
          </SubmitButton>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="press h-8 rounded-lg px-2 text-xs font-medium text-neutral-500 hover:text-neutral-900"
          >
            {t.common.cancel}
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="press h-8 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-600 hover:text-neutral-900"
        >
          {t.common.disconnect}
        </button>
      )}
    </div>
  );
}

/**
 * One-topic self-saving modal: everything you can do to a connected calendar,
 * plus the connect buttons for the ones you have not linked yet. Absorbed from
 * the old /dashboard/integrations page.
 */
export function ManageCalendars({
  rows,
  connectable,
}: {
  rows: CalendarRow[];
  connectable: ConnectableProvider[];
}) {
  const t = useT();
  const c = t.calendar;
  const [open, setOpen] = useState(false);
  // "Primary" is only a meaningful idea with more than one calendar.
  const showPrimary = rows.length > 1;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press h-8 shrink-0 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
      >
        {t.common.manage}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={c.manageCalendars}
            className="glass shape-card flex max-h-[80dvh] w-full max-w-lg flex-col p-5"
          >
            <div className="flex shrink-0 items-start justify-between gap-4">
              <h2 className="text-sm font-medium text-neutral-900">{c.manageCalendars}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.common.close}
                className="press -mr-1 -mt-1 rounded-lg p-1 text-neutral-400 hover:text-neutral-900"
              >
                ✕
              </button>
            </div>

            {/* Only the modal body scrolls. */}
            <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto">
              {rows.length > 0 && (
                <ul className="space-y-2">
                  {rows.map((row) => (
                    <li
                      key={row.id}
                      className="rounded-xl border border-neutral-200/70 bg-white/60 p-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <ProviderIcon id={row.provider} />
                        <span className="text-sm font-medium text-neutral-900">{row.name}</span>
                        {row.account && (
                          <span className="max-w-[14rem] truncate text-xs text-neutral-500">
                            {row.account}
                          </span>
                        )}
                        {row.isPrimary && showPrimary && (
                          <span className="shape-pill border border-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                            {t.common.primary}
                          </span>
                        )}
                        {row.needsReconnect && (
                          <span className="shape-pill border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                            {c.reconnectNeeded}
                          </span>
                        )}
                      </div>
                      {row.needsReconnect && (
                        <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
                          {c.reconnectHint}
                        </p>
                      )}
                      <div className="mt-2.5">
                        <RowActions row={row} showPrimary={showPrimary} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {connectable.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {connectable.map((p) => (
                    <a
                      key={p.id}
                      href={p.href}
                      className="press inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      <ProviderIcon id={p.id} />
                      {c.continueWith} {p.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
