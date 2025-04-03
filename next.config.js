/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  env: {
    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
  },
  transpilePackages: ['react-leaflet'],
  webpack: (config) => {
    // Resolve the "Can't resolve module" issue during server-side rendering
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  // Configurar la aplicación para funcionar en modo de aplicación completo (no exportación estática)
  output: 'standalone',
  // Deshabilitar la generación estática para estas páginas
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Indicar a Next.js qué páginas requieren renderizado en el cliente
  // Esto evita errores de destructuración con useSession durante la compilación
  unstable_runtimeJS: true,
  staticPageGenerationTimeout: 120,
}

module.exports = nextConfig 