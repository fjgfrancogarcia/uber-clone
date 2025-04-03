'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '../../utils/client-auth'

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface Trip {
  id: string;
  origin: string;
  destination: string;
  date: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  price: number;
  driverName?: string;
  driverRating?: number;
  vehicle?: string;
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

// Mapeo de estados de viaje a texto en español y colores
const tripStatusMap: Record<Trip['status'], { text: string, color: string }> = {
  'PENDING': { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  'ACCEPTED': { text: 'Aceptado', color: 'bg-blue-100 text-blue-800' },
  'IN_PROGRESS': { text: 'En progreso', color: 'bg-purple-100 text-purple-800' },
  'COMPLETED': { text: 'Completado', color: 'bg-green-100 text-green-800' },
  'CANCELLED': { text: 'Cancelado', color: 'bg-red-100 text-red-800' }
};

export default function TripsHistoryPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [trips, setTrips] = useState<Trip[]>([])
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState<Trip['status'] | 'ALL'>('ALL')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  
  // Datos de ejemplo para demostración
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
    },
    {
      id: '5',
      origin: 'Aeropuerto',
      destination: 'Hotel Central',
      date: '2023-05-20T09:30:00Z',
      status: 'COMPLETED',
      price: 28.50,
      driverName: 'Juan López',
      driverRating: 4.5,
      vehicle: 'Nissan Sentra Negro'
    },
    {
      id: '6',
      origin: 'Hotel Central',
      destination: 'Restaurante Italiano',
      date: '2023-05-20T19:45:00Z',
      status: 'COMPLETED',
      price: 8.25,
      driverName: 'Ana Martínez',
      driverRating: 4.7,
      vehicle: 'Volkswagen Golf Rojo'
    },
    {
      id: '7',
      origin: 'Restaurante Italiano',
      destination: 'Hotel Central',
      date: '2023-05-20T22:30:00Z',
      status: 'COMPLETED',
      price: 9.00,
      driverName: 'Pedro Sánchez',
      driverRating: 4.6,
      vehicle: 'Hyundai Elantra Blanco'
    },
    {
      id: '8',
      origin: 'Hotel Central',
      destination: 'Centro de Conferencias',
      date: '2023-05-21T08:30:00Z',
      status: 'CANCELLED',
      price: 12.50
    }
  ];

  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsLoading(true)
        const result = await getCurrentUser()
        
        if (result.user) {
          setUser(result.user)
          
          // En una implementación real, aquí se obtendrían los viajes del usuario desde el backend
          // Por ahora usamos datos de muestra
          setTrips(sampleTrips)
        } else {
          setError('No se pudo obtener la información del usuario')
          router.push('/auth/signin')
        }
      } catch (error: any) {
        console.error('Error al obtener datos del usuario:', error)
        setError(error.message || 'Error al cargar el historial')
        router.push('/auth/signin')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserData()
  }, [router])

  // Ordenar y filtrar viajes
  const sortedAndFilteredTrips = [...trips]
    .filter(trip => activeFilter === 'ALL' || trip.status === activeFilter)
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

  // Calcular estadísticas
  const stats = {
    total: trips.length,
    completed: trips.filter(t => t.status === 'COMPLETED').length,
    cancelled: trips.filter(t => t.status === 'CANCELLED').length,
    inProgress: trips.filter(t => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(t.status)).length,
    totalSpent: trips
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.price, 0)
      .toFixed(2)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 mt-20 p-4">
        <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-6 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded w-full mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-500">Cargando historial de viajes...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 mt-20 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para ver tu historial de viajes.</p>
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
    <div className="min-h-screen bg-gray-100 pt-20 px-4 pb-10">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Historial de viajes</h1>
              <p className="text-gray-600">Revisa todos tus viajes anteriores</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href="/passenger/request-ride" className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Solicitar nuevo viaje
              </Link>
            </div>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm font-medium text-gray-500">Total de viajes</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm font-medium text-gray-500">Viajes completados</div>
            <div className="mt-1 text-3xl font-semibold text-green-600">{stats.completed}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm font-medium text-gray-500">Viajes cancelados</div>
            <div className="mt-1 text-3xl font-semibold text-red-600">{stats.cancelled}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm font-medium text-gray-500">Total gastado</div>
            <div className="mt-1 text-3xl font-semibold text-blue-600">${stats.totalSpent}</div>
          </div>
        </div>

        {/* Filtros y orden */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
                <button
                  onClick={() => setActiveFilter('ALL')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    activeFilter === 'ALL' 
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setActiveFilter('COMPLETED')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    activeFilter === 'COMPLETED' 
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Completados
                </button>
                <button
                  onClick={() => setActiveFilter('CANCELLED')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    activeFilter === 'CANCELLED' 
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancelados
                </button>
                <button
                  onClick={() => setActiveFilter('PENDING')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    activeFilter === 'PENDING' 
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pendientes
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <label htmlFor="sort-order" className="text-sm text-gray-600">Ordenar por:</label>
                <select
                  id="sort-order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                  className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="newest">Más recientes</option>
                  <option value="oldest">Más antiguos</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Lista de viajes */}
          <div className="divide-y divide-gray-200">
            {sortedAndFilteredTrips.length > 0 ? (
              sortedAndFilteredTrips.map((trip) => (
                <div key={trip.id} className="p-4 hover:bg-gray-50">
                  <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="sm:flex sm:items-start sm:space-x-4">
                      <div className="mb-2 sm:mb-0">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tripStatusMap[trip.status].color}`}>
                          {tripStatusMap[trip.status].text}
                        </span>
                        <div className="mt-1 text-sm text-gray-500">
                          {formatDate(trip.date)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-500 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          <span className="font-medium text-gray-900">{trip.origin}</span>
                        </div>
                        
                        <div className="flex items-center text-sm mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-500 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          <span className="font-medium text-gray-900">{trip.destination}</span>
                        </div>
                        
                        {trip.driverName && (
                          <div className="flex items-center text-sm mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500 mr-1">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                            <span className="text-gray-600">{trip.driverName}</span>
                            
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
                        
                        {trip.vehicle && (
                          <div className="flex items-center text-sm mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500 mr-1">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                            </svg>
                            <span className="text-gray-600">{trip.vehicle}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-0 flex flex-col items-end">
                      <div className="text-lg font-medium text-gray-900">${trip.price.toFixed(2)}</div>
                      
                      <Link 
                        href={trip.status === 'PENDING' ? `/passenger/active-ride?id=${trip.id}` : `/trips/details/${trip.id}`} 
                        className="text-sm text-blue-600 hover:text-blue-800 mt-1 flex items-center"
                      >
                        {trip.status === 'PENDING' ? 'Ver viaje actual' : 'Ver detalles'}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay viajes</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeFilter === 'ALL' 
                    ? 'Aún no has realizado ningún viaje.'
                    : `No tienes viajes con estado "${tripStatusMap[activeFilter as Trip['status']].text}".`
                  }
                </p>
                {activeFilter !== 'ALL' && (
                  <button
                    onClick={() => setActiveFilter('ALL')}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Ver todos los viajes
                  </button>
                )}
              </div>
            )}
          </div>
          
          {sortedAndFilteredTrips.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-3 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{sortedAndFilteredTrips.length}</span> de <span className="font-medium">{trips.length}</span> viajes
                </div>
                <Link href="/profile" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
                  Volver al perfil
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 