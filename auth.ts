import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcrypt"
import { prisma } from "./prisma/prisma"

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
        
        console.log("Iniciando autenticación para:", typedCredentials.email);
        
        // Este es un flujo simplificado para desarrollo
        if (!typedCredentials?.email || !typedCredentials?.password) {
          console.log("Error: Credenciales incompletas");
          return null;
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

        try {
          console.log("Buscando usuario en la base de datos...");
          // Buscar un usuario real en la base de datos
          const user = await prisma.user.findUnique({
            where: {
              email: typedCredentials.email
            }
          });

          if (!user) {
            console.log("Error: Usuario no encontrado");
            return null;
          }

          if (!user.password) {
            console.log("Error: Usuario no tiene contraseña configurada");
            return null;
          }

          console.log("Usuario encontrado, verificando contraseña...");
          // Verificar la contraseña utilizando bcrypt
          const passwordMatch = await compare(typedCredentials.password, user.password);
          
          if (!passwordMatch) {
            console.log("Error: Contraseña incorrecta");
            return null;
          }

          console.log("Autenticación exitosa para usuario:", user.email);
          // Retornar la información del usuario para la sesión
          return {
            id: user.id,
            name: user.name || "",
            email: user.email,
            role: user.role
          };
        } catch (error) {
          console.error("Error durante la autenticación:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("Generando JWT para usuario:", user.email);
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        console.log("Configurando sesión para usuario:", session.user.email);
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "DRIVER" | "ADMIN";
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin"
  },
  debug: true, // Habilitamos el modo debug para ver más información
}) 