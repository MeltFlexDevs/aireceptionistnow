"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type Section = { id: string; title: string };

export function PostToc({
  sections,
  heading = "Table of contents",
  label = "Table of contents",
}: {
  sections: Section[];
  /** Visible heading. Localized articles pass BLOG_COPY.article.tableOfContents. */
  heading?: string;
  /** aria-label on the nav landmark; same string, kept separate so a locale can shorten one. */
  label?: string;
}) {
  const [activeId, setActiveId] = React.useState("");

  React.useEffect(() => {
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <nav aria-label={label}>
      <p className="mb-3 text-[10px] font-semibold tracking-[0.08em] text-[#999] uppercase">
        {heading}
      </p>
      <ul className="max-h-[18vh] overflow-y-auto border-l border-[#e5e5e5] pr-1 [scrollbar-width:thin]">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(s.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
                history.replaceState(null, "", `#${s.id}`);
              }}
              className={cn(
                "-ml-px block border-l py-[5px] pl-3.5 text-[12px] leading-snug transition-colors",
                activeId === s.id
                  ? "border-[#1D1D1D] font-normal text-[#1D1D1D]"
                  : "border-transparent font-light text-[#888] hover:text-[#333]"
              )}
            >
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
