import type { NextConfig } from "next";

const STATIC_ASSET_MATCHER =
  "/:path*\\.(ico|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2)";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "16mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    // Next 16 requires an explicit quality allowlist. 75 is the default we use.
    qualities: [75],
  },
  async redirects() {
    return [
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
