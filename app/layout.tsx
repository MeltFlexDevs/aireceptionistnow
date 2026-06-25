import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "AI Receptionist — Answer Every Call 24/7",
  description:
    "Your AI receptionist answers calls, books appointments, and handles customers 24/7. Set up in 10 minutes. No code needed.",
  openGraph: {
    title: "AI Receptionist — Answer Every Call 24/7",
    description:
      "Your AI receptionist answers calls, books appointments, and handles customers 24/7. Set up in 10 minutes. No code needed.",
    url: "https://aireceptionistnow.com",
    siteName: "AI Receptionist Now",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-white" style={{ fontFamily: "var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, sans-serif", fontWeight: 300 }}>
        {children}
      </body>
    </html>
  );
}
