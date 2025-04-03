/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'images.unsplash.com'],
  },
  env: {
    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
  },
  transpilePackages: ['react-leaflet'],
  webpack: (config, { isServer }) => {
    // Resolve the "Can't resolve module" issue during server-side rendering
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
    };

    // Ignorar módulos de solo servidor durante la compilación del cliente
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Estos módulos solo deberían ejecutarse en el servidor
        bcrypt: false,
        'jsonwebtoken': false,
        '@mapbox/node-pre-gyp': false,
        'node-pre-gyp': false,
      };
    }

    return config;
  },
  // Configurar la aplicación para funcionar en modo de aplicación completo (no exportación estática)
  output: 'standalone',
  // Deshabilitar la generación estática para estas páginas
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Aumentar el tiempo de generación de páginas estáticas
  staticPageGenerationTimeout: 120,
}

module.exports = nextConfig 