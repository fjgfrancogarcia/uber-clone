import NextAuth from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "../../../../auth"

// Implementación específica para App Router
export async function GET(request: NextRequest) {
  return await NextAuth(authOptions)({
    req: {
      headers: Object.fromEntries(request.headers),
      method: request.method,
      query: Object.fromEntries(new URL(request.url).searchParams),
      cookies: Object.fromEntries(
        request.cookies.getAll().map((c) => [c.name, c.value])
      ),
    },
    // Simplify by adding empty res object
    res: NextResponse.next(),
  }) as unknown as Response;
}

export async function POST(request: NextRequest) {
  return await NextAuth(authOptions)({
    req: {
      headers: Object.fromEntries(request.headers),
      method: request.method,
      body: await request.json().catch(() => ({})),
      query: Object.fromEntries(new URL(request.url).searchParams),
      cookies: Object.fromEntries(
        request.cookies.getAll().map((c) => [c.name, c.value])
      ),
    },
    // Simplify by adding empty res object
    res: NextResponse.next(),
  }) as unknown as Response;
} 