import NextAuth from "next-auth";
import { authOptions } from "../../../../auth";

// Importar el handler directamente desde auth.ts
import auth from "../../../../auth";

// Exportar funciones de manejador para rutas GET y POST
export const GET = auth;
export const POST = auth; 