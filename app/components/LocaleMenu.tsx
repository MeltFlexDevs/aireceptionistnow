"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// The one language menu, used by the dashboard topbar and the marketing header.
//
// It is deliberately PRESENTATIONAL only. The two callers switch language by
// genuinely different mechanisms and neither can be forced onto the other:
//
//   dashboard  - instant client-side switch via a cookie plus a dictionary
//                chunk, so items are <button>s and there is a pending state
//   marketing  - each locale is a separate URL, so items must be real <a>
//                links that crawlers can follow and users can open in a new tab
//
// Rendering links as buttons would make the localized URLs invisible to search
// engines; rendering buttons as links would break the instant dashboard switch.
// So behaviour is injected per item and only the appearance is shared.

export interface LocaleMenuItem {
  code: string;
  label: string;
  flag: string;
  current: boolean;
  /** Set for link-based menus (marketing). Mutually exclusive with onSelect. */
  href?: string;
  /** Set for action-based menus (dashboard). Mutually exclusive with href. */
  onSelect?: () => void;
}

const Check = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const Chevron = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400" aria-hidden>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export function LocaleMenu({
  items,
  label,
  triggerClassName = "press flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
  trailing,
  onOpen,
}: {
  items: LocaleMenuItem[];
  /** Accessible name and dropdown heading, e.g. "Language". */
  label: string;
  triggerClassName?: string;
  /** Replaces the chevron, e.g. a pending spinner. */
  trailing?: ReactNode;
  /** Fired on open/hover/focus. The dashboard uses it to warm dictionaries. */
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // A one-language control is clutter, not a feature.
  if (items.length < 2) return null;

  const current = items.find((i) => i.current) ?? items[0];
  const itemClass = (isCurrent: boolean) =>
    `flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm no-underline transition-colors ${
      isCurrent
        ? "font-medium text-neutral-900"
        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
    }`;

  return (
    <div className="relative" ref={ref} data-el-dropdown={open ? "open" : "closed"}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          onOpen?.();
        }}
        onMouseEnter={onOpen}
        onFocus={onOpen}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
        className={triggerClassName}
      >
        <span className="text-base leading-none" aria-hidden>
          {current.flag}
        </span>
        <span className="hidden font-medium uppercase sm:inline">{current.code}</span>
        {trailing ?? <Chevron />}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
        >
          <p className="px-3 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            {label}
          </p>
          {items.map((item) =>
            item.href ? (
              <a
                key={item.code}
                href={item.href}
                hrefLang={item.code}
                role="menuitem"
                aria-current={item.current ? "true" : undefined}
                className={itemClass(item.current)}
              >
                <span className="text-base leading-none" aria-hidden>{item.flag}</span>
                <span className="flex-1">{item.label}</span>
                {item.current && <Check />}
              </a>
            ) : (
              <button
                key={item.code}
                type="button"
                role="menuitemradio"
                aria-checked={item.current}
                onClick={() => {
                  setOpen(false);
                  item.onSelect?.();
                }}
                className={itemClass(item.current)}
              >
                <span className="text-base leading-none" aria-hidden>{item.flag}</span>
                <span className="flex-1">{item.label}</span>
                {item.current && <Check />}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
