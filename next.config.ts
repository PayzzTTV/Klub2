import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable Turbopack due to stability issues
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
