import Link from "next/link";
import type { UiCopy } from "@/content/i18n/_ui-copy";
import { enUi } from "@/content/i18n/en/ui";
import { EN_NAV_HREFS, type NavHrefs } from "@/lib/i18n/marketing/nav";
import LazySiteHeader from "./LazySiteHeader";
import SiteFooter from "./SiteFooter";
import { NotFoundSuggestions, type SuggestionLink } from "./NotFoundSuggestions";

// One joke, one exit - the site chrome around it carries the navigation, and
// the did-you-mean matcher rescues mistyped URLs. Used by app/(main)/not-found,
// app/global-not-found and the /<locale>/ 404 (app/[locale]/[...rest]/layout).
export default function NotFoundView({
  ui = enUi,
  nav = EN_NAV_HREFS,
  links,
  linksSrc,
}: {
  ui?: UiCopy;
  nav?: NavHrefs;
  /** Built on the server; only these {href, label} strings reach the client. */
  links?: SuggestionLink[];
  /** Or a URL that returns them as JSON (app/api/not-found-links). */
  linksSrc?: string;
}) {
  const t = ui.notFound;
  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        color: "#1D1D1D",
        fontFamily: "var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <LazySiteHeader ui={ui} nav={nav} />
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "140px 24px 96px",
          textAlign: "center",
        }}
      >
        <p
          aria-hidden
          style={{
            fontSize: "clamp(88px, 18vw, 160px)",
            fontWeight: 200,
            letterSpacing: "-0.06em",
            lineHeight: 1,
            margin: 0,
            color: "#1D1D1D",
          }}
        >
          +404
        </p>
        <h1
          style={{
            fontSize: "clamp(18px, 3vw, 24px)",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            margin: "8px 0 0",
          }}
        >
          {t.title}
        </h1>
        <p
          style={{
            fontSize: "15px",
            fontWeight: 300,
            color: "#888",
            maxWidth: "380px",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {t.body}
        </p>
        <NotFoundSuggestions links={links} src={linksSrc} lead={t.didYouMean} or={t.or} />
        <Link
          href={nav.home}
          className="press"
          style={{
            marginTop: "24px",
            display: "inline-flex",
            alignItems: "center",
            height: "42px",
            padding: "0 22px",
            borderRadius: "12px",
            background: "#1D1D1D",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          {t.home}
        </Link>
      </main>
      <SiteFooter ui={ui} nav={nav} />
    </div>
  );
}
