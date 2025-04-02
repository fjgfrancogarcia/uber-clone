'use client'

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

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

  const handleRequestRide = () => {
    if (!pickupCoords || !dropoffCoords || !price) return
    
    // Simular la solicitud de viaje
    alert(`Viaje solicitado!\nOrigen: ${pickup}\nDestino: ${dropoff}\nPrecio: $${price}`)
    
    // Reset form
    setPickup('')
    setDropoff('')
    setPickupCoords(undefined)
    setDropoffCoords(undefined)
    setPrice(null)
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
          <h2 className="text-xl font-semibold mb-4">Páginas disponibles:</h2>
          <ul className="space-y-2">
            <li>
              <a href="/rides" className="text-blue-600 hover:underline">
                → Mis Viajes
              </a>
            </li>
            <li>
              <a href="/rides-static" className="text-blue-600 hover:underline">
                → Mis Viajes (versión estática)
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
} 