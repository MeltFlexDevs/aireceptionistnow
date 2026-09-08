import { cache } from "react";

import { siteName, siteUrl } from "@/lib/site";

/**
 * The Google "preferred source" card, printed under the opening paragraph of
 * every English article.
 *
 * Google lets a reader pin a publisher into their own Top Stories and Discover
 * feed, and the only way to ask for that is a link to
 * google.com/preferences/source. It sits directly under the lead because that is
 * the one spot where the reader has decided the piece is worth reading but has
 * not yet scrolled away.
 *
 * It is rendered by `Lead` (see ./prose.tsx) rather than authored into each
 * post, so all 50-odd articles carry it and no future one can forget it.
 */

const PREFERENCES_URL = `https://google.com/preferences/source?q=${encodeURIComponent(siteUrl)}`;

/**
 * Request-scoped switch, off by default.
 *
 * `Lead` is shared by the English posts and by the seven generated locale twins
 * under content/i18n/{locale}/blog, so hanging the card off it unconditionally
 * would print English marketing copy into the middle of a German article.
 * Google's preferred-source picker is English-only (US and India) in any case,
 * so the card belongs on /blog and nowhere else.
 *
 * React's `cache()` gives one object per render pass, which is the only
 * server-side request context the App Router offers: the English template flips
 * it on before it renders `<Body />`, the localized template never does. Off by
 * default on purpose — if this ever stopped working the card would go missing
 * from /blog, which is visible on the next page load, rather than leaking
 * English copy into seven languages, which nobody would notice.
 */
const requestScope = cache(() => ({ enabled: false }));

/** Call at the top of a template whose articles should carry the card. */
export function enablePreferredSource() {
  requestScope().enabled = true;
}

export function preferredSourceEnabled() {
  return requestScope().enabled;
}

export function PreferredSource() {
  return (
    <div className="my-8 flex flex-wrap items-center justify-between gap-x-5 gap-y-3.5 border border-[#e5e5e5] border-l-[3px] border-l-[#1D1D1D] bg-white px-5 py-[18px] max-[560px]:flex-col max-[560px]:items-stretch">
      <div className="min-w-0">
        <p className="text-[16px] leading-[1.4] tracking-[-0.01em] text-[#1D1D1D]">
          Our articles are still written by{" "}
          {/* The one word the card is actually about, in the site's signature
              emphasis: semibold uppercase with open tracking. One word only, so
              the tracking reads as emphasis rather than as a label. */}
          <span className="font-semibold tracking-[0.06em] uppercase">humans!</span>
        </p>
        <p className="mt-1 text-[14px] leading-[1.5] text-[#6f6f6f]">
          Get human written articles in your Google feed.
        </p>
      </div>
      <a
        href={PREFERENCES_URL}
        target="_blank"
        rel="noopener nofollow"
        className="inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full border border-[#d4d4d4] bg-white px-5 py-2.5 text-[14px] font-semibold whitespace-nowrap text-[#1D1D1D] no-underline transition-colors hover:border-[#1D1D1D] hover:bg-[#fafafa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D1D1D]"
      >
        <GoogleMark />
        Add as preferred source
        {/* The button text alone says neither what is being added nor that the
            link leaves the page. Hidden from the page, still read out. */}
        <span className="sr-only"> {siteName}, opens in a new window</span>
      </a>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
