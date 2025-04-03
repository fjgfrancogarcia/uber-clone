import { NextRequest } from 'next/server'
import { UserData } from '../../types/auth'

// Función para obtener el usuario desde las cookies
export async function getUserFromCookie(request: NextRequest): Promise<UserData | null> {
  try {
    // En una aplicación real, esta función verificaría un token JWT
    // y lo decodificaría para obtener información del usuario
    
    // Para esta demo, simulamos un usuario autenticado
    // En producción, usaríamos algo como:
    // const token = request.cookies.get('token')?.value
    // if (!token) return null
    // const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as UserData
    
    // Simular un usuario autenticado con rol USER
    return {
      id: 'user-123',
      name: 'Usuario Demo',
      email: 'usuario@ejemplo.com',
      role: 'USER'
    }
  } catch (error) {
    console.error('Error al obtener usuario desde cookie:', error)
    return null
  }
} 