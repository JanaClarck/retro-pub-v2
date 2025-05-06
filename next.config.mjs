/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/**',
      },
    ],
    unoptimized: true, // Required for static export
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    return config;
  },
  // Enable static exports
  output: 'export',
  // Disable server features that are not compatible with static export
  experimental: {
    appDocumentPreloading: false,
  },
  // Disable server actions for static export
  serverActions: false,
}

export default nextConfig; 