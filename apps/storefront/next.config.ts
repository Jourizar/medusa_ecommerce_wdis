import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  rewrites: async () => [
    {
      source: "/api/medusa/:path*",
      destination: `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/:path*`,
    },
  ],
  logging: {
    fetches: { fullUrl: true },
  },
};

export default nextConfig;
