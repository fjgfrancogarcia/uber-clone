import { NextRequest, NextResponse } from "next/server"

// Manejadores temporales que simplemente devuelven respuestas vacías para permitir la compilación
export async function GET(request: NextRequest) {
  return new NextResponse(
    JSON.stringify({ status: "disabled-for-build" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function POST(request: NextRequest) {
  return new NextResponse(
    JSON.stringify({ status: "disabled-for-build" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
} 