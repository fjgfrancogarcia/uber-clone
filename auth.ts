import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma/prisma"

// Definir la interfaz para las credenciales
interface Credentials {
  email: string;
  password: string;
}

// Configuración para NextAuth v5 beta.4
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
        try {
          // Asegurar que credentials sea del tipo correcto
          const typedCredentials = credentials as Credentials;
          
          console.log("Iniciando autenticación para:", typedCredentials.email);
          
          // Este es un flujo simplificado para desarrollo
          if (!typedCredentials?.email || !typedCredentials?.password) {
            console.log("Error: Credenciales incompletas");
            throw new Error("Email y contraseña son requeridos");
          }

          // En producción, deberías verificar correctamente las credenciales
          // Para pruebas, autenticamos con credenciales de prueba
          if (typedCredentials.email === "test@example.com" && typedCredentials.password === "password") {
            console.log("Autenticación exitosa para usuario de prueba");
            return {
              id: "test-user-id",
              name: "Usuario de Prueba",
              email: "test@example.com",
              role: "USER"
            };
          }

          // La lógica de verificación real de contraseñas se ha movido a una API
          // para evitar incluir bcrypt en el bundle del cliente
          try {
            // Llamar a la API de verificación de credenciales
            const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/verify-credentials`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: typedCredentials.email,
                password: typedCredentials.password
              }),
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || "Error de autenticación");
            }

            const userData = await response.json();
            return userData;
          } catch (error: any) {
            console.error("Error al verificar credenciales:", error.message);
            throw new Error(error.message || "Error al verificar credenciales");
          }
        } catch (error: any) {
          console.error("Error durante authorize:", error.message);
          // Propagar el error para mejor diagnóstico
          throw new Error(error.message || "Error durante la autenticación");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          console.log("Generando JWT para usuario:", user.email);
          token.id = user.id;
          token.role = user.role;
        }
        return token;
      } catch (error: any) {
        console.error("Error en callback jwt:", error.message);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          console.log("Configurando sesión para usuario:", session.user.email);
          session.user.id = token.id as string;
          session.user.role = token.role as "USER" | "DRIVER" | "ADMIN";
        }
        return session;
      } catch (error: any) {
        console.error("Error en callback session:", error.message);
        return session;
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 24 horas
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  debug: true // Habilitamos el modo debug para ver más información
}) 