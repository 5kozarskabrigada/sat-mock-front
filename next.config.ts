import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/1',
  productionBrowserSourceMaps: false,
  serverExternalPackages: [],
  experimental: {
    serverSourceMaps: false,
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
