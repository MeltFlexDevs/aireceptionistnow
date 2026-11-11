"use client";

import { useEffect, useRef, type ReactNode } from "react";

// The "Add as preferred source" button. Rendered as a plain link to
// google.com/preferences/source, then upgraded in the browser to Google's own
// one-click flow (news.google.com publisher script): a click opens Google's
// small "add source" popup window with a single confirm button, it closes
// itself, and the reader is back in the article. This tab never navigates away.
//
// The link stays the fallback on purpose: until the script is ready, or when an
// ad blocker or a consent tool stops it, the click simply follows the href as
// before. The script (~140 KB) is requested only once the button is near the
// viewport, so it never competes with the first paint.

type PreferredSourceApi = {
  init: (options?: { theme?: string; lang?: string }) => void;
  addPreferredSource: () => void;
};
type Queue = { push: (fn: (ps: PreferredSourceApi) => void) => unknown };

const SCRIPT_SRC = "https://news.google.com/swg/js/v1/publisher.js";

export function PreferredSourceLink({
  href,
  className,
  lang,
  children,
}: {
  href: string;
  className?: string;
  lang?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const button = ref.current;
    if (!button) return;

    const w = window as unknown as { PREFERRED_SOURCE?: Queue };
    let api: PreferredSourceApi | null = null;
    let cancelled = false;
    let lastOpenedAt = 0;

    const load = () => {
      if (!document.querySelector("script[data-preferred-source-script]")) {
        const script = document.createElement("script");
        script.async = true;
        script.src = SCRIPT_SRC;
        // manual: we keep our own button, Google must not render its own.
        script.setAttribute("preferred-sources-control", "manual");
        script.setAttribute("data-preferred-source-script", "");
        document.head.appendChild(script);
      }
      const queue = (w.PREFERRED_SOURCE =
        w.PREFERRED_SOURCE || ([] as unknown as Queue));
      queue.push((ps) => {
        if (cancelled) return;
        try {
          ps.init(lang ? { theme: "light", lang } : { theme: "light" });
        } catch {
          return;
        }
        api = ps;
      });
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect();
            observer = null;
            load();
          }
        },
        { rootMargin: "600px 0px" },
      );
      observer.observe(button);
    } else {
      load();
    }

    const onClick = (event: MouseEvent) => {
      // Not ready, or a modified click (new tab etc.): keep the plain link.
      if (
        !api ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      )
        return;
      event.preventDefault();
      // A consent tool can replay a first click; one popup is enough.
      const now = Date.now();
      if (now - lastOpenedAt < 1000) return;
      lastOpenedAt = now;
      try {
        api.addPreferredSource();
      } catch {
        window.open(button.href, "_blank", "noopener");
      }
    };
    button.addEventListener("click", onClick);
    return () => {
      cancelled = true;
      observer?.disconnect();
      button.removeEventListener("click", onClick);
    };
  }, [lang]);

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener nofollow"
      className={className}
    >
      {children}
    </a>
  );
}
