'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '../utils/client-auth'

// Interfaces para los tipos de datos
interface Trip {
  id: string
  origin: string
  destination: string
  date: string
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  price: number
  driverName?: string
  driverRating?: number
  vehicle?: string
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

// Función para formatear fechas
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Función para calcular el tiempo de membresía
const calculateMembershipTime = (createdAt: string): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInMilliseconds = now.getTime() - created.getTime();
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 30) {
    return `${diffInDays} días`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  } else {
    const years = Math.floor(diffInDays / 365);
    const remainingMonths = Math.floor((diffInDays % 365) / 30);
    return `${years} ${years === 1 ? 'año' : 'años'}${remainingMonths > 0 ? ` y ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}` : ''}`;
  }
}

// Mapeo de estados de viaje a texto en español y colores
const tripStatusMap: Record<Trip['status'], { text: string, color: string }> = {
  'PENDING': { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  'ACCEPTED': { text: 'Aceptado', color: 'bg-blue-100 text-blue-800' },
  'IN_PROGRESS': { text: 'En progreso', color: 'bg-purple-100 text-purple-800' },
  'COMPLETED': { text: 'Completado', color: 'bg-green-100 text-green-800' },
  'CANCELLED': { text: 'Cancelado', color: 'bg-red-100 text-red-800' }
};

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [trips, setTrips] = useState<Trip[]>([])
  const [error, setError] = useState('')

  // Datos de ejemplo de viajes para demostración
  const sampleTrips: Trip[] = [
    {
      id: '1',
      origin: 'Mi Casa',
      destination: 'Oficina Central',
      date: '2023-06-15T08:30:00Z',
      status: 'COMPLETED',
      price: 15.50,
      driverName: 'Carlos Pérez',
      driverRating: 4.8,
      vehicle: 'Toyota Corolla Gris'
    },
    {
      id: '2',
      origin: 'Oficina Central',
      destination: 'Centro Comercial',
      date: '2023-06-14T18:15:00Z',
      status: 'COMPLETED',
      price: 12.75,
      driverName: 'María Gómez',
      driverRating: 4.9,
      vehicle: 'Honda Civic Azul'
    },
    {
      id: '3',
      origin: 'Centro Comercial',
      destination: 'Mi Casa',
      date: '2023-06-14T20:45:00Z',
      status: 'CANCELLED',
      price: 14.25
    },
    {
      id: '4',
      origin: 'Mi Casa',
      destination: 'Aeropuerto',
      date: new Date().toISOString(),
      status: 'PENDING',
      price: 35.00
    }
  ];

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setIsLoading(true)
        const result = await getCurrentUser()
        
        if (result.user) {
          setUser(result.user)
          
          // En una implementación real, aquí se obtendrían los viajes del usuario
          // Aquí usamos datos de ejemplo para la demo
          setTrips(sampleTrips)
        } else {
          setError('No se pudo obtener la información del usuario')
          router.push('/auth/signin')
        }
      } catch (error: any) {
        console.error('Error al obtener el perfil:', error)
        setError(error.message || 'Error al cargar el perfil')
        router.push('/auth/signin')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserProfile()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 mt-20 p-4">
        <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-6 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-20 w-20 rounded-full bg-gray-200 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-40 bg-gray-200 rounded w-full mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-500">Cargando tu perfil...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario autenticado, mostrar un mensaje (aunque normalmente el useEffect redirigirá)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 mt-20 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para ver tu perfil.</p>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-4 rounded-md">
              {error}
            </div>
          )}
          <Link href="/auth/signin" className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Tarjeta principal del perfil */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="sm:flex sm:space-x-5">
                <div className="flex-shrink-0">
                  <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 text-center sm:text-left">
                  <p className="text-xl font-bold text-gray-900 sm:text-2xl">{user.name}</p>
                  <p className="text-sm font-medium text-gray-600">
                    {user.email}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      ID: {user.id}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                      {user.role === 'USER' ? 'Pasajero' : user.role === 'DRIVER' ? 'Conductor' : 'Administrador'}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                      Miembro desde hace {calculateMembershipTime(user.createdAt || new Date().toISOString())}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-center sm:mt-0">
                <Link
                  href="/profile/edit"
                  className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  Editar Perfil
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Viajes completados</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {trips.filter(trip => trip.status === 'COMPLETED').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Total gastado</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                ${trips
                  .filter(trip => trip.status === 'COMPLETED')
                  .reduce((sum, trip) => sum + trip.price, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Viajes cancelados</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {trips.filter(trip => trip.status === 'CANCELLED').length}
              </p>
            </div>
          </div>
        </div>
        
        {/* Sección de viajes recientes */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="border-b border-gray-200 px-6 py-5">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Viajes recientes</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {trips.length > 0 ? (
              trips.map((trip) => (
                <div key={trip.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tripStatusMap[trip.status].color}`}>
                          {tripStatusMap[trip.status].text}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          {formatDate(trip.date)}
                        </span>
                      </div>
                      <div className="flex items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-500 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Origen:</span>
                        <span className="ml-1 text-sm text-gray-900">{trip.origin}</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-500 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Destino:</span>
                        <span className="ml-1 text-sm text-gray-900">{trip.destination}</span>
                      </div>
                      {trip.driverName && (
                        <div className="mt-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">Conductor:</span>
                          <span className="ml-1 text-sm text-gray-900">{trip.driverName}</span>
                          {trip.driverRating && (
                            <div className="ml-2 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400">
                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm text-gray-600">{trip.driverRating}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right mt-2 sm:mt-0">
                      <p className="text-lg font-medium text-gray-900">${trip.price.toFixed(2)}</p>
                      {trip.status === 'PENDING' && (
                        <Link href={`/passenger/active-ride?id=${trip.id}`} className="inline-flex items-center text-xs text-blue-600 hover:text-blue-900">
                          Ver detalles
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay viajes</h3>
                <p className="mt-1 text-sm text-gray-500">Aún no has realizado ningún viaje.</p>
                <div className="mt-6">
                  <Link href="/passenger/request-ride" className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Solicitar viaje
                  </Link>
                </div>
              </div>
            )}
          </div>
          {trips.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <Link href="/trips/history" className="text-sm font-medium text-blue-600 hover:text-blue-900 flex items-center justify-center">
                Ver historial completo
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
        
        {/* Acciones basadas en el rol */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="border-b border-gray-200 px-6 py-5">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Acciones rápidas</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {user.role === 'USER' || user.role === 'ADMIN' ? (
                <>
                  <Link href="/passenger/request-ride" className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                    Solicitar un viaje
                  </Link>
                  <Link href="/trips/history" className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Ver historial de viajes
                  </Link>
                </>
              ) : user.role === 'DRIVER' ? (
                <>
                  <Link href="/driver/available-rides" className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                    </svg>
                    Ver viajes disponibles
                  </Link>
                  <Link href="/driver/earnings" className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Ver mis ganancias
                  </Link>
                </>
              ) : null}
            </div>
            
            {user.role === 'USER' && (
              <div className="mt-6 text-center">
                <Link href="/become-driver" className="text-sm text-blue-600 hover:text-blue-900">
                  ¿Quieres ser conductor? Regístrate aquí
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Indicar que esta página requiere renderizado dinámico
export const dynamic = 'force-dynamic' 