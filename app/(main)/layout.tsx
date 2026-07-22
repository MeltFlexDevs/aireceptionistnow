import RootShell, { baseMetadata, baseViewport } from "@/app/_shared/root-shell";

// Root layout for the English tree (marketing at /, plus dashboard, onboarding
// and auth). Sibling root layout: app/[locale]/layout.tsx.
//
// Both re-export baseMetadata rather than inheriting it - metadata does NOT
// cross between sibling root layouts, and dropping metadataBase here would
// degrade every absolute URL on the English pages.
export const metadata = baseMetadata;
export const viewport = baseViewport;

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RootShell lang="en">{children}</RootShell>;
}
