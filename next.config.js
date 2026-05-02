const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
  webpack: (config) => {
    // Explicit @/* alias — don't rely on tsconfig path resolution alone.
    // Render's Linux build environment was failing to resolve the alias
    // for some routes; binding it here in webpack guarantees it works.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    config.externals = config.externals || [];
    config.externals.push({
      'pdf-parse': 'commonjs pdf-parse',
    });
    return config;
  },
};

module.exports = nextConfig;
