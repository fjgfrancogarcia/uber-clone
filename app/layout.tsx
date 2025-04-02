import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Uber Clone",
  description: "Una aplicación clon de Uber creada con Next.js",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  )
} 