import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    // Enable Next.js Image Optimization for better bandwidth usage
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Allow loading images from public folder
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  turbopack: {},
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig as any);
