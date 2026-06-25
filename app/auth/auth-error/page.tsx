import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign-in problem — AI Receptionist",
  robots: { index: false },
};

export default function AuthErrorPage() {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        padding: "0 24px",
        textAlign: "center",
        fontFamily: "var(--font-inter), Inter, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 500, letterSpacing: "-0.02em" }}>
          We couldn&apos;t finish signing you in
        </h1>
        <p style={{ maxWidth: "360px", fontSize: "14px", color: "#666" }}>
          The link may have expired or already been used. Head back and request
          a new one.
        </p>
      </div>
      <Link
        href="/?auth=login"
        style={{
          display: "inline-flex",
          alignItems: "center",
          height: "40px",
          padding: "0 20px",
          background: "#000",
          color: "#fff",
          borderRadius: "20px",
          fontSize: "13px",
          textDecoration: "none",
          letterSpacing: "0.04em",
        }}
      >
        Back to sign in
      </Link>
    </main>
  );
}
