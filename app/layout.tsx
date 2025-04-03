'use client'

import { SessionProvider } from "next-auth/react"
import "./globals.css"
import Navbar from "./components/Navbar"
import dynamic from 'next/dynamic'

// Importar Toaster de forma dinámica para evitar problemas en la compilación
const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => mod.Toaster),
  { ssr: false }
)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <SessionProvider>
          <Navbar />
          <main>
            {children}
          </main>
          <Toaster position="top-center" toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }} />
        </SessionProvider>
      </body>
    </html>
  )
} 