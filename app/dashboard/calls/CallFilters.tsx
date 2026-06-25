"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search } from "../icons";

interface Props {
  q: string;
  direction: string;
  status: string;
}

const DIRECTIONS = [
  { value: "all", label: "All directions" },
  { value: "inbound", label: "Inbound" },
  { value: "outbound", label: "Outbound" },
];
const STATUSES = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "unanswered", label: "Unanswered" },
  { value: "active", label: "In progress" },
];

export function CallFilters({ q, direction, status }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [text, setText] = useState(q);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  // Debounce the free-text search so each keystroke doesn't navigate.
  useEffect(() => {
    if (text === q) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setParam("q", text.trim()), 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const selectClass =
    "h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-violet-400";

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search by number, assistant, outcome, or Call SID"
          className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-violet-400"
        />
      </div>
      <select value={direction} onChange={(e) => setParam("dir", e.target.value)} className={selectClass}>
        {DIRECTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select value={status} onChange={(e) => setParam("status", e.target.value)} className={selectClass}>
        {STATUSES.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
