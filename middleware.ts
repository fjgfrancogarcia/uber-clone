import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Función para verificar el token JWT manualmente sin depender de auth.ts
async function verifyToken(request: NextRequest) {
  try {
    const token = request.cookies.get('next-auth.session-token')?.value

    if (!token) {
      return null
    }

    // Verificar el token usando jose (que es compatible con el navegador)
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || '')
    const { payload } = await jwtVerify(token, secret)
    
    return payload
  } catch (error) {
    console.error('Error al verificar el token:', error)
    return null
  }
}

export async function middleware(request: NextRequest) {
  // MODO DESARROLLO: Permitir todas las rutas sin autenticación para pruebas
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true') {
    return NextResponse.next()
  }

  const token = await verifyToken(request)
  
  // Rutas públicas: permitir acceso sin verificación
  if (
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/auth') || 
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/images') ||
    request.nextUrl.pathname.includes('favicon')
  ) {
    return NextResponse.next()
  }
  
  // Si el usuario no está autenticado y trata de acceder a una ruta protegida,
  // redirigir a la página de inicio de sesión
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url)
    return NextResponse.redirect(signInUrl)
  }

  // Proteger rutas específicas para conductores
  if (token?.role !== 'DRIVER' && 
      request.nextUrl.pathname.startsWith('/rides/available')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Proteger rutas para administradores
  if (token?.role !== 'ADMIN' && 
      request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Configurar las rutas a las que se aplica el middleware
export const config = {
  matcher: [
    // Rutas que requieren autenticación
    '/((?!_next/static|_next/image|favicon.ico|public|api/webhook).*)',
  ],
} 