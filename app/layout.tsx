'use client'

import { SessionProvider } from "next-auth/react"
import "./globals.css"
import Navbar from "./components/Navbar"
import dynamic from 'next/dynamic'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'

// Cargar la fuente Inter
const inter = Inter({ subsets: ['latin'] })

// Importar Toaster de forma dinámica para evitar problemas en la compilación
const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => mod.Toaster),
  { ssr: false }
)

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
        <SessionProvider>
          <Navbar />
          <main className="min-h-screen pt-16 pb-8 bg-gray-50">
            {children}
          </main>
          <Toaster position="top-center" toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: 'white',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: 'white',
              },
            },
          }} />
        </SessionProvider>
      </body>
    </html>
  )
} 