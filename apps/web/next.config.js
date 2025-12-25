/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: 'output: export' is only for static builds (npm run build)
  // For development (npm run dev), we need server-side rendering
  // output: 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
