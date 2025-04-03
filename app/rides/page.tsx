'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Ride {
  id: string
  pickup?: string
  dropoff?: string
  pickupLocation?: string
  dropoffLocation?: string
  price: number
  status: string
  createdAt: string
  driver?: {
    name: string
  }
}

function RidesClient() {
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/rides')
        
        if (!response.ok) {
          throw new Error('No se pudieron obtener los viajes')
        }
        
        const data = await response.json()
        setRides(data)
      } catch (err: any) {
        console.error('Error fetching rides:', err)
        setError(err.message || 'Error al cargar los viajes')
      } finally {
        setLoading(false)
      }
    }

    fetchRides()
  }, [])

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Estado de un viaje en español
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Pendiente',
      'ACCEPTED': 'Aceptado',
      'IN_PROGRESS': 'En progreso',
      'COMPLETED': 'Completado',
      'CANCELLED': 'Cancelado'
    }
    return statusMap[status] || status
  }

  // Color del estado de un viaje
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'ACCEPTED': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-indigo-100 text-indigo-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  // Función para obtener la ubicación de origen
  const getPickupLocation = (ride: Ride): string => {
    return ride.pickupLocation || ride.pickup || 'Ubicación desconocida';
  }
  
  // Función para obtener la ubicación de destino
  const getDropoffLocation = (ride: Ride): string => {
    return ride.dropoffLocation || ride.dropoff || 'Ubicación desconocida';
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando tus viajes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mis Viajes</h1>
        <Link 
          href="/"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Solicitar nuevo viaje
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden rounded-lg p-6">
        {rides.length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <p className="text-gray-500 mb-4">No tienes viajes aún</p>
            <Link href="/" className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Solicitar un viaje
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {rides.map((ride) => (
              <div key={ride.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-900">
                      De: {getPickupLocation(ride)}
                    </p>
                    <p className="text-sm text-gray-500">
                      A: {getDropoffLocation(ride)}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ride.status)}`}>
                      {getStatusText(ride.status)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                      </svg>
                      {ride.driver ? `Conductor: ${ride.driver.name}` : 'Sin conductor asignado'}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <p>
                      {formatDate(ride.createdAt)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm font-medium text-green-600 sm:mt-0">
                    ${ride.price.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function RidesPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando tus viajes...</p>
        </div>
      </div>
    }>
      <RidesClient />
    </Suspense>
  )
} 