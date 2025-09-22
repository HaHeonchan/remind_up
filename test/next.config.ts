import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: '**',
      },
    ],
  },
  serverExternalPackages: ['nodemailer'],
  experimental: {
    serverComponentsExternalPackages: ['nodemailer'],
  },
  output: 'standalone',
};

export default nextConfig;
