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
  // Forzar modo dinámico
  dynamicParams: true,
  // Deshabilitar la generación estática
  staticPageGenerationTimeout: 0,
  generateStaticParams: false,
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
  },
  // Deshabilitar la generación estática de la página 404
  staticPages: {
    '/404': false
  }
}

module.exports = nextConfig 