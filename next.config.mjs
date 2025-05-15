/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization where possible
  reactStrictMode: true,
  // Ensure proper handling of API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  // Ensure proper handling of images and other assets
  images: {
    domains: ['lh3.googleusercontent.com'], // Add any other domains you need
  },
  // Ensure proper handling of environment variables
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  serverExternalPackages: ['mongodb'],
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

export default nextConfig;
