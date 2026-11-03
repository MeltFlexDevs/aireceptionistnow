/**
 * Version stamp for the Terms of Service.
 *
 * Recorded alongside every acceptance so a stored record says *which* text the
 * user agreed to - an acceptance timestamp on its own is close to worthless if
 * the terms have been revised since.
 *
 * Bump this whenever app/(main)/terms-of-service/TermsContent.tsx changes materially,
 * and keep it in step with the "Last Updated" line on that page.
 */
export const TERMS_VERSION = "2026-10";

/**
 * In-app mode for the public legal and account pages.
 *
 * The native app opens Privacy, Terms, Support and Account deletion in an
 * in-app browser with `?app=1`. Those pages then render without the site
 * header, footer or any link that leads to pricing, sign-up or the dashboard:
 * a page reached from inside an iOS binary that links on to a web checkout is
 * an in-app purchase bypass (App Store 3.1.1, Play Payments policy). Without
 * the flag the pages are unchanged for web visitors.
 */
export function isAppMode(sp: { app?: string | string[] } | undefined): boolean {
  const value = sp?.app;
  return (Array.isArray(value) ? value[0] : value) === "1";
}

/** Keep `?app=1` on a link between the in-app pages so the mode survives navigation. */
export function withAppMode(href: string, app: boolean): string {
  if (!app) return href;
  return `${href}${href.includes("?") ? "&" : "?"}app=1`;
}
