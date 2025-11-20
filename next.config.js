/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Empty turbopack config to silence the warning when Next.js detects
  // a custom `webpack` config but no `turbopack` config. This keeps the
  // default Turbopack behaviour while avoiding the startup error.
  turbopack: {},
  // Optimize webpack for production builds on Windows (legacy support)
  webpack: (config, { isServer }) => {
    // Reduce memory usage on Windows
    config.optimization = {
      ...config.optimization,
      minimize: true,
      moduleIds: 'deterministic',
    };

    // Limit parallelism to prevent thread exhaustion on Windows
    config.parallelism = 1;

    // Reduce cache size
    config.cache = false;

    return config;
  },
  // Exclude test files and directories from build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].map(ext => {
    return ext
  }),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health',
      },
    ]
  },
}

module.exports = nextConfig
