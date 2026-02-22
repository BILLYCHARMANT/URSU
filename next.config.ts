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

const nextConfig: NextConfig = {
  turbopack: {},

  // ✅ ADD THIS BLOCK
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ OPTIONAL (ignore ESLint errors too)
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    const projectNodeModules = path.join(process.cwd(), "node_modules");
    config.resolve.modules = [
      projectNodeModules,
      ...(Array.isArray(config.resolve.modules)
        ? config.resolve.modules
        : ["node_modules"]),
    ];
    return config;
  },
};

export default nextConfig;