// Unmatched URLs have no root layout above them (the app has two:
// (main) and [locale]), so without this file they get Next's bare 404.
// Needs experimental.globalNotFound in next.config.ts. Renders its own
// <html>/<body> through RootShell, like both root layouts do.
import "./globals.css";
import type { Metadata } from "next";
import RootShell, { baseMetadata } from "./_shared/root-shell";
import NotFoundView from "./components/NotFoundView";
import { EN_NOT_FOUND_LINKS } from "./components/en-not-found-links";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  ...baseMetadata,
  // No parent layout, so the "%s | site" template does not apply here.
  title: `Page not found | ${siteName}`,
  robots: { index: false },
  alternates: { canonical: null },
};

export default function GlobalNotFound() {
  return (
    <RootShell lang="en">
      <NotFoundView links={EN_NOT_FOUND_LINKS} />
    </RootShell>
  );
}
