import NextAuth from "next-auth";
import { authOptions } from "../../../../auth";

// Crear manejador de NextAuth con las opciones definidas
const handler = NextAuth(authOptions);

// Exportar funciones de manejador para rutas GET y POST
export const GET = handler;
export const POST = handler; 