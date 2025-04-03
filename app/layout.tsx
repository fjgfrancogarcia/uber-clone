import "./globals.css"
import { Providers } from "./providers"
import Navbar from "./components/Navbar"
import { Metadata } from 'next'
import { Inter } from 'next/font/google'

// Cargar la fuente Inter
const inter = Inter({ subsets: ['latin'] })

// Configurar la metadata
export const metadata: Metadata = {
  title: 'ChauTuTaxi - Servicio de Transporte',
  description: 'Plataforma para conectar pasajeros con conductores',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
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