/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      enabled: true
    }
  },
  output: 'standalone',
  env: {
    PORT: "1001"
  }
}

module.exports = nextConfig 