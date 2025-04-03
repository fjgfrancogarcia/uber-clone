import { NextRequest, NextResponse } from 'next/server'

// Middleware completamente deshabilitado para permitir el desarrollo sin autenticación
export async function middleware(request: NextRequest) {
  // Permitir acceso a todas las rutas sin autenticación
  return NextResponse.next()
}

// Configurar las rutas a las que se aplica el middleware (ninguna por ahora)
export const config = {
  matcher: [],
} 