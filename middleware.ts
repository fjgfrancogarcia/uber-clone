import { NextRequest, NextResponse } from 'next/server'
import { getToken as getJwtToken } from 'next-auth/jwt'

// Middleware para proteger rutas y redireccionar según el rol del usuario
export async function middleware(request: NextRequest) {
  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
  ]

  // Si la ruta es pública, permitir acceso
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Si es una API o un recurso estático, permitir acceso
  if (
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Verificar token de sesión
  const token = await getJwtToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Si no hay token, redireccionar a inicio de sesión
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Protección de rutas según el rol
  const { role } = token
  const path = request.nextUrl.pathname

  // Rutas de pasajero
  if (path.startsWith('/passenger') && role !== 'USER' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Rutas de conductor
  if ((path.startsWith('/driver') || path.startsWith('/rides')) && role !== 'DRIVER' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Rutas de administrador
  if (path.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Permitir acceso si todas las verificaciones pasan
  return NextResponse.next()
}

// Configurar las rutas a las que se aplica el middleware
export const config = {
  matcher: [
    /*
     * Haciendo match con todas las rutas excepto:
     * - _next (archivos estáticos de Next.js)
     * - api (rutas API del servidor, se protegen en el lado del servidor)
     * - archivos con extensión (imágenes, favicon, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 