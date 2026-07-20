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
    // The company pages lived under /dashboard/organizations before.
    return [
      {
        source: "/dashboard/organizations/:path*",
        destination: "/dashboard/company/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
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
