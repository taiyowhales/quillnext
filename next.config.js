/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
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

