'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { getCurrentUser } from '../../utils/client-auth'
import { UserData } from '../../../types/auth'

// Importamos Leaflet de forma dinámica para evitar problemas de SSR
const MapWithNoSSR = dynamic(
  () => import('../../components/LeafletMap'),
  { ssr: false }
);

export default function RequestRide() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null)
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null)
  const [price, setPrice] = useState(0)
  const [distance, setDistance] = useState(0)
  const [duration, setDuration] = useState(0)
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

  // Efecto para calcular el precio cuando cambian las coordenadas
  useEffect(() => {
    if (originCoords && destinationCoords) {
      // Cálculo de distancia usando la fórmula de Haversine
      const R = 6371; // Radio de la Tierra en km
      const dLat = (destinationCoords[0] - originCoords[0]) * Math.PI / 180;
      const dLon = (destinationCoords[1] - originCoords[1]) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(originCoords[0] * Math.PI / 180) * Math.cos(destinationCoords[0] * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const calculatedDistance = R * c;
      
      // Redondear a 1 decimal
      setDistance(Math.round(calculatedDistance * 10) / 10);
      
      // Estimar duración (asumiendo velocidad media de 40 km/h)
      const calculatedDuration = (calculatedDistance / 40) * 60;
      setDuration(Math.round(calculatedDuration));
      
      // Calcular precio (tarifa base + distancia)
      const tarifaBase = 2.5;
      const tarifaPorKm = 1.2;
      const calculatedPrice = tarifaBase + (calculatedDistance * tarifaPorKm);
      setPrice(Math.round(calculatedPrice * 100) / 100);
    }
  }, [originCoords, destinationCoords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)

    try {
      // En una implementación completa, aquí se enviaría la solicitud al backend con los datos reales
      const rideData = {
        origin,
        destination,
        originCoords,
        destinationCoords,
        price,
        distance,
        duration,
        userId: user?.id
      };
      
      // Simular una llamada a la API
      console.log('Enviando datos de viaje:', rideData);
      
      // En una implementación real, aquí iría la petición al backend:
      // const response = await fetch('/api/rides', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(rideData),
      // });
      // const data = await response.json();
      
      // Simulamos el proceso para la demo
      setTimeout(() => {
        setSuccess(true)
        setSubmitLoading(false)
      }, 1500)
    } catch (error) {
      console.error('Error al solicitar viaje:', error)
      setSubmitLoading(false)
    }
  }

  const handleMapSelect = (type: 'origin' | 'destination', address: string, coords: [number, number]) => {
    if (type === 'origin') {
      setOrigin(address);
      setOriginCoords(coords);
    } else {
      setDestination(address);
      setDestinationCoords(coords);
    }
  };

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
                
                {/* Mapa con Leaflet */}
                <div className="h-80 rounded-md overflow-hidden">
                  <MapWithNoSSR 
                    onSelectOrigin={(address, coords) => handleMapSelect('origin', address, coords)}
                    onSelectDestination={(address, coords) => handleMapSelect('destination', address, coords)}
                    originCoords={originCoords}
                    destinationCoords={destinationCoords}
                  />
                </div>
                
                <div className="flex justify-between bg-gray-50 p-4 rounded-md">
                  <div>
                    <h3 className="font-medium">UberX</h3>
                    <p className="text-sm text-gray-500">4 pasajeros</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{distance.toFixed(1)} km · {duration} min</p>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={submitLoading || !origin || !destination || !originCoords || !destinationCoords}
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