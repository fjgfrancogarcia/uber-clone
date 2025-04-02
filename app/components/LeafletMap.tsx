'use client'

import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import type { MapComponentProps } from './DynamicMap'

// Configuración de iconos para evitar problemas con SSR
const iconConfig = () => {
  // Usar URLs absolutas de CDN
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

// Componente para obtener la referencia al mapa
const MapRef = ({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) => {
  const map = useMapEvents({})
  
  useEffect(() => {
    mapRef.current = map
  }, [map, mapRef])
  
  return null
}

// Componente interno para manejar eventos del mapa
function MapEvents({ 
  onPickupSelect, 
  onDropoffSelect, 
  selectingLocation 
}: { 
  onPickupSelect?: (coords: [number, number]) => void
  onDropoffSelect?: (coords: [number, number]) => void
  selectingLocation: 'pickup' | 'dropoff' | null
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      const coords: [number, number] = [lng, lat]
      
      if (selectingLocation === 'pickup' && onPickupSelect) {
        onPickupSelect(coords)
      } else if (selectingLocation === 'dropoff' && onDropoffSelect) {
        onDropoffSelect(coords)
      }
    }
  })
  
  return null
}

// Posición predeterminada (Buenos Aires)
const defaultCenter: [number, number] = [-34.6037, -58.3816]

export default function LeafletMap({
  pickupCoords,
  dropoffCoords,
  onPickupSelect,
  onDropoffSelect
}: MapComponentProps) {
  const [selectingLocation, setSelectingLocation] = useState<'pickup' | 'dropoff' | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  
  // Inicializa los iconos al cargar el componente
  useEffect(() => {
    iconConfig()
  }, [])

  // Centra el mapa en las coordenadas seleccionadas
  useEffect(() => {
    if (!mapRef.current) return
    
    // Si hay coordenadas de origen y destino, ajusta la vista para mostrar ambos
    if (pickupCoords && dropoffCoords) {
      const bounds = L.latLngBounds(
        [pickupCoords[1], pickupCoords[0]],
        [dropoffCoords[1], dropoffCoords[0]]
      )
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    } 
    // Centra en el origen si solo hay origen
    else if (pickupCoords) {
      mapRef.current.setView([pickupCoords[1], pickupCoords[0]], 13)
    }
    // Centra en el destino si solo hay destino  
    else if (dropoffCoords) {
      mapRef.current.setView([dropoffCoords[1], dropoffCoords[0]], 13)
    }
  }, [pickupCoords, dropoffCoords])

  return (
    <div className="relative w-full h-[400px]">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <MapRef mapRef={mapRef} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents 
          onPickupSelect={(coords) => {
            if (onPickupSelect) {
              onPickupSelect(coords);
              setSelectingLocation(null);
            }
          }}
          onDropoffSelect={(coords) => {
            if (onDropoffSelect) {
              onDropoffSelect(coords);
              setSelectingLocation(null);
            }
          }}
          selectingLocation={selectingLocation}
        />
        
        {pickupCoords && (
          <Marker position={[pickupCoords[1], pickupCoords[0]]}>
            <Popup>Punto de recogida</Popup>
          </Marker>
        )}
        
        {dropoffCoords && (
          <Marker position={[dropoffCoords[1], dropoffCoords[0]]}>
            <Popup>Punto de destino</Popup>
          </Marker>
        )}
      </MapContainer>
      
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
        <div className="absolute top-4 left-4 right-4 z-[1000] bg-black bg-opacity-70 text-white p-2 rounded-md text-center">
          Haz clic en el mapa para seleccionar {selectingLocation === 'pickup' ? 'origen' : 'destino'}
        </div>
      )}
    </div>
  )
} 