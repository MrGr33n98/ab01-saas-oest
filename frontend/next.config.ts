import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Keep standalone tracing scoped to this deployable app. Without it, a
  // lockfile outside of `frontend/` can make Next trace the parent workspace.
  outputFileTracingRoot: __dirname,
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
