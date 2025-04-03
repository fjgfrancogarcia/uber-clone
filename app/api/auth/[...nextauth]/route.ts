import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import { authOptions } from "../../../../auth";

async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const nextAuthHandler = NextAuth(authOptions);

  // Convertir la Request de App Router a NextApiRequest/Response
  const res = await nextAuthHandler({
    headers: Object.fromEntries(req.headers),
    method: req.method,
    query: Object.fromEntries(searchParams.entries()),
    body: await req.json().catch(() => null),
  } as unknown as NextApiRequest, {} as NextApiResponse);

  return new Response(JSON.stringify(res.body), {
    status: res.status || 200,
    headers: Object.entries(res.headers || {}).reduce((acc, [key, value]) => {
      acc[key] = String(value); // Convertir a string para garantizar compatibilidad
      return acc;
    }, {} as Record<string, string>),
  });
}

export async function GET(req: Request) {
  return handler(req);
}

export async function POST(req: Request) {
  return handler(req);
} 