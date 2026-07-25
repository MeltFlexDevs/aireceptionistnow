import type { NextConfig } from "next";

const STATIC_ASSET_MATCHER =
  "/:path*\\.(ico|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2)";

const nextConfig: NextConfig = {
  // Lets a verification build target a throwaway dir (NEXT_DIST_DIR) without
  // clobbering a running `next dev` .next. Defaults to the normal directory.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    serverActions: { bodySizeLimit: "16mb" },
    // Every dashboard route is force-dynamic, so the client Router Cache TTL is
    // 0 by default and revisiting a tab within seconds re-hits the server. Cache
    // the dynamic page-segment payload briefly so quick back-and-forth between
    // dashboard tabs reuses it (per-browser, per-user; 30s is well within safe).
    staleTimes: { dynamic: 30 },
    // Tree-shake motion's barrel so routes that use one or two of its exports
    // (Sidebar's useReducedMotion, the guide overlay) don't pull the whole entry.
    optimizePackageImports: ["motion"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    // Next 16 requires an explicit quality allowlist. 75 is the default we use.
    qualities: [75],
  },
  async redirects() {
    return [
      // Canonical host: GSC shows www URLs collecting impressions as separate
      // pages (e.g. www.../blog/dental-answering-service). Canonical tags point
      // at the apex, but a 308 stops the split-signal problem outright.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.aireceptionistnow.com" }],
        destination: "https://aireceptionistnow.com/:path*",
        permanent: true,
      },
      // The company pages lived under /dashboard/organizations before.
      {
        source: "/dashboard/organizations/:path*",
        destination: "/dashboard/company/:path*",
        permanent: true,
      },
      // Industry landing pages moved from /industries/[slug] to top-level /[slug].
      {
        source: "/industries/:slug",
        destination: "/:slug",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      // Preview builds expose unreviewed translations. Make it impossible for
      // one to be indexed, even if a preview URL leaks or gets linked.
      ...(process.env.NEXT_PUBLIC_I18N_PREVIEW === "1"
        ? [
            {
              source: "/:path*",
              headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
            },
          ]
        : []),
      {
        source: STATIC_ASSET_MATCHER,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
