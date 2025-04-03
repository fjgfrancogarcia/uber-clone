import { NextRequest, NextResponse } from 'next/server'
import { auth } from './auth'

export async function middleware(request: NextRequest) {
  const session = await auth()
  
  // Si el usuario no está autenticado y trata de acceder a una ruta protegida,
  // redirigir a la página de inicio de sesión
  if (!session && 
      !request.nextUrl.pathname.startsWith('/auth') && 
      !request.nextUrl.pathname.startsWith('/api/auth')) {
    const signInUrl = new URL('/auth/signin', request.url)
    return NextResponse.redirect(signInUrl)
  }

  // Si un conductor inicia sesión, redirigirlo a la página de viajes disponibles
  if (session?.user?.role === 'DRIVER' && 
      request.nextUrl.pathname === '/' && 
      request.headers.get('referer')?.includes('/auth/signin')) {
    return NextResponse.redirect(new URL('/rides/available', request.url))
  }

  // Proteger rutas específicas para conductores
  if (session?.user?.role !== 'DRIVER' && 
      request.nextUrl.pathname.startsWith('/rides/available')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Proteger rutas para administradores
  if (session?.user?.role !== 'ADMIN' && 
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