import type { NextConfig } from "next";

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
  },
};

export default nextConfig;
