import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  serverExternalPackages: [],
  experimental: {
    serverSourceMaps: false,
  },
};

export default nextConfig;
