'use client'

import { useState } from 'react'

export interface MapComponentProps {
  pickupCoords?: [number, number]
  dropoffCoords?: [number, number]
  onPickupSelect?: (coords: [number, number]) => void
  onDropoffSelect?: (coords: [number, number]) => void
}

// Este componente es un placeholder/interfaz para las propiedades del mapa
// El componente real está en LeafletMap.tsx y se carga dinámicamente
export default function DynamicMap({
  pickupCoords,
  dropoffCoords,
  onPickupSelect,
  onDropoffSelect
}: MapComponentProps) {
  const [selectingLocation, setSelectingLocation] = useState<'pickup' | 'dropoff' | null>(null)

  // Función simulada para manejar clics en el mapa (coordenadas aleatorias para pruebas)
  const handleMapClick = () => {
    const lat = -34.6037 + (Math.random() - 0.5) * 0.1
    const lng = -58.3816 + (Math.random() - 0.5) * 0.1
    const coords: [number, number] = [lng, lat]
    
    if (selectingLocation === 'pickup' && onPickupSelect) {
      onPickupSelect(coords)
      setSelectingLocation(null)
    } else if (selectingLocation === 'dropoff' && onDropoffSelect) {
      onDropoffSelect(coords)
      setSelectingLocation(null)
    }
  }

  return (
    <div className="relative w-full h-[400px]">
      {/* Mapa simulado */}
      <div 
        className="w-full h-full bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center"
        onClick={handleMapClick}
      >
        <div className="text-center">
          <p className="mb-4 text-gray-600">Haz clic aquí para simular una ubicación en el mapa</p>
          
          {selectingLocation && (
            <div className="font-bold text-blue-600">
              Seleccionando: {selectingLocation === 'pickup' ? 'Origen' : 'Destino'}
            </div>
          )}
          
          <div className="mt-4 space-y-2">
            {pickupCoords && (
              <div className="bg-green-100 rounded p-2">
                Origen: {pickupCoords[1].toFixed(4)}, {pickupCoords[0].toFixed(4)}
              </div>
            )}
            {dropoffCoords && (
              <div className="bg-red-100 rounded p-2">
                Destino: {dropoffCoords[1].toFixed(4)}, {dropoffCoords[0].toFixed(4)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botones de selección */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white p-2 rounded-md shadow-md">
        <button
          onClick={() => setSelectingLocation('pickup')}
          className={`px-3 py-1 rounded-md mr-2 ${
            selectingLocation === 'pickup' ? 'bg-green-500 text-white' : 'bg-gray-200'
          }`}
        >
          Seleccionar origen
        </button>
        <button
          onClick={() => setSelectingLocation('dropoff')}
          className={`px-3 py-1 rounded-md ${
            selectingLocation === 'dropoff' ? 'bg-red-500 text-white' : 'bg-gray-200'
          }`}
        >
          Seleccionar destino
        </button>
      </div>

      {selectingLocation && (
        <div className="absolute top-4 left-4 right-4 z-[1000] bg-black bg-opacity-70 text-white p-2 rounded-md">
          Haz clic en el mapa para seleccionar {selectingLocation === 'pickup' ? 'origen' : 'destino'}
        </div>
      )}
    </div>
  )
} 