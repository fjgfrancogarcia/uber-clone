'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'

// Definir una interfaz para el usuario
interface User {
  id: string;
  name?: string;
  email: string;
  image?: string;
  role: 'USER' | 'DRIVER' | 'ADMIN';
}

// Componente cliente para el perfil
function ProfileClient() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Obtener la información del usuario actual
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/users/me')
        
        if (!response.ok) {
          throw new Error('No se pudo obtener la información del perfil')
        }
        
        const userData = await response.json()
        setUser(userData)
      } catch (err: any) {
        console.error('Error fetching user profile:', err)
        setError(err.message || 'Error al cargar el perfil')
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-500">{error || 'No se pudo cargar la información del usuario'}</p>
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

// Página principal con Suspense
export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Cargando perfil...</p>
        </div>
      </div>
    }>
      <ProfileClient />
    </Suspense>
  )
}

// Indicar que esta página requiere renderizado dinámico
export const dynamic = 'force-dynamic' 