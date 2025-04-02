import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Configuración para NextAuth v5
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Este es un flujo simplificado para desarrollo
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // En producción, deberías verificar correctamente las credenciales
        // Para pruebas, autenticamos con credenciales de prueba
        if (credentials.email === "test@example.com" && credentials.password === "password") {
          return {
            id: "test-user-id",
            name: "Usuario de Prueba",
            email: "test@example.com",
            role: "USER"
          }
        }

        // O buscar un usuario real en la base de datos
        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user || !user.password) {
            return null
          }

          // En producción, deberías usar bcrypt para comparar contraseñas
          if (user.password !== credentials.password) {
            return null
          }

          return {
            id: user.id,
            name: user.name || "",
            email: user.email,
            role: user.role
          }
        } catch (error) {
          console.error("Error al verificar credenciales:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin"
  },
  debug: process.env.NODE_ENV === "development",
}) 