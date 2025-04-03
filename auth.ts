import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcrypt"  // Importar bcrypt directamente
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
          
          // Validaciones básicas
          if (!typedCredentials?.email || !typedCredentials?.password) {
            console.log("Error: Credenciales incompletas");
            throw new Error("Email y contraseña son requeridos");
          }

          // Para credenciales de prueba conocidas
          if (typedCredentials.email === "test@example.com" && typedCredentials.password === "password") {
            console.log("Autenticación exitosa para usuario de prueba");
            return {
              id: "test-user-id",
              name: "Usuario de Prueba",
              email: "test@example.com",
              role: "USER"
            };
          }

          // Buscar el usuario directamente en la base de datos
          const user = await prisma.user.findUnique({
            where: { email: typedCredentials.email }
          });

          if (!user) {
            console.log(`Usuario no encontrado: ${typedCredentials.email}`);
            throw new Error("Credenciales incorrectas");
          }

          // Verificar que el usuario tenga una contraseña configurada
          if (!user.password) {
            console.log(`Error: Usuario sin contraseña configurada: ${user.email}`);
            throw new Error("Usuario no tiene contraseña configurada");
          }

          // Verificar la contraseña usando bcrypt directamente
          const passwordMatch = await compare(typedCredentials.password, user.password);
          
          if (!passwordMatch) {
            console.log(`Error: Contraseña incorrecta para: ${user.email}`);
            throw new Error("Credenciales incorrectas");
          }

          console.log(`Autenticación exitosa para: ${user.email}`);
          return {
            id: user.id,
            name: user.name || "",
            email: user.email,
            role: user.role
          };
        } catch (error: any) {
          console.error("Error durante authorize:", error.message);
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
  debug: process.env.NODE_ENV !== "production" // Solo habilitar debug en desarrollo
}) 