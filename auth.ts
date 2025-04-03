// Este archivo solo debe ejecutarse en el servidor
'use server';

import jwt from 'jsonwebtoken';
import { prisma } from './prisma/prisma';
import bcrypt from 'bcrypt';

// Definir tipo para los roles de usuario
export type UserRole = 'USER' | 'DRIVER' | 'ADMIN';

// Definir interfaz para credenciales
export interface Credentials {
  email: string;
  password: string;
}

// Definir interfaz para datos de usuario
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Configuración
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'mi-secreto-temporal';
const JWT_EXPIRES_IN = '30d';

// Función para verificar credenciales
export async function verifyCredentials(credentials: Credentials): Promise<UserData | null> {
  const { email, password } = credentials;

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
      role: user.role as UserRole
    };
  } catch (error) {
    console.error('Error en verificación de credenciales:', error);
    return null;
  }
}

// Generar token JWT
export async function generateToken(user: UserData): Promise<string> {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verificar token JWT
export async function verifyToken(token: string): Promise<UserData | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserData;
    return decoded;
  } catch (error) {
    console.error('Error al verificar token:', error);
    return null;
  }
}

// Funciones de utilidad para gestionar cookies
export const getCookieExpirationDate = async () => {
  const date = new Date();
  date.setDate(date.getDate() + 30); // Expira en 30 días
  return date;
}; 