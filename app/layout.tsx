'use client'

import { SessionProvider } from "next-auth/react"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}

// Metadata se define ahora en un archivo separado debido a que este es un componente cliente
export const metadata = {
  title: "Uber Clone",
  description: "Una aplicación clon de Uber creada con Next.js",
} 