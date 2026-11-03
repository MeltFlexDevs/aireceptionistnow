import { notFound } from "next/navigation";

// Any unknown URL with 2+ segments lands here. notFound() sets the 404 status
// and noindex. ./layout.tsx renders the 404 view around the empty ./not-found.tsx.
// No static params and no dynamicParams here: this route is always dynamic. So
// Next 16.2.9 sends an empty error shell and the client renders the view from
// the RSC payload. A server-rendered localized 404 would need a prerendered
// page per locale.
export default function LocaleCatchAll(): never {
  notFound();
}
