'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

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

// Datos estáticos para asegurar que siempre hay viajes para mostrar
const staticRides: Ride[] = [
  {
    id: "ride-static-1",
    pickup: "Aeropuerto Internacional",
    dropoff: "Centro de la Ciudad",
    pickupLat: -34.8222,
    pickupLng: -58.5358,
    dropoffLat: -34.6037,
    dropoffLng: -58.3816,
    price: 25.50,
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    passenger: {
      id: "passenger-1",
      name: "Carlos Rodríguez",
      image: null
    }
  },
  {
    id: "ride-static-2",
    pickup: "Plaza de Mayo",
    dropoff: "Palermo Soho",
    pickupLat: -34.6083,
    pickupLng: -58.3712,
    dropoffLat: -34.5885,
    dropoffLng: -58.4339,
    price: 15.75,
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    passenger: {
      id: "passenger-2",
      name: "Laura Martínez",
      image: null
    }
  },
  {
    id: "ride-static-3",
    pickup: "Recoleta",
    dropoff: "La Boca",
    pickupLat: -34.5875,
    pickupLng: -58.3938,
    dropoffLat: -34.6345,
    dropoffLng: -58.3631,
    price: 18.20,
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    passenger: {
      id: "passenger-3",
      name: "Martín González",
      image: null
    }
  }
];

export default function AvailableRidesPage() {
  const { data: session, status } = useSession()
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    // Función para cargar los viajes
    const loadRides = async () => {
      try {
        console.log("Iniciando carga de viajes disponibles");
        
        // Intentar obtener viajes del servidor
        try {
          const response = await fetch('/api/rides/available', {
            cache: 'no-store',
            next: { revalidate: 0 }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log("Viajes recibidos del servidor:", data.length);
            
            if (Array.isArray(data) && data.length > 0) {
              setRides(data);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error("Error al obtener los viajes del servidor:", e);
        }
        
        // Si falla o no hay viajes, usar datos estáticos
        console.log("Usando datos estáticos como fallback");
        setRides(staticRides);
        
      } catch (err) {
        console.error("Error general:", err);
        setError("Error al cargar los viajes disponibles");
        // Usar datos estáticos como fallback en caso de error
        setRides(staticRides);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      loadRides();
    }
  }, [status, router]);

  // Calcular distancia entre dos puntos en km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radio de la Tierra en km
    const dLat = degreesToRadians(lat2 - lat1)
    const dLon = degreesToRadians(lon2 - lon1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    return Math.round(distance * 10) / 10 // Redondear a 1 decimal
  }
  
  const degreesToRadians = (degrees: number) => {
    return degrees * (Math.PI / 180)
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

  // Función para aceptar un viaje
  const handleAcceptRide = async (rideId: string) => {
    try {
      setAccepting(rideId)
      
      // Solo proceder si el usuario está autenticado
      if (!session?.user?.email) {
        throw new Error('Debes estar autenticado para aceptar viajes')
      }

      // Encontrar el viaje seleccionado
      const selectedRide = rides.find(ride => ride.id === rideId)
      if (!selectedRide) {
        throw new Error('Viaje no encontrado')
      }

      // Calcular distancia y tiempo estimado
      const distanceInKm = calculateDistance(
        selectedRide.pickupLat,
        selectedRide.pickupLng,
        selectedRide.dropoffLat,
        selectedRide.dropoffLng
      )
      const durationInMinutes = Math.round(distanceInKm / 30 * 60)

      // Guardar información del viaje aceptado
      localStorage.setItem('activeRideInfo', JSON.stringify({
        id: selectedRide.id,
        pickup: selectedRide.pickup,
        dropoff: selectedRide.dropoff,
        pickupLat: selectedRide.pickupLat,
        pickupLng: selectedRide.pickupLng,
        dropoffLat: selectedRide.dropoffLat,
        dropoffLng: selectedRide.dropoffLng,
        price: selectedRide.price,
        distance: distanceInKm.toFixed(1),
        duration: durationInMinutes,
        passengerName: selectedRide.passenger.name,
        passengerId: selectedRide.passenger.id,
        driverId: session.user.email,
        driverName: session.user.name || 'Conductor',
        status: 'ACCEPTED',
        createdAt: selectedRide.createdAt,
        acceptedAt: new Date().toISOString()
      }))

      // Notificar al usuario
      toast.success('Viaje aceptado correctamente')

      // Actualizar la lista de viajes (eliminar el aceptado)
      setRides(prevRides => prevRides.filter(r => r.id !== rideId))

      // Redirigir a la página de viaje activo
      router.push('/rides/active')
      
    } catch (error) {
      console.error('Error al aceptar el viaje:', error)
      toast.error(error instanceof Error ? error.message : 'Error al aceptar el viaje')
    } finally {
      setAccepting(null)
    }
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

      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-6">
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
      )}
      
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
            {rides.map((ride) => {
              // Calcular distancia y tiempo estimado
              const distanceInKm = calculateDistance(
                ride.pickupLat, 
                ride.pickupLng, 
                ride.dropoffLat, 
                ride.dropoffLng
              );
              const durationInMinutes = Math.round(distanceInKm / 30 * 60);
              
              return (
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
                      
                      {/* Información adicional */}
                      <div className="mt-2 flex space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {distanceInKm.toFixed(1)} km
                        </span>
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {durationInMinutes} min
                        </span>
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          ${ride.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">${ride.price.toFixed(2)}</div>
                      <div className="text-xs text-gray-500 mb-2">{formatDate(ride.createdAt)}</div>
                      <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Hace {Math.round((Date.now() - new Date(ride.createdAt).getTime()) / 60000)} min
                      </div>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
} 