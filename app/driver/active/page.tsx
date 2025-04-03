'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '../../utils/client-auth'
import { UserData } from '../../../types/auth'

// Interfaces
interface Passenger {
  id: string;
  name: string;
  image: string | null;
}

interface Trip {
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
  acceptedAt?: string;
  distance?: number;
  duration?: number;
}

export default function ActiveRidePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [tripStatus, setTripStatus] = useState('ACCEPTED')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar autenticación
    const checkAuth = async () => {
      try {
        const result = await getCurrentUser()
        if (!result.success || !result.user || result.user.role !== 'DRIVER') {
          router.push('/auth/signin')
          return
        }
        setUser(result.user)

        // Cargar datos de viaje desde localStorage
        if (typeof window !== 'undefined') {
          const storedTrip = localStorage.getItem('activeTrip')
          
          if (!storedTrip) {
            // Si no hay viaje activo, mostrar error y luego redirigir
            setError('No se encontró ningún viaje activo')
            setLoading(false)
            
            // Redirigir después de mostrar el mensaje
            setTimeout(() => {
              router.push('/driver')
            }, 3000)
            return
          }
          
          try {
            const parsedTrip = JSON.parse(storedTrip)
            setActiveTrip(parsedTrip)
            setTripStatus(parsedTrip.status)
            setLoading(false)
          } catch (parseError) {
            console.error('Error al analizar el viaje guardado:', parseError)
            setError('Error al procesar los datos del viaje')
            setLoading(false)
            
            setTimeout(() => {
              router.push('/driver')
            }, 3000)
          }
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error)
        router.push('/auth/signin')
      }
    }

    checkAuth()
  }, [router])

  const handleStatusChange = (newStatus: string) => {
    setTripStatus(newStatus)
    
    if (activeTrip) {
      const updatedTrip = {
        ...activeTrip,
        status: newStatus
      }
      setActiveTrip(updatedTrip)
      
      // Actualizar en localStorage
      localStorage.setItem('activeTrip', JSON.stringify(updatedTrip))
    }

    // Si el viaje se completa, eliminarlo de localStorage y redirigir al panel después de un tiempo
    if (newStatus === 'COMPLETED') {
      setTimeout(() => {
        // Guardar en historial antes de eliminar
        saveCompletedTrip(activeTrip)
        
        // Eliminar viaje activo
        localStorage.removeItem('activeTrip')
        
        router.push('/driver')
      }, 3000)
    }
  }
  
  // Función para guardar el viaje completado en el historial
  const saveCompletedTrip = (trip: Trip | null) => {
    if (!trip) return
    
    try {
      // Obtener historial existente
      const historyStr = localStorage.getItem('completedTrips')
      const history = historyStr ? JSON.parse(historyStr) : []
      
      // Añadir viaje actual al historial
      const completedTrip = {
        ...trip,
        status: 'COMPLETED',
        completedAt: new Date().toISOString()
      }
      
      history.unshift(completedTrip) // Añadir al principio
      
      // Guardar historial actualizado
      localStorage.setItem('completedTrips', JSON.stringify(history))
    } catch (error) {
      console.error('Error al guardar viaje en historial:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Cargando información del viaje...</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="w-16 h-16 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="mt-4 text-red-600 font-medium">{error}</p>
        <p className="mt-2 text-gray-500">Redirigiendo al panel de conductor...</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Viaje Activo</h1>
        <p className="text-gray-600">
          ID del viaje: {activeTrip?.id}
        </p>
      </div>

      {/* Estado del viaje */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Estado actual</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              tripStatus === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
              tripStatus === 'PICKUP' ? 'bg-yellow-100 text-yellow-800' :
              tripStatus === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
              tripStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {tripStatus === 'ACCEPTED' ? 'Aceptado' :
               tripStatus === 'PICKUP' ? 'En punto de recogida' :
               tripStatus === 'IN_PROGRESS' ? 'En progreso' :
               tripStatus === 'COMPLETED' ? 'Completado' :
               'Desconocido'}
            </span>
          </div>

          {/* Barra de progreso */}
          <div className="relative pt-1 mb-6">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-blue-600">
                  Progreso del viaje
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div 
                style={{ 
                  width: tripStatus === 'ACCEPTED' ? '25%' : 
                         tripStatus === 'PICKUP' ? '50%' : 
                         tripStatus === 'IN_PROGRESS' ? '75%' : 
                         tripStatus === 'COMPLETED' ? '100%' : '0%' 
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500">
              </div>
            </div>
          </div>

          {/* Botones de acción según el estado */}
          <div className="space-y-2">
            {tripStatus === 'ACCEPTED' && (
              <button 
                onClick={() => handleStatusChange('PICKUP')}
                className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium"
              >
                He llegado al punto de recogida
              </button>
            )}
            
            {tripStatus === 'PICKUP' && (
              <button 
                onClick={() => handleStatusChange('IN_PROGRESS')}
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium"
              >
                Iniciar viaje
              </button>
            )}
            
            {tripStatus === 'IN_PROGRESS' && (
              <button 
                onClick={() => handleStatusChange('COMPLETED')}
                className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium"
              >
                Completar viaje
              </button>
            )}
            
            {tripStatus === 'COMPLETED' && (
              <div className="text-center p-4 bg-green-50 text-green-700 rounded-md">
                <p className="font-medium">¡Viaje completado con éxito!</p>
                <p className="text-sm mt-1">Serás redirigido al panel en unos segundos...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detalles del viaje */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Detalles del viaje</h2>
          
          <div className="space-y-4">
            <div className="flex">
              <div className="w-10 flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">A</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Punto de recogida</p>
                <p className="font-medium">{activeTrip?.pickup}</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="w-10 flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xs">B</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Destino</p>
                <p className="font-medium">{activeTrip?.dropoff}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm text-gray-500">Distancia</p>
                <p className="font-medium">{activeTrip?.distance} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duración est.</p>
                <p className="font-medium">{activeTrip?.duration} min</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Precio</p>
                <p className="font-medium text-green-600">${activeTrip?.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-medium">{new Date(activeTrip?.createdAt || '').toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Información del pasajero */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Pasajero</h2>
          
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <span className="text-blue-600 font-bold text-xl">
                {activeTrip?.passenger.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-medium">{activeTrip?.passenger.name}</p>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button 
              className="flex items-center justify-center py-2 bg-blue-100 text-blue-700 rounded-md"
              onClick={() => alert('Esta función no está disponible en la versión demo')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Llamar
            </button>
            <button 
              className="flex items-center justify-center py-2 bg-green-100 text-green-700 rounded-md"
              onClick={() => alert('Esta función no está disponible en la versión demo')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Mensaje
            </button>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <Link 
          href="/driver" 
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Volver al panel de conductor
        </Link>
      </div>
    </div>
  )
} 