'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"

interface Ride {
  id: string
  pickup: string
  dropoff: string
  pickupLat: number
  pickupLng: number
  dropoffLat: number
  dropoffLng: number
  price: number
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  passengerId: string
  driverId: string | null
  createdAt: string
  passenger: {
    id: string
    name: string | null
    image: string | null
  }
}

export default function DriverPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [availableRides, setAvailableRides] = useState<Ride[]>([])
  const [myRides, setMyRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "DRIVER" && session?.user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [status, router, session])

  useEffect(() => {
    if (status === "authenticated") {
      fetchAvailableRides()
      fetchMyRides()
    }
  }, [status])

  const fetchAvailableRides = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/rides/available')
      if (!response.ok) {
        throw new Error('Error al obtener viajes disponibles')
      }
      const data = await response.json()
      setAvailableRides(data)
    } catch (error) {
      console.error('Error fetching available rides:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyRides = async () => {
    try {
      const response = await fetch('/api/rides/driver')
      if (!response.ok) {
        throw new Error('Error al obtener mis viajes')
      }
      const data = await response.json()
      setMyRides(data)
    } catch (error) {
      console.error('Error fetching my rides:', error)
    }
  }

  const acceptRide = async (rideId: string) => {
    try {
      const response = await fetch(`/api/rides/${rideId}/accept`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Error al aceptar el viaje')
      }
      
      // Refresh ride lists
      fetchAvailableRides()
      fetchMyRides()
      
      alert('¡Viaje aceptado con éxito!')
    } catch (error) {
      console.error('Error accepting ride:', error)
      alert('Hubo un error al aceptar el viaje. Por favor intenta de nuevo.')
    }
  }

  const updateRideStatus = async (rideId: string, status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') => {
    try {
      const response = await fetch(`/api/rides/${rideId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      
      if (!response.ok) {
        throw new Error(`Error al actualizar el estado del viaje a ${status}`)
      }
      
      // Refresh ride lists
      fetchMyRides()
      
      alert(`Estado del viaje actualizado a ${status}`)
    } catch (error) {
      console.error('Error updating ride status:', error)
      alert('Hubo un error al actualizar el estado del viaje. Por favor intenta de nuevo.')
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Panel de conductor</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Available Rides */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Viajes disponibles</h2>
            
            {availableRides.length === 0 ? (
              <p className="text-gray-500">No hay viajes disponibles en este momento.</p>
            ) : (
              <div className="space-y-4">
                {availableRides.map((ride) => (
                  <div key={ride.id} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Pasajero: {ride.passenger.name || 'Anónimo'}</p>
                        <p>Origen: {ride.pickup}</p>
                        <p>Destino: {ride.dropoff}</p>
                        <p className="text-green-600 font-medium">Precio: ${ride.price}</p>
                      </div>
                      <button
                        onClick={() => acceptRide(ride.id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Aceptar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* My Rides */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Mis viajes</h2>
            
            {myRides.length === 0 ? (
              <p className="text-gray-500">No tienes viajes activos.</p>
            ) : (
              <div className="space-y-4">
                {myRides.map((ride) => (
                  <div key={ride.id} className="border border-gray-200 rounded-md p-4">
                    <div>
                      <p className="font-medium">Pasajero: {ride.passenger.name || 'Anónimo'}</p>
                      <p>Origen: {ride.pickup}</p>
                      <p>Destino: {ride.dropoff}</p>
                      <p className="text-green-600 font-medium">Precio: ${ride.price}</p>
                      <p className="text-blue-600">
                        Estado: {
                          ride.status === 'PENDING' ? 'Pendiente' :
                          ride.status === 'ACCEPTED' ? 'Aceptado' :
                          ride.status === 'IN_PROGRESS' ? 'En progreso' :
                          ride.status === 'COMPLETED' ? 'Completado' : 'Cancelado'
                        }
                      </p>
                    </div>
                    
                    {ride.status === 'ACCEPTED' && (
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => updateRideStatus(ride.id, 'IN_PROGRESS')}
                          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors text-sm"
                        >
                          Iniciar viaje
                        </button>
                        <button
                          onClick={() => updateRideStatus(ride.id, 'CANCELLED')}
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                    
                    {ride.status === 'IN_PROGRESS' && (
                      <div className="mt-3">
                        <button
                          onClick={() => updateRideStatus(ride.id, 'COMPLETED')}
                          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors text-sm"
                        >
                          Completar viaje
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 