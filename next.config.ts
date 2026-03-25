import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 3ème Voie DevOps : Qualité non-négociable
  // eslint et typescript checks activés — corriger les erreurs, ne pas les ignorer
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Disable Turbopack due to stability issues
  experimental: {
    turbo: undefined,
  },
  // Image optimization for external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Supabase storage
      },
    ],
  },
};

export default nextConfig;
