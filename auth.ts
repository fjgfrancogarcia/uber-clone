import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma/prisma';
import bcrypt from 'bcrypt';

// Define la interfaz de credenciales
interface Credentials {
  email: string;
  password: string;
}

// Configura NextAuth
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const { email, password } = credentials as Credentials;

        try {
          // Usuarios de prueba para desarrollo
          if (email === 'test@example.com' && password === 'password') {
            return {
              id: 'test-user-id',
              name: 'Usuario de Prueba',
              email: 'test@example.com',
              role: 'USER'
            };
          }

          // Admin de prueba
          if (email === 'admin@example.com' && password === 'admin123') {
            return {
              id: 'admin-user-id',
              name: 'Administrador',
              email: 'admin@example.com',
              role: 'ADMIN'
            };
          }

          // Buscar usuario real en la base de datos
          const user = await prisma.user.findUnique({
            where: { email }
          });

          if (!user || !user.password) {
            console.log('Usuario no encontrado o sin contraseña');
            return null;
          }

          // Verificar contraseña
          const passwordMatch = await bcrypt.compare(password, user.password);
          
          if (!passwordMatch) {
            console.log('Contraseña incorrecta');
            return null;
          }

          return {
            id: user.id,
            name: user.name || "",
            email: user.email,
            role: user.role
          };
        } catch (error) {
          console.error('Error en authorize:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// Función auxiliar para usar en el middleware y otros lugares
export async function auth() {
  return { auth: null };
} 