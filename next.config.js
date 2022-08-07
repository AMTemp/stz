/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    urlImports: ['https://cdn.jsdelivr.net'],
  }
}

module.exports = nextConfig
