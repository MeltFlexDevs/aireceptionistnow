"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { relTimeOf } from "@/lib/dashboard/rel-time";
import { callOutcomeLabel, fmtDuration } from "@/lib/dashboard/calls/format";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { Bell, Phone } from "../icons";

// The raw call fields from /api/notifications. The bell formats them in the
// viewer's language; the server's title and subtitle are English.
interface NotificationItem {
  id: string;
  at: string;
  href: string;
  from: string;
  outcome: string | null;
  status: string;
  durationSec: number;
}

const SEEN_KEY = "notifications:lastSeenAt";
const CLEARED_KEY = "notifications:clearedAt";

export function NotificationsBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [lastSeen, setLastSeen] = useState<string>("");
  const [clearedAt, setClearedAt] = useState<string>("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { t, locale } = useI18n();

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/notifications", { signal: controller.signal })
      .then(async (r) => {
        // 401 means the session lapsed under an open dashboard tab - stay quiet
        // and let the next navigation redirect. Anything else is a real fault.
        if (!r.ok) {
          if (r.status !== 401) console.error("[notifications]", r.status);
          return { items: [] };
        }
        return (await r.json()) as { items?: NotificationItem[] };
      })
      .then((d) => {
        setItems(d.items ?? []);
        setLastSeen(localStorage.getItem(SEEN_KEY) ?? "");
        setClearedAt(localStorage.getItem(CLEARED_KEY) ?? "");
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Cleared items disappear from the panel (per browser); newer ones return.
  const visible = items.filter((i) => i.at > clearedAt);
  const unread = visible.filter((i) => i.at > lastSeen).length;

  function markAllRead() {
    const newest = items[0]?.at ?? new Date().toISOString();
    localStorage.setItem(SEEN_KEY, newest);
    setLastSeen(newest);
  }

  function clearAll() {
    const newest = items[0]?.at ?? new Date().toISOString();
    localStorage.setItem(CLEARED_KEY, newest);
    setClearedAt(newest);
    markAllRead(); // clearing implies everything was seen
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) markAllRead();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        ref={buttonRef}
        onClick={toggle}
        className="relative rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
        aria-label={t.common.notifications}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-neutral-900 ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-4.5rem))] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg shadow-neutral-200/60">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
            <span className="text-sm font-medium text-neutral-900">{t.common.notifications}</span>
            <span className="flex items-center gap-3">
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900"
                >
                  Mark all read
                </button>
              )}
              {visible.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900"
                >
                  Clear all
                </button>
              )}
            </span>
          </div>

          {visible.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-neutral-500">
              No recent calls.
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {visible.map((i) => {
                const isUnread = i.at > lastSeen;
                return (
                  <li key={i.id}>
                    <Link
                      href={i.href}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-50"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                        <Phone className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-neutral-900">{i.from ? formatPhone(i.from) : t.data.unknownCaller}</span>
                          {isUnread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-900" />}
                        </div>
                        <div className="truncate text-xs text-neutral-500">{`${callOutcomeLabel(t.data, i.status, i.outcome, i.at)} · ${fmtDuration(i.durationSec)}`}</div>
                      </div>
                      <span className="shrink-0 text-xs text-neutral-500">{relTimeOf(i.at, locale)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href="/dashboard/calls"
            onClick={() => setOpen(false)}
            className="block border-t border-neutral-100 px-4 py-2.5 text-center text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
          >
            View all calls
          </Link>
        </div>
      )}
    </div>
  );
}
