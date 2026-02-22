// import path from "path";
// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* Silence "webpack config but no turbopack config" when using Turbopack (default in Next 16 dev) */
//   turbopack: {},
//   /* Force resolution from project root when using webpack (e.g. next build or dev --no-turbopack) */
//   webpack: (config) => {
//     config.resolve = config.resolve ?? {};
//     const projectNodeModules = path.join(process.cwd(), "node_modules");
//     config.resolve.modules = [
//       projectNodeModules,
//       ...(Array.isArray(config.resolve.modules) ? config.resolve.modules : ["node_modules"]),
//     ];
//     return config;
//   },
// };

// export default nextConfig;
import path from "path";
import type { NextConfig } from "next";

// Optional: run with ANALYZE=true npm run analyze to open bundle size reports
let withBundleAnalyzer = (c: NextConfig) => c;
try {
  const bundleAnalyzer = require("@next/bundle-analyzer");
  withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });
} catch {
  // @next/bundle-analyzer not installed
}

const nextConfig: NextConfig = {
  turbopack: {},

  // Smaller serverless payload on Vercel (copies only needed deps)
  output: "standalone",

  // Keep these out of the serverless bundle to stay under Vercel's 250 MB limit
  serverExternalPackages: [
    "next-auth",
    "@prisma/client",
    "@prisma/adapter-pg",
    "prisma",
    "pg",
    "pg-native",
    "bcryptjs",
    "recharts",
    "pdf-lib",
    "qrcode",
  ],

  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ OPTIONAL (ignore ESLint errors too)
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    const projectRoot = process.cwd();
    const projectNodeModules = path.join(projectRoot, "node_modules");
    config.resolve.modules = [
      projectNodeModules,
      ...(Array.isArray(config.resolve.modules)
        ? config.resolve.modules
        : ["node_modules"]),
    ];
    // Force next-auth to resolve from project node_modules (fixes "Can't resolve 'next/auth'")
    config.resolve.alias = {
      ...config.resolve.alias,
      "next-auth": path.join(projectNodeModules, "next-auth"),
    };
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);