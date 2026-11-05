"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export interface SuggestionLink {
  href: string;
  label: string;
}

// Dice coefficient on character bigrams: cheap, dependency-free, and good
// enough to catch truncated or misspelled slugs.
function bigrams(s: string): Set<string> {
  const out = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
  return out;
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const A = bigrams(a);
  const B = bigrams(b);
  if (A.size === 0 || B.size === 0) return 0;
  let shared = 0;
  for (const g of A) if (B.has(g)) shared++;
  return (2 * shared) / (A.size + B.size);
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const THRESHOLD = 0.35;
const MAX_SUGGESTIONS = 3;

// Fuzzy-matches the mistyped URL against the site's real pages and offers the
// closest ones. Renders nothing until mounted (the requested path only exists
// in the browser) and nothing at all when no match clears the bar.
export function NotFoundSuggestions({
  links,
  src,
  lead = "Did you mean",
  or = "or",
}: {
  links?: SuggestionLink[];
  /** A URL that returns the links as JSON, used when `links` is not given. */
  src?: string;
  /** "Did you mean" in the page language, without the trailing space. */
  lead?: string;
  or?: string;
}) {
  const [matches, setMatches] = useState<SuggestionLink[]>([]);

  useEffect(() => {
    const path = window.location.pathname.replace(/\/+$/, "");
    const segment = normalize(path.split("/").pop() ?? "");
    const whole = normalize(path);
    if (!segment) return;

    const closest = (all: SuggestionLink[]) =>
      all
        .map((l) => {
          const slug = normalize(l.href.split("/").pop() ?? "");
          const score = Math.max(
            similarity(segment, slug),
            similarity(segment, normalize(l.label)),
            similarity(whole, normalize(l.href)),
          );
          return { link: l, score };
        })
        .filter((s) => s.score >= THRESHOLD)
        .sort((x, y) => y.score - x.score)
        .slice(0, MAX_SUGGESTIONS)
        .map((s) => s.link);

    if (links) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the match reads window.location, which exists only after hydration.
      setMatches(closest(links));
      return;
    }
    if (!src) return;
    let live = true;
    // No suggestions is the fallback: the page still has its home link.
    fetch(src)
      .then((r) => (r.ok ? r.json() : []))
      .then((all: SuggestionLink[]) => {
        if (live) setMatches(closest(all));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [links, src]);

  if (matches.length === 0) return null;

  return (
    <div style={{ marginTop: "20px", fontSize: "14px", fontWeight: 300, color: "#888" }}>
      <span>{lead} </span>
      {matches.map((m, i) => (
        <span key={m.href}>
          {i > 0 && <span>{i === matches.length - 1 ? ` ${or} ` : ", "}</span>}
          <Link
            href={m.href}
            style={{
              color: "#1D1D1D",
              fontWeight: 400,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              textDecorationColor: "#ccc",
            }}
          >
            {m.label}
          </Link>
        </span>
      ))}
      <span>?</span>
    </div>
  );
}
