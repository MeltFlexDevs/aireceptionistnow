import type { NextConfig } from "next";

// Files served from /public are NOT content-hashed by Next, so they don't get
// the automatic immutable cache. Long-cache them by extension (30 days + SWR)
// so repeat visitors don't re-download logos, icons, fonts, and images. Rename
// the file when its contents change (there is no hash to bust the cache).
const STATIC_ASSET_MATCHER =
  "/:path*\\.(ico|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2)";

const nextConfig: NextConfig = {
  experimental: {
    // PDF knowledge uploads post through a Server Action; lift the default
    // 1 MB body cap so reasonably sized documents go through.
    serverActions: { bodySizeLimit: "16mb" },
  },
  images: {
    // Serve AVIF when the browser accepts it (smallest), fall back to WebP.
    // Order matters: first matching Accept-header format wins.
    formats: ["image/avif", "image/webp"],
    // Keep optimized images in the cache for 31 days instead of the 4h default,
    // so stable marketing images are re-optimized far less and the CDN hit
    // ratio stays high.
    minimumCacheTTL: 2678400,
    // Next 16 requires an explicit quality allowlist. 75 is the default we use.
    qualities: [75],
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
