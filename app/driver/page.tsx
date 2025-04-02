'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DriverPage() {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  // Fetch driver's rides
  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/rides/driver')
        if (!response.ok) {
          throw new Error('Error al obtener tus viajes')
        }
        const data = await response.json()
        setRides(data)
      } catch (err: any) {
        console.error('Error fetching driver rides:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRides()
  }, [])

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mis Viajes como Conductor</h1>
      
      {loading ? (
        <p>Cargando viajes...</p>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-800 rounded-md">
          <p>{error}</p>
        </div>
      ) : rides.length === 0 ? (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md">
          <p>No tienes viajes como conductor todavía.</p>
          <button 
            onClick={() => router.push('/rides/available')}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Ver viajes disponibles
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {rides.map((ride: any) => (
            <div key={ride.id} className="border border-gray-200 p-4 rounded-lg">
              <p><strong>Origen:</strong> {ride.pickup}</p>
              <p><strong>Destino:</strong> {ride.dropoff}</p>
              <p><strong>Precio:</strong> ${ride.price}</p>
              <p><strong>Estado:</strong> {ride.status}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

// Indicar que esta página requiere renderizado dinámico
export const dynamic = 'force-dynamic' 