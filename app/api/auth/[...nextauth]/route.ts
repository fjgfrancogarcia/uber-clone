import NextAuth from "next-auth";
import { authOptions } from "../../../../auth";

// Crear un handler con las opciones de autenticación
const handler = NextAuth(authOptions);

// Exportar los métodos directamente del handler para compatibilidad con App Router
export { handler as GET, handler as POST }; 