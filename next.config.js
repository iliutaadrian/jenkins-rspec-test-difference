/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ["tailwindui.com"],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });
    return config;
  },
};

module.exports = nextConfig;
