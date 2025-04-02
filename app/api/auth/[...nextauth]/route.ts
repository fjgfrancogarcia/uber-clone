// Este archivo está temporalmente comentado para evitar errores de compatibilidad
// entre NextAuth 5.0.0-beta.4 y Next.js 14.1.0

// import { PrismaAdapter } from "@auth/prisma-adapter"
// import { PrismaClient } from "@prisma/client"
// import NextAuth from "next-auth"
// import GoogleProvider from "next-auth/providers/google"
// import CredentialsProvider from "next-auth/providers/credentials"

// const prisma = new PrismaClient()

// // Configuración simplificada para desarrollo
// const handler = NextAuth({
//   providers: [
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" }
//       },
//       async authorize(credentials) {
//         // Un usuario de prueba para desarrollo
//         if (credentials?.email === "test@example.com" && credentials?.password === "password") {
//           return {
//             id: "1",
//             name: "Test User",
//             email: "test@example.com",
//             role: "USER"
//           }
//         }
//         return null
//       }
//     })
//   ],
//   session: {
//     strategy: "jwt"
//   },
//   pages: {
//     signIn: "/auth/signin",
//   },
//   secret: process.env.NEXTAUTH_SECRET || "dev-secret-do-not-use-in-production"
// })

// export { handler as GET, handler as POST }

import { handlers } from "../../../../auth"

export const { GET, POST } = handlers

// Crear un manejador vacío para evitar errores
export async function GET() {
  return new Response(JSON.stringify({ message: 'Auth temporarily disabled' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST() {
  return new Response(JSON.stringify({ message: 'Auth temporarily disabled' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
} 