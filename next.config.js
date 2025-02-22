/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      enabled: true
    }
  },
  env: {
    PORT: "1001"
  }
}

module.exports = nextConfig 