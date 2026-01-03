import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Higher quality settings for vehicle images
    qualities: [60, 75, 85, 90, 100],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for thumbnails and smaller images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Increase default quality
    minimumCacheTTL: 60 * 60 * 24, // 24 hours cache
  },
};

export default nextConfig;
