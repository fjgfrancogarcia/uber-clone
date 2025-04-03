'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '../utils/client-auth'
import { UserData } from '../../types/auth'

// Definir interfaces para los datos
interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  _count: {
    rides: number;
  }
}

interface Trip {
  id: string;
  price: number;
  distance: number;
  duration: number;
  status: string;
  createdAt: string;
  pickupLocation: string;
  dropoffLocation: string;
}

// Componente cliente para el perfil
const ProfileClient = () => {
  const [user, setUser] = useState<UserData | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const result = await getCurrentUser()
        
        if (result.user) {
          setUser(result.user)
          
          // Fetch user trips
          const tripsResponse = await fetch('/api/rides?limit=5')
          // If trips API fails, we'll just show sample data
          if (tripsResponse.ok) {
            const tripsData = await tripsResponse.json()
            setTrips(tripsData)
          } else {
            // Set sample trip data if API fails or returns empty
            setTrips(getSampleTrips())
          }
        } else {
          // Si no hay usuario, redirigir a inicio de sesión
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Error al obtener perfil de usuario:', error)
        router.push('/auth/signin')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserProfile()
  }, [router])

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Get membership duration
  const getMembershipDuration = (dateString: string) => {
    const createdAt = new Date(dateString)
    const now = new Date()
    const diffInMonths = (now.getFullYear() - createdAt.getFullYear()) * 12 + 
                         (now.getMonth() - createdAt.getMonth())
    
    if (diffInMonths < 1) {
      return 'Menos de un mes'
    } else if (diffInMonths === 1) {
      return '1 mes'
    } else {
      return `${diffInMonths} meses`
    }
  }

  // Map status to Spanish text and color
  const getStatusInfo = (status: string) => {
    const statusMap: {[key: string]: {text: string, color: string}} = {
      'PENDING': { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      'ACCEPTED': { text: 'Aceptado', color: 'bg-blue-100 text-blue-800' },
      'IN_PROGRESS': { text: 'En curso', color: 'bg-purple-100 text-purple-800' },
      'COMPLETED': { text: 'Completado', color: 'bg-green-100 text-green-800' },
      'CANCELLED': { text: 'Cancelado', color: 'bg-red-100 text-red-800' }
    }
    
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' }
  }

  // Sample user data for development/error cases
  const getSampleUser = (): UserProfile => ({
    id: 'sample-user-id',
    name: 'Usuario de Ejemplo',
    email: 'usuario@ejemplo.com',
    image: 'https://ui-avatars.com/api/?name=Usuario+Ejemplo',
    role: 'CUSTOMER',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    _count: {
      rides: 12
    }
  })

  // Sample trip data for development/error cases
  const getSampleTrips = (): Trip[] => [
    {
      id: 'trip-1',
      price: 15.50,
      distance: 5.2,
      duration: 18,
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      pickupLocation: 'Calle Mayor, 1',
      dropoffLocation: 'Avenida Principal, 45'
    },
    {
      id: 'trip-2',
      price: 8.75,
      distance: 2.8,
      duration: 12,
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      pickupLocation: 'Plaza Central, 3',
      dropoffLocation: 'Calle del Comercio, 22'
    },
    {
      id: 'trip-3',
      price: 22.30,
      distance: 8.7,
      duration: 25,
      status: 'CANCELLED',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      pickupLocation: 'Avenida del Parque, 18',
      dropoffLocation: 'Calle de la Universidad, 5'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 mt-20 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-500">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 mt-20 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para ver tu perfil.</p>
          <Link href="/auth/signin" className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24 px-4 pb-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Mi Perfil</h1>
            
            <div className="space-y-8">
              {/* Información Personal */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nombre</p>
                      <p className="mt-1 text-lg font-medium text-gray-900">{user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="mt-1 text-lg font-medium text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">ID de Usuario</p>
                      <p className="mt-1 text-lg font-medium text-gray-900">{user.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Rol</p>
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {user.role === 'USER' ? 'Pasajero' : 
                         user.role === 'DRIVER' ? 'Conductor' : 'Administrador'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Acciones */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Acciones</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.role === 'USER' && (
                    <Link
                      href="/passenger/request-ride"
                      className="inline-block bg-blue-600 text-white py-3 px-4 rounded-md text-center hover:bg-blue-700 transition-colors"
                    >
                      Solicitar un Viaje
                    </Link>
                  )}
                  
                  {user.role === 'DRIVER' && (
                    <Link
                      href="/rides/available"
                      className="inline-block bg-blue-600 text-white py-3 px-4 rounded-md text-center hover:bg-blue-700 transition-colors"
                    >
                      Ver Viajes Disponibles
                    </Link>
                  )}
                  
                  <Link
                    href="/"
                    className="inline-block bg-gray-200 text-gray-800 py-3 px-4 rounded-md text-center hover:bg-gray-300 transition-colors"
                  >
                    Volver al Inicio
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Página principal con Suspense
const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h1>
        <Suspense fallback={<div className="text-center">Cargando...</div>}>
          <ProfileClient />
        </Suspense>
      </div>
    </div>
  )
}

export default ProfilePage

// Indicar que esta página requiere renderizado dinámico
export const dynamic = 'force-dynamic' 