import { NextRequest, NextResponse } from 'next/server'

// Middleware simplificado que permite todas las solicitudes
export async function middleware(request: NextRequest) {
  // Permitir todas las solicitudes sin verificación
  return NextResponse.next()
}

// Configurar las rutas a las que se aplica el middleware (ninguna por ahora)
export const config = {
  matcher: [],
} 