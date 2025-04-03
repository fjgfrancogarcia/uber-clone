'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '../../utils/client-auth'
import { UserData } from '../../../types/auth'

// Componente de mapa interactivo
const InteractiveMap = ({ 
  origin, 
  destination, 
  setOrigin, 
  setDestination 
}: { 
  origin: string; 
  destination: string; 
  setOrigin: (value: string) => void; 
  setDestination: (value: string) => void; 
}) => {
  const [selectedPoint, setSelectedPoint] = useState<'origin' | 'destination' | null>(null);
  const [showMarkers, setShowMarkers] = useState(true);

  // Coordenadas de ejemplo para mostrar puntos en el mapa
  const predefinedLocations = [
    { id: 1, name: 'Centro Comercial', lat: 20, lng: 30 },
    { id: 2, name: 'Estación de Tren', lat: 50, lng: 40 },
    { id: 3, name: 'Aeropuerto', lat: 80, lng: 60 },
    { id: 4, name: 'Hospital', lat: 30, lng: 70 },
  ];

  const handleMapClick = (location: string) => {
    if (selectedPoint === 'origin') {
      setOrigin(location);
      setSelectedPoint('destination');
    } else if (selectedPoint === 'destination') {
      setDestination(location);
      setSelectedPoint(null);
    }
  };

  return (
    <div className="relative">
      <div className="bg-gray-100 h-64 rounded-md overflow-hidden relative">
        {/* Mapa base */}
        <div className="absolute inset-0 bg-blue-50 p-2">
          <div className="grid grid-cols-2 gap-2 h-full">
            {predefinedLocations.map((location) => (
              <div 
                key={location.id}
                className="bg-white rounded-md p-2 shadow-sm cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-between"
                onClick={() => handleMapClick(location.name)}
              >
                <span className="text-sm font-medium">{location.name}</span>
                <button className="text-xs text-blue-600 hover:underline">
                  Seleccionar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Marcadores */}
        {showMarkers && (
          <>
            {/* Origen */}
            {origin && (
              <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white text-xs font-medium px-2 py-1 rounded shadow whitespace-nowrap">
                  {origin}
                </div>
              </div>
            )}

            {/* Destino */}
            {destination && (
              <div className="absolute bottom-1/4 right-1/4 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white text-xs font-medium px-2 py-1 rounded shadow whitespace-nowrap">
                  {destination}
                </div>
              </div>
            )}
          </>
        )}

        {/* Controles */}
        <div className="absolute top-2 right-2 bg-white rounded-md shadow-md p-2 flex flex-col space-y-2">
          <button
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            onClick={() => setSelectedPoint('origin')}
          >
            Marcar origen
          </button>
          <button
            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            onClick={() => setSelectedPoint('destination')}
          >
            Marcar destino
          </button>
          <button
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            onClick={() => setShowMarkers(!showMarkers)}
          >
            {showMarkers ? 'Ocultar puntos' : 'Mostrar puntos'}
          </button>
        </div>

        {/* Indicador de selección activa */}
        {selectedPoint && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-80 px-3 py-2 rounded-full text-sm font-medium text-gray-800">
            Selecciona un punto para {selectedPoint === 'origin' ? 'origen' : 'destino'}
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="absolute bottom-2 left-2 bg-white p-2 rounded-md shadow-md text-xs">
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Origen</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Destino</span>
        </div>
      </div>
    </div>
  );
};

export default function RequestRide() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    async function checkAuth() {
      try {
        setDebugInfo('Verificando autenticación...')
        const result = await getCurrentUser()
        
        // Guardar información para depuración
        setDebugInfo(`Resultado de getCurrentUser: ${JSON.stringify(result, null, 2)}`)
        
        if (result.user && typeof result.user === 'object') {
          const userData = result.user as UserData;
          setUser(userData)
          
          // Ahora que sabemos que userData existe y es del tipo correcto
          setDebugInfo(prev => `${prev}\nUsuario encontrado: ${userData.name}, Rol: ${userData.role}`)
          
          // Si el usuario no es un pasajero, redirigir al login
          if (userData.role !== 'USER' && userData.role !== 'ADMIN') {
            setDebugInfo(prev => `${prev}\nRol incorrecto. Redirigiendo a inicio de sesión...`)
            router.push('/auth/signin')
          }
        } else {
          setDebugInfo(prev => `${prev}\nNo se encontró usuario. Redirigiendo a inicio de sesión...`)
          router.push('/auth/signin')
        }
      } catch (error: any) {
        console.error('Error al verificar autenticación:', error)
        setDebugInfo(prev => `${prev}\nError: ${error.message || String(error)}`)
        router.push('/auth/signin')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)

    try {
      // En una implementación completa, aquí se enviaría la solicitud al backend
      // Aquí simulamos el proceso para la demo
      setTimeout(() => {
        setSuccess(true)
        setSubmitLoading(false)
      }, 1500)
    } catch (error) {
      console.error('Error al solicitar viaje:', error)
      setSubmitLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 mt-20 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-500">Cargando...</p>
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
          <p className="text-gray-600 mb-6">Debes iniciar sesión como pasajero para solicitar un viaje.</p>
          <div className="bg-yellow-50 border border-yellow-200 p-4 mb-4 rounded-md text-left">
            <h3 className="font-semibold mb-2">Información de depuración:</h3>
            <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-60">{debugInfo || 'No hay información de depuración'}</pre>
          </div>
          <Link href="/auth/signin" className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Solicitar un viaje</h1>
            
            {success ? (
              <div className="text-center py-10">
                <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
                  <h2 className="font-bold text-xl mb-2">¡Viaje solicitado!</h2>
                  <p>Un conductor está en camino.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-500">Conductor</span>
                    <span className="text-gray-800 font-medium">Miguel González</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-500">Vehículo</span>
                    <span className="text-gray-800 font-medium">Honda Civic - ABC123</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Tiempo estimado</span>
                    <span className="text-gray-800 font-medium">5 minutos</span>
                  </div>
                </div>
                
                <Link href="/passenger/active-ride" className="inline-flex items-center justify-center w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                  Ver detalles del viaje
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
                    Origen
                  </label>
                  <input
                    id="origin"
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="¿Dónde te recogemos?"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                    Destino
                  </label>
                  <input
                    id="destination"
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="¿A dónde vas?"
                    required
                  />
                </div>
                
                {/* Mapa interactivo */}
                <InteractiveMap 
                  origin={origin} 
                  destination={destination} 
                  setOrigin={setOrigin} 
                  setDestination={setDestination} 
                />
                
                <div className="flex justify-between bg-gray-50 p-4 rounded-md">
                  <div>
                    <h3 className="font-medium">UberX</h3>
                    <p className="text-sm text-gray-500">4 pasajeros</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$15.50</p>
                    <p className="text-sm text-gray-500">15 min</p>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={submitLoading || !origin || !destination}
                  className="inline-flex items-center justify-center w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300"
                >
                  {submitLoading ? 'Solicitando...' : 'Solicitar viaje'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 