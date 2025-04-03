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
  const token = await verifyToken(request)
  
  // Permitimos el acceso a la página de inicio sin autenticación
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next()
  }
  
  // Si el usuario no está autenticado y trata de acceder a una ruta protegida,
  // redirigir a la página de inicio de sesión
  if (!token && 
      !request.nextUrl.pathname.startsWith('/auth') && 
      !request.nextUrl.pathname.startsWith('/api/auth') &&
      !request.nextUrl.pathname.startsWith('/_next') &&
      !request.nextUrl.pathname.startsWith('/images') &&
      !request.nextUrl.pathname.startsWith('/favicon.ico')) {
    const signInUrl = new URL('/auth/signin', request.url)
    return NextResponse.redirect(signInUrl)
  }

  // Si un conductor inicia sesión, redirigirlo a la página de viajes disponibles
  if (token?.role === 'DRIVER' && 
      request.nextUrl.pathname === '/' && 
      request.headers.get('referer')?.includes('/auth/signin')) {
    return NextResponse.redirect(new URL('/rides/available', request.url))
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