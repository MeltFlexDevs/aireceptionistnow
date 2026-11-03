import type { Metadata } from "next";
import NotFoundView from "../components/NotFoundView";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
  alternates: { canonical: null },
};

// Every English page loads this 404's client entry, so the link list comes
// from a static route (app/api/not-found-links) instead of an import.
export default function NotFound() {
  return <NotFoundView linksSrc="/api/not-found-links" />;
}
