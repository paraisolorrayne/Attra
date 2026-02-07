import type { NextConfig } from "next";

// Security headers configuration
const securityHeaders = [
  // Prevent XSS attacks by controlling resource loading
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Scripts: self, inline (for Next.js), eval (for dev), and trusted CDNs
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.youtube.com https://s.ytimg.com https://connect.facebook.net https://static.hotjar.com https://script.hotjar.com https://www.clarity.ms https://clarity.ms",
      // Styles: self and inline (required for styled-components/emotion/tailwind)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Images: self, data URIs, blobs, and external sources
      "img-src 'self' data: blob: https: http:",
      // Fonts: self and Google Fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      // Connect: API endpoints and analytics
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://*.hotjar.com https://*.hotjar.io wss://*.hotjar.com https://webhook.dexidigital.com.br https://api.resend.com https://*.clarity.ms https://clarity.ms wss://*.clarity.ms",
      // Frames: YouTube embeds and same origin
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
      // Media: self and external sources
      "media-src 'self' https: blob:",
      // Objects: none (no Flash/plugins)
      "object-src 'none'",
      // Base URI: self only
      "base-uri 'self'",
      // Form actions: self only
      "form-action 'self'",
      // Frame ancestors: prevent clickjacking
      "frame-ancestors 'self'",
      // Upgrade insecure requests in production
      process.env.NODE_ENV === 'production' ? "upgrade-insecure-requests" : "",
    ].filter(Boolean).join('; ')
  },
  // Prevent MIME type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  // Prevent clickjacking
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  // Control referrer information
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  // Control browser features/APIs
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=()',
      'geolocation=(self)',
      'interest-cohort=()',
      'payment=(self)',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ].join(', ')
  },
  // Force HTTPS (only in production)
  ...(process.env.NODE_ENV === 'production' ? [{
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  }] : []),
  // Prevent XSS in older browsers
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
];

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Disable source maps in production for security
  productionBrowserSourceMaps: false,
  // Powered by header removal
  poweredByHeader: false,
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
  // Apply security headers to all routes
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Extra strict headers for admin routes
        source: '/admin/:path*',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          },
        ],
      },
      {
        // Prevent caching of API responses with sensitive data
        source: '/api/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate'
          },
        ],
      },
    ];
  },
};

export default nextConfig;
