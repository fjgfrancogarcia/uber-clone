import "./globals.css"
import { Providers } from "./providers"
import Navbar from "./components/Navbar"
import { Metadata } from 'next'
import { Inter } from 'next/font/google'

// Cargar la fuente Inter
const inter = Inter({ subsets: ['latin'] })

// El Toaster se importará dinámicamente dentro del componente Providers
// para mantener la compatibilidad con SSR

export const metadata: Metadata = {
  title: 'Uber Clone',
  description: 'Aplicación de transporte creada con Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Incluir hoja de estilos de Leaflet en el head */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
          integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
          crossOrigin=""
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen pt-16 pb-8 bg-gray-50">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
} 