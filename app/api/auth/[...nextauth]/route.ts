import NextAuth from "next-auth";
import { authOptions } from "../../../../auth";

// Implementación directa sin el import del handler
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions); 