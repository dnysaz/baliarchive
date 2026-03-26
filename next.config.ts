import type { NextConfig } from "next";

/**
 * Next.js Configuration
 * Fixed: allowedDevOrigins moved to top-level property for recent Next.js versions.
 */
const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Property allowedDevOrigins is now top-level, not inside experimental
  allowedDevOrigins: ['127.0.0.1', 'localhost', '192.168.101.15'],
};

export default nextConfig;