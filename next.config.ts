import type { NextConfig } from "next";

/**
 * Next.js Configuration
 * Fixed: allowedDevOrigins moved to top-level property for recent Next.js versions.
 */
const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Property allowedDevOrigins is now top-level, not inside experimental
  allowedDevOrigins: ['127.0.0.1', 'localhost', '192.168.101.14'],

  // Security HTTP Headers — applied to all routes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent the site from being embedded in an iframe (Clickjacking protection)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent browsers from MIME-sniffing the content type
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Control how much referrer information is shared
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable access to sensitive browser features
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Legacy XSS protection for older browsers
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Report-only Content Security Policy to observe violations without blocking.
          // Review reports and then consider switching to a blocking CSP.
          {
            key: 'Content-Security-Policy-Report-Only',
            value: "default-src 'self'; img-src 'self' data: https:; frame-src 'self' https://maps.google.com https://www.google.com; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;