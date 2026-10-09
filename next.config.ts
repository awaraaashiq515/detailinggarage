import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Playwright and its native Node.js dependencies external from the bundle.
  // Without this, Next.js tries to bundle playwright and breaks its native bindings,
  // causing the API route to crash silently with an empty response body.
  serverExternalPackages: ["playwright", "playwright-core", "@playwright/browser-chromium"],

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
