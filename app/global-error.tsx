"use client";

// Last fallback: it shows when a root layout (app/(main)/layout.tsx or
// app/[locale]/layout.tsx) or a page with no nearer boundary throws. It
// replaces the root layout, so it renders its own <html> and <body>, uses
// inline styles and no providers, and stays in English: no copy source is
// mounted here. unstable_retry (Next 16.2) refreshes the server data before
// it re-renders.
export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          color: "#171717",
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <title>Something went wrong</title>
        <main style={{ padding: "0 20px", textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 500, lineHeight: 1.4 }}>Something went wrong.</h1>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              marginTop: 24,
              height: 40,
              padding: "0 20px",
              border: 0,
              borderRadius: 8,
              background: "#171717",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
