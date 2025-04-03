import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { compare } from "bcrypt"

const prisma = new PrismaClient()

// Definir la interfaz para las credenciales
interface Credentials {
  email: string;
  password: string;
}

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
        // Asegurar que credentials sea del tipo correcto
        const typedCredentials = credentials as Credentials;
        
        // Este es un flujo simplificado para desarrollo
        if (!typedCredentials?.email || !typedCredentials?.password) {
          return null
        }

        // En producción, deberías verificar correctamente las credenciales
        // Para pruebas, autenticamos con credenciales de prueba
        if (typedCredentials.email === "test@example.com" && typedCredentials.password === "password") {
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
              email: typedCredentials.email
            }
          })

          if (!user || !user.password) {
            return null
          }

          // Verificar la contraseña utilizando bcrypt
          const passwordMatch = await compare(typedCredentials.password, user.password)
          
          if (!passwordMatch) {
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
        session.user.role = token.role as "USER" | "DRIVER" | "ADMIN"
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