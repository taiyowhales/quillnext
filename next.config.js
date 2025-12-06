/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Disable Turbopack for production builds to fix Prisma 7 compatibility
    // Turbopack has known issues with Prisma 7's module resolution
    turbo: false,
  },
  // Transpile Prisma Client to handle TypeScript files in node_modules
  transpilePackages: [
    '@prisma/client',
    '.prisma/client',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Webpack configuration to handle Prisma Client resolution
  // Fixes Turbopack/Prisma 7 compatibility issues with module resolution
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure proper module resolution for Prisma Client
      // This helps with Turbopack compatibility issues
      config.resolve = {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
        },
      };
      // Add node_modules to resolve paths
      config.resolve.modules = [
        ...(config.resolve.modules || []),
        path.resolve(__dirname, 'node_modules'),
      ];
    }
    return config;
  },
};

module.exports = nextConfig;

