/** @type {import('next').NextConfig} */

console.log(
  'NEXT_CONFIG_MONGODB_URI: ',
  process.env.MONGODB_URI?.substring(0, 15) || 'NOT FOUND'
);

const nextConfig = {
  serverExternalPackages: ['mongodb'],
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

export default nextConfig;
