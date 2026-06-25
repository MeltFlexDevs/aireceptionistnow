import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // PDF knowledge uploads post through a Server Action; lift the default
    // 1 MB body cap so reasonably sized documents go through.
    serverActions: { bodySizeLimit: "16mb" },
  },
};

export default nextConfig;
