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
  },
  webpack: (config, { isServer }) => {
    // Ignorar módulos específicos que no son necesarios
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'cpu-features': false,
      './crypto/build/Release/sshcrypto.node': false
    };

    return config;
  },
  // Ignorar errores de ESLint en producción
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar errores de TypeScript en producción
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig 