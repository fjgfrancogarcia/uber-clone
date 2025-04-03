import NextAuth from 'next-auth';
import { authOptions } from '../../../../auth';

// Crear y exportar directamente las funciones GET y POST
const handler = NextAuth(authOptions);
export const GET = handler;
export const POST = handler; 