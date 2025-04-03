'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamicImport from 'next/dynamic'

// Definir interfaces
interface Passenger {
  id: string;
  name: string;
  image: string | null;
}

interface Ride {
  id: string;
  pickup: string;
  dropoff: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  price: number;
  status: string;
  createdAt: string;
  passenger: Passenger;
}

// Importar mapa de forma dinámica para evitar problemas de SSR
const DynamicDriverMap = dynamicImport(
  () => import('../../components/DriverMap'), 
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    )
  }
)

function AvailableRidesClient() {
  const { data: session, status } = useSession()
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [mapVisible, setMapVisible] = useState(false) // Estado para controlar la visibilidad del mapa
  const router = useRouter()

  useEffect(() => {
    // Verificar si el usuario está autenticado como conductor
    if (status === 'unauthenticated' || (session?.user && session.user.role !== 'DRIVER')) {
      router.push('/auth/signin')
      return
    }

    const fetchAvailableRides = async () => {
      try {
        console.log("Iniciando fetch de viajes disponibles");
        setLoading(true)
        
        // Simular datos para demo
        // En una implementación real, esto sería un fetch a una API
        setTimeout(() => {
          const mockRides: Ride[] = [
            {
              id: '1',
              pickup: 'Avenida Libertador 1234',
              dropoff: 'Plaza Italia',
              pickupLat: -34.5950,
              pickupLng: -58.3702,
              dropoffLat: -34.5810,
              dropoffLng: -58.4121,
              price: 15.5,
              status: 'PENDING',
              createdAt: new Date().toISOString(),
              passenger: {
                id: 'passenger-1',
                name: 'Carlos Rodríguez',
                image: null
              }
            },
            {
              id: '2',
              pickup: 'Palermo Soho',
              dropoff: 'Puerto Madero',
              pickupLat: -34.5889,
              pickupLng: -58.4245,
              dropoffLat: -34.6089,
              dropoffLng: -58.3634,
              price: 23.75,
              status: 'PENDING',
              createdAt: new Date().toISOString(),
              passenger: {
                id: 'passenger-2',
                name: 'Laura Martínez',
                image: null
              }
            }
          ];
          
          setRides(mockRides);
          setMapVisible(true);
          setLoading(false);
        }, 1500);
      } catch (err: any) {
        console.error('Error fetching available rides:', err)
        setError(err.message || 'Error al cargar los viajes disponibles')
        setLoading(false)
      }
    }

    if (status === 'authenticated' && session?.user?.role === 'DRIVER') {
      fetchAvailableRides()
    }
  }, [status, session, router])

  const handleAcceptRide = async (rideId: string) => {
    try {
      setAccepting(rideId)
      
      // Simular aceptación de viaje
      setTimeout(() => {
        // En una implementación real, esto sería un fetch a una API
        // Redireccionar al panel de conductor
        router.push('/driver/active')
      }, 1500)
    } catch (err: any) {
      console.error('Error accepting ride:', err)
      alert(`Error: ${err.message}`)
      setAccepting(null)
    }
  }

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Si el usuario no es conductor o no está autenticado
  if (status === 'unauthenticated' || (session?.user && session.user.role !== 'DRIVER')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 mt-20 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">Debes iniciar sesión como conductor para ver los viajes disponibles.</p>
          <Link href="/auth/signin" className="btn btn-primary">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando viajes disponibles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Viajes Disponibles</h1>
        <Link 
          href="/driver" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Volver al panel
        </Link>
      </div>

      {/* Mapa con viajes disponibles */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Mapa de viajes</h2>
        
        {/* Solo mostrar el mapa cuando esté listo para evitar problemas de renderizado */}
        {mapVisible ? (
          <div id="map-container" className="relative" style={{ minHeight: '500px', zIndex: 0 }}>
            <DynamicDriverMap rides={rides} onAccept={handleAcceptRide} />
          </div>
        ) : (
          <div className="w-full h-[500px] bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
              <p className="text-gray-600">Preparando mapa...</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white shadow overflow-hidden rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Lista de viajes disponibles</h2>
        
        {rides.length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <p className="text-gray-500 mb-4">No hay viajes disponibles en este momento</p>
            <p className="text-gray-400 text-sm">Vuelve a verificar más tarde o espera a que los pasajeros soliciten nuevos viajes</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {rides.map((ride) => (
              <div key={ride.id} className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      {ride.passenger.image ? (
                        <img 
                          src={ride.passenger.image} 
                          alt={ride.passenger.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold">
                            {ride.passenger.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="font-medium">{ride.passenger.name}</span>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-900">
                        De: {ride.pickup}
                      </p>
                      <p className="text-sm text-gray-500">
                        A: {ride.dropoff}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">${ride.price.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{formatDate(ride.createdAt)}</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={() => handleAcceptRide(ride.id)}
                    disabled={!!accepting}
                    className={`w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 ${
                      accepting === ride.id ? 'opacity-75' : ''
                    }`}
                  >
                    {accepting === ride.id ? 'Aceptando...' : 'Aceptar viaje'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Página principal
export default function AvailableRidesPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando viajes disponibles...</p>
        </div>
      </div>
    }>
      <AvailableRidesClient />
    </Suspense>
  )
}

// Indicamos que esta página requiere renderizado dinámico
export const dynamic = 'force-dynamic' 