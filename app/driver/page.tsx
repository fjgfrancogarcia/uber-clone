'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panel de Conductor</h1>
        <Link 
          href="/rides/available"
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Ver viajes disponibles
        </Link>
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              Como conductor, puedes aceptar viajes pendientes de pasajeros. Haz clic en "Ver viajes disponibles" para explorar las solicitudes actuales.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Mis Viajes Aceptados</h2>
      
      {loading ? (
        <p className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-2"></div>
          Cargando viajes...
        </p>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-800 rounded-md">
          <p>{error}</p>
        </div>
      ) : rides.length === 0 ? (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md">
          <p>No tienes viajes aceptados todavía.</p>
          <button 
            onClick={() => router.push('/rides/available')}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Ver viajes disponibles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rides.map((ride: any) => (
            <div key={ride.id} className="border border-gray-200 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    ride.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' : 
                    ride.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                    ride.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ride.status === 'ACCEPTED' ? 'Aceptado' : 
                     ride.status === 'IN_PROGRESS' ? 'En curso' :
                     ride.status === 'COMPLETED' ? 'Completado' :
                     ride.status}
                  </span>
                </div>
                <div className="text-lg font-bold text-green-600">${ride.price.toFixed(2)}</div>
              </div>
              <p className="text-sm font-medium">
                <span className="text-gray-500">Origen:</span> {ride.pickup}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Destino:</span> {ride.dropoff}
              </p>
              {ride.passenger && (
                <p className="text-sm mt-2">
                  <span className="text-gray-500">Pasajero:</span> {ride.passenger.name}
                </p>
              )}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button className="w-full py-1 px-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

// Indicar que esta página requiere renderizado dinámico
export const dynamic = 'force-dynamic' 