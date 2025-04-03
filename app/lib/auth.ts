import { NextRequest } from 'next/server'
import { UserData } from '../../types/auth'
import { cookies } from 'next/headers'

// Función para obtener el usuario desde las cookies en el servidor
export async function getUserFromCookie(request?: NextRequest): Promise<UserData | null> {
  try {
    // En una aplicación real, esta función verificaría un token JWT
    // y lo decodificaría para obtener información del usuario
    
    // Para esta demo, simulamos un usuario autenticado
    // En producción, usaríamos algo como:
    // const token = request ? request.cookies.get('token')?.value : getCookie('token')
    // if (!token) return null
    // const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as UserData
    
    // Simular un usuario autenticado
    // Para demo, alternamos entre roles basado en la ruta
    const path = typeof window !== 'undefined' ? window.location.pathname : ''
    
    // Si estamos en una ruta de conductor, devolver un usuario conductor
    if (path.includes('/driver') || path.includes('/rides/available')) {
      return {
        id: 'driver-123',
        name: 'Conductor Demo',
        email: 'conductor@ejemplo.com',
        role: 'DRIVER',
        createdAt: new Date().toISOString()
      }
    }
    
    // Usuario regular por defecto
    return {
      id: 'user-123',
      name: 'Usuario Demo',
      email: 'usuario@ejemplo.com',
      role: 'USER',
      createdAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error al obtener usuario desde cookie:', error)
    return null
  }
}

// Versión del lado del cliente para obtener el usuario actual
export async function getCurrentUser(): Promise<{ success: boolean; user?: UserData; error?: string }> {
  try {
    // En una implementación real, haríamos una solicitud al endpoint /api/auth/me
    // Para esta demo, simulamos la respuesta
    
    const path = window.location.pathname
    
    // Simular un usuario conductor si estamos en una ruta relacionada
    if (path.includes('/driver') || path.includes('/rides/available')) {
      return {
        success: true,
        user: {
          id: 'driver-123',
          name: 'Conductor Demo',
          email: 'conductor@ejemplo.com',
          role: 'DRIVER',
          createdAt: new Date().toISOString()
        }
      }
    }
    
    // Usuario regular por defecto
    return {
      success: true,
      user: {
        id: 'user-123',
        name: 'Usuario Demo',
        email: 'usuario@ejemplo.com',
        role: 'USER',
        createdAt: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Error al obtener usuario actual:', error)
    return {
      success: false,
      error: 'Error al obtener información del usuario'
    }
  }
} 