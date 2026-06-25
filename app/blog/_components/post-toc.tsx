"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type Section = { id: string; title: string };

/**
 * Sticky table of contents with scroll-spy. Highlights the section currently in
 * view (IntersectionObserver) and smooth-scrolls on click. Used in the blog
 * post sidebar.
 */
export function PostToc({ sections }: { sections: Section[] }) {
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
    <nav aria-label="Table of contents">
      <p className="mb-3 text-[10px] font-semibold tracking-[0.08em] text-[#999] uppercase">
        Table of contents
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
                  ? "border-[#1a1a1a] font-normal text-[#1a1a1a]"
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
