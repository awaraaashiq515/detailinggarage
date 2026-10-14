import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Keep heavy native/worker dependencies external from the Turbopack bundle.
  serverExternalPackages: [
    "playwright",
    "playwright-core",
    "@playwright/browser-chromium",
    "sharp",
    "tesseract.js"
  ],

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
