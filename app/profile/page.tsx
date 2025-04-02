'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Definir una interfaz para el usuario
interface User {
  id: string;
  name?: string;
  email: string;
  image?: string;
  role: 'USER' | 'DRIVER' | 'ADMIN';
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    // Esta función se ejecutará solo en el cliente
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/users/me')
        if (!response.ok) {
          throw new Error('No se pudo obtener el perfil')
        }
        const data = await response.json()
        setUser(data)
      } catch (error) {
        console.error('Error al obtener el perfil:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserProfile()
  }, [])
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
        <p>Cargando información...</p>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
        <div className="p-4 bg-red-100 text-red-800 rounded-md">
          <p>No se pudo cargar tu información. Por favor inicia sesión.</p>
          <button 
            onClick={() => router.push('/auth/signin')}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          {user.image && (
            <img 
              src={user.image} 
              alt={user.name || 'Usuario'} 
              className="w-20 h-20 rounded-full mr-4"
            />
          )}
          <div>
            <h2 className="text-xl font-bold">{user.name || 'Usuario'}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-blue-600">
              Rol: {
                user.role === 'USER' ? 'Pasajero' :
                user.role === 'DRIVER' ? 'Conductor' : 'Administrador'
              }
            </p>
          </div>
        </div>
        
        {user.role === 'USER' && (
          <div className="mt-4">
            <button 
              onClick={() => router.push('/become-driver')}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Convertirme en conductor
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Indicar que esta página requiere renderizado dinámico
export const dynamic = 'force-dynamic' 