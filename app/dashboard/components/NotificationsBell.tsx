"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Phone } from "../icons";

interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  at: string;
  href: string;
}

const SEEN_KEY = "notifications:lastSeenAt";

function relTime(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationsBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [lastSeen, setLastSeen] = useState<string>("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Load persisted "last seen" once, then fetch the feed.
  useEffect(() => {
    setLastSeen(localStorage.getItem(SEEN_KEY) ?? "");
    const controller = new AbortController();
    fetch("/api/notifications", { signal: controller.signal })
      .then((r) => r.json())
      .then((d: { items?: NotificationItem[] }) => setItems(d.items ?? []))
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
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = items.filter((i) => i.at > lastSeen).length;

  function markAllRead() {
    const newest = items[0]?.at ?? new Date().toISOString();
    localStorage.setItem(SEEN_KEY, newest);
    setLastSeen(newest);
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
        onClick={toggle}
        className="relative rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-neutral-900 ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg shadow-neutral-200/60">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <span className="text-sm font-medium text-neutral-900">Notifications</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900"
              >
                Mark all read
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-neutral-400">
              No recent calls.
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {items.map((i) => {
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
                          <span className="truncate text-sm font-medium text-neutral-900">{i.title}</span>
                          {isUnread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-900" />}
                        </div>
                        <div className="truncate text-xs text-neutral-500">{i.subtitle}</div>
                      </div>
                      <span className="shrink-0 text-xs text-neutral-400">{relTime(i.at)}</span>
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
