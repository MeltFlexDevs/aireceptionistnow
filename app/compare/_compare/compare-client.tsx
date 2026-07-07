"use client";

import { useEffect, useRef } from "react";

import { useAuthDialog } from "@/app/components/AuthDialog";

/** Pill CTA that matches the compare design and opens the sign-up dialog. */
export function CompareCta({
  label = "Start free",
  outline = false,
}: {
  label?: string;
  outline?: boolean;
}) {
  const { open } = useAuthDialog();
  return (
    <button
      type="button"
      onClick={() => open("signup")}
      className={outline ? "compare-cta-btn compare-cta-btn-outline" : "compare-cta-btn"}
    >
      {label} &rarr;
    </button>
  );
}

export type TocItem = { id: string; label: string };

/** Sticky table of contents with scroll-spy highlighting the active section. */
export function CompareToc({ items }: { items: TocItem[] }) {
  const tocRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const nav = tocRef.current;
            if (!nav) return;
            nav.querySelectorAll("a").forEach((a) => {
              a.classList.toggle(
                "compare-toc__link--active",
                a.getAttribute("href") === `#${id}`,
              );
            });
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  return (
    <aside className="compare-sidebar">
      <nav className="compare-toc" ref={tocRef}>
        <h3>On this page</h3>
        <ol>
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>{item.label}</a>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}
