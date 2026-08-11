import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

/**
 * Root layout for the caller's receipt.
 *
 * A third root layout alongside app/(main) and app/[locale], and deliberately
 * not `RootShell`. Everything that shell carries - the auth dialog provider, the
 * Organization/Person JSON-LD, the marketing chrome - exists for a visitor we
 * are trying to convert. The reader here is somebody who rang a plumber ninety
 * seconds ago, on a phone, on cellular, who has never heard of this product and
 * is not the customer. They get the font, the reset, and nothing else.
 *
 * `lang` is "en" because a root layout cannot see the route's params. The page
 * sets the real language on the content element, which is what assistive
 * technology reads for pronunciation.
 */

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Your call",
  // Belt and braces with robots.ts: this page is one person's private summary
  // of one phone call, and it must never appear in a search result.
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1D1D1D",
};

export default function ReceiptLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
