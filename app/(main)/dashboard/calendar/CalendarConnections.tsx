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

const ROW = "rounded-xl border border-neutral-200/70 bg-white/60 p-3";
const GHOST_BTN =
  "press h-8 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-600 hover:text-neutral-900";

/**
 * A connected calendar: its identity plus the actions you can take on it. Set
 * primary sits inline (only meaningful with a second calendar); disconnect - the
 * one destructive, irreversible action - stays tucked behind Manage and takes a
 * second click, so it can't be triggered by accident.
 */
function ConnectedRow({ row, showPrimary }: { row: CalendarRow; showPrimary: boolean }) {
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
  const [managing, setManaging] = useState(false);
  const [confirming, setConfirming] = useState(false);

  return (
    <li className={ROW}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <ProviderIcon id={row.provider} />
        <span className="text-sm font-medium text-neutral-900">{row.name}</span>
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
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {showPrimary && !row.isPrimary && (
            <form action={primaryAction}>
              <input type="hidden" name="id" value={row.id} />
              <SubmitButton variant="secondary" className="h-8 px-2.5 text-xs">
                {c.setPrimary}
              </SubmitButton>
            </form>
          )}
          <button type="button" onClick={() => setManaging((v) => !v)} className={GHOST_BTN}>
            {t.common.manage}
          </button>
        </div>
      </div>

      {row.account && (
        <p className="mt-1 max-w-full truncate text-xs text-neutral-500">{row.account}</p>
      )}

      {row.needsReconnect && (
        <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{c.reconnectHint}</p>
      )}

      {managing && (
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200/70 pt-2.5">
          <SavePill state={primaryState.ok !== null ? primaryState : dropState} />
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
            <button type="button" onClick={() => setConfirming(true)} className={GHOST_BTN}>
              {t.common.disconnect}
            </button>
          )}
        </div>
      )}
    </li>
  );
}

/** A provider you haven't linked yet: name plus its OAuth "Connect" entry point. */
function ConnectRow({ provider }: { provider: ConnectableProvider }) {
  const t = useT();
  return (
    <li className={`${ROW} flex flex-wrap items-center gap-x-2 gap-y-1`}>
      <ProviderIcon id={provider.id} />
      <span className="text-sm font-medium text-neutral-900">{provider.name}</span>
      <a
        href={provider.href}
        className="press ml-auto inline-flex h-8 shrink-0 items-center rounded-lg border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
      >
        {t.common.connect}
      </a>
    </li>
  );
}

/**
 * The calendar-connections panel that lives under the mini month grid. Every
 * bookable provider shows here: connected ones with their account and controls,
 * the rest with a Connect button. Replaces the old top "Connected calendar" bar
 * and its Manage modal.
 */
export function CalendarConnections({
  rows,
  connectable,
}: {
  rows: CalendarRow[];
  connectable: ConnectableProvider[];
}) {
  const t = useT();
  const c = t.calendar;
  // "Primary" is only a meaningful idea with more than one calendar.
  const showPrimary = rows.length > 1;

  return (
    <section className="shape-card glass flex flex-col overflow-hidden md:min-h-0 md:flex-1">
      <div className="shrink-0 border-b border-neutral-200/70 px-4 py-3">
        <h2 className="text-sm font-medium text-neutral-900">{c.manageCalendars}</h2>
      </div>
      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {rows.map((row) => (
          <ConnectedRow key={row.id} row={row} showPrimary={showPrimary} />
        ))}
        {connectable.map((p) => (
          <ConnectRow key={p.id} provider={p} />
        ))}
      </ul>
    </section>
  );
}
