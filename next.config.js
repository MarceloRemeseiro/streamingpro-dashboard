/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      enabled: true
    }
  },
  env: {
    PORT: "1001"
  },
  webpack: (config) => {
    // Ignorar módulos problemáticos
    config.resolve.alias = {
      ...config.resolve.alias,
      'ssh2': false,
      './crypto/build/Release/sshcrypto.node': false
    };

    // Deshabilitar caché para evitar problemas de resolución
    config.cache = false;

    // Configurar fallbacks para módulos nativos
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'fs': false,
      'net': false,
      'tls': false,
      'crypto': false
    };

    return config;
  }
}

module.exports = nextConfig 