import path from "node:path";
import type { NextConfig } from "next";

// Allow product images from the Medusa backend (uploads) wherever it's hosted.
const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
const medusaHost = medusaUrl ? new URL(medusaUrl).hostname : "localhost";
const medusaProtocol = medusaUrl?.startsWith("https") ? "https" : "http";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (no node_modules copy).
  output: "standalone",
  // Monorepo: trace dependencies from the repo root.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  images: {
    // AVIF where supported (typically ~20-30% smaller than WebP), else WebP.
    formats: ["image/avif", "image/webp"],
    // Keep this list tight — every allowed host can be proxied through
    // the Next.js image optimizer.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: medusaProtocol,
        hostname: medusaHost,
        pathname: "/static/**",
      },
    ],
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: securityHeaders,
    },
  ],
  logging: {
    fetches: { fullUrl: true },
  },
};

export default nextConfig;
