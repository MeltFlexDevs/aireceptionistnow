import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
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
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
