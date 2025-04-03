'use client'

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

// Cargar directamente el componente LeafletMap para evitar problemas de SSR
const LeafletMap = dynamic(() => import("./components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    </div>
  )
})

export default function HomePage() {
  const [pickup, setPickup] = useState("")
  const [dropoff, setDropoff] = useState("")
  const [pickupCoords, setPickupCoords] = useState<[number, number] | undefined>(undefined)
  const [dropoffCoords, setDropoffCoords] = useState<[number, number] | undefined>(undefined)
  const [price, setPrice] = useState<number | null>(null)
  const router = useRouter()

  // Calcular el precio basado en la distancia entre origen y destino
  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      // Fórmula muy simplificada para calcular el precio basado en la distancia
      const distance = calculateDistance(pickupCoords, dropoffCoords)
      const calculatedPrice = Math.round(distance * 1.5) // $1.5 por km
      setPrice(calculatedPrice)
    } else {
      setPrice(null)
    }
  }, [pickupCoords, dropoffCoords])

  // Función para calcular la distancia entre dos puntos
  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const [lon1, lat1] = point1
    const [lon2, lat2] = point2
    
    // Radio de la Tierra en km
    const R = 6371
    
    // Convertir a radianes
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    
    // Fórmula de Haversine
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c // Distancia en km
    
    return distance
  }

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180)
  }

  const handleRequestRide = async () => {
    if (!pickupCoords || !dropoffCoords || !price) return
    
    try {
      // Mostrar estado de carga
      const loadingToast = toast.loading('Solicitando viaje...')
      
      // Enviar datos a la API
      const response = await fetch('/api/rides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickup,
          dropoff,
          price,
          pickupCoords,
          dropoffCoords,
        }),
      })
      
      const data = await response.json()
      
      // Actualizar estado de carga según resultado
      if (response.ok) {
        toast.success('¡Viaje solicitado con éxito!', { id: loadingToast })
        
        // Reset form
        setPickup('')
        setDropoff('')
        setPickupCoords(undefined)
        setDropoffCoords(undefined)
        setPrice(null)
        
        // Redirigir a la página de viajes
        router.push('/rides')
      } else {
        toast.error(`Error: ${data.error || 'No se pudo solicitar el viaje'}`, { id: loadingToast })
      }
    } catch (error) {
      console.error('Error al solicitar viaje:', error)
      toast.error('Error al conectar con el servidor')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Uber Clone</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Solicitar un viaje</h2>
          
          <LeafletMap 
            pickupCoords={pickupCoords}
            dropoffCoords={dropoffCoords}
            onPickupSelect={(coords) => {
              setPickupCoords(coords)
              setPickup(`${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`)
            }}
            onDropoffSelect={(coords) => {
              setDropoffCoords(coords)
              setDropoff(`${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`)
            }}
          />
          
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="pickup" className="block text-sm font-medium text-gray-700">
                Punto de recogida
              </label>
              <input
                type="text"
                id="pickup"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ingresa tu ubicación o selecciona en el mapa"
              />
            </div>

            <div>
              <label htmlFor="dropoff" className="block text-sm font-medium text-gray-700">
                Destino
              </label>
              <input
                type="text"
                id="dropoff"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="¿A dónde vas? O selecciona en el mapa"
              />
            </div>

            {price !== null && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="text-lg font-medium text-green-800">Precio estimado: ${price}</h3>
                <p className="text-sm text-green-600">Este precio puede variar según la demanda y el tráfico</p>
              </div>
            )}

            <div className="mt-4">
              <button
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleRequestRide}
                disabled={!pickupCoords || !dropoffCoords}
              >
                Solicitar viaje
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Información</h2>
          <p className="text-gray-600 mb-4">
            Esta es una aplicación clon de Uber desarrollada con Next.js 14 y Tailwind CSS. 
            Puedes solicitar viajes, ver tu historial de viajes, y si eres conductor, aceptar viajes disponibles.
          </p>
          <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Funcionalidades disponibles:</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>Solicitar viajes desde cualquier origen a destino</li>
              <li>Ver el historial completo de viajes en tu perfil</li>
              <li>Convertirte en conductor para aceptar viajes</li>
              <li>Calcular precios basados en la distancia del viaje</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 