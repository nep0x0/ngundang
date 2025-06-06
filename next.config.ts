import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: 'export' for development with Supabase
  // output: 'export',
  images: {
    unoptimized: true,
  },
  // Fix Supabase node-fetch issue
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  // Removed experimental.esmExternals as recommended by Next.js
};

export default nextConfig;
