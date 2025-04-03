import NextAuth from "next-auth";
import { authOptions } from "../../../../auth";
import { NextRequest } from "next/server";

const handler = NextAuth(authOptions);

// Exportar manejadores como funciones - formato compatible con App Router
export async function GET(req: NextRequest) {
  return await handler(req);
}

export async function POST(req: NextRequest) {
  return await handler(req);
} 