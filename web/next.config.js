/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    return config;
  },
  // Vercel optimizations
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["mongodb"],
  },
  // Enable static optimization
  trailingSlash: false,
  // Optimize images
  images: {
    domains: ["localhost"],
    unoptimized: false,
  },
};

module.exports = nextConfig;
