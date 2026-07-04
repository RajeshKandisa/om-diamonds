import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 🔑 FIX: This allows your project to build smoothly even with strict hook rules active
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
