/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  experimental: {
    instrumentationHook: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "is1-ssl.mzstatic.com",
        pathname: "**",
      },
    ],
  },
  webpack: (config) => {
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/stream-proxy/:hostname/:path*",
        destination: "https://:hostname/:path*",
      },
      {
        source: "/itunes-api/:path*",
        destination: "https://itunes.apple.com/:path*",
      },
      {
        source: "/apple-music/:path*",
        destination: "https://music.apple.com/us/artist/:path*",
      },
    ];
  },
};

export default nextConfig;
