'use client'

import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface MapComponentProps {
  onSelectOrigin: (address: string, coords: [number, number]) => void;
  onSelectDestination: (address: string, coords: [number, number]) => void;
  originCoords: [number, number] | null;
  destinationCoords: [number, number] | null;
}

// Simulación de servicio de geocodificación inversa
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  // Para este demo, simplemente retornamos las coordenadas formateadas
  return `Ubicación (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
};

const SimpleMap = ({ 
  onSelectOrigin, 
  onSelectDestination, 
  originCoords, 
  destinationCoords 
}: MapComponentProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isSelectingOrigin, setIsSelectingOrigin] = useState(true);
  const originMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Polyline | null>(null);
  const lineRef = useRef<L.Polyline | null>(null);

  // Inicializar el mapa cuando el componente se monta
  useEffect(() => {
    if (typeof window !== 'undefined' && mapContainerRef.current && !mapRef.current) {
      // Solucionar el problema de los iconos
      const DefaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });
      
      L.Marker.prototype.options.icon = DefaultIcon;
      
      // Crear el mapa
      const map = L.map(mapContainerRef.current).setView([40.416775, -3.703790], 13);
      
      // Añadir capa base
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Configurar evento de clic
      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        const address = await reverseGeocode(lat, lng);
        
        if (isSelectingOrigin) {
          onSelectOrigin(address, [lat, lng]);
          setIsSelectingOrigin(false);
        } else {
          onSelectDestination(address, [lat, lng]);
          setIsSelectingOrigin(true);
        }
      });
      
      mapRef.current = map;
    }
    
    // Limpiar al desmontar
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onSelectOrigin, onSelectDestination, isSelectingOrigin]);
  
  // Actualizar marcadores cuando cambian las coordenadas
  useEffect(() => {
    if (!mapRef.current) return;
    
    const map = mapRef.current;
    
    // Limpiar marcadores existentes
    if (originMarkerRef.current) {
      map.removeLayer(originMarkerRef.current);
      originMarkerRef.current = null;
    }
    
    if (destMarkerRef.current) {
      map.removeLayer(destMarkerRef.current);
      destMarkerRef.current = null;
    }
    
    if (lineRef.current) {
      map.removeLayer(lineRef.current);
      lineRef.current = null;
    }
    
    // Crear marcador de origen
    if (originCoords) {
      originMarkerRef.current = L.marker(originCoords)
        .addTo(map)
        .bindPopup('Origen');
    }
    
    // Crear marcador de destino
    if (destinationCoords) {
      destMarkerRef.current = L.marker(destinationCoords)
        .addTo(map)
        .bindPopup('Destino') as unknown as L.Polyline;
    }
    
    // Crear línea entre origen y destino
    if (originCoords && destinationCoords) {
      lineRef.current = L.polyline([originCoords, destinationCoords], {
        color: 'blue',
        weight: 3
      }).addTo(map);
      
      // Ajustar vista para mostrar ambos puntos
      const bounds = L.latLngBounds([originCoords, destinationCoords]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (originCoords) {
      map.setView(originCoords, 13);
    } else if (destinationCoords) {
      map.setView(destinationCoords, 13);
    }
  }, [originCoords, destinationCoords]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full"></div>
      
      {/* Panel de control */}
      <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow z-10">
        <p className="text-sm font-medium mb-2">
          {isSelectingOrigin ? "Selecciona el origen" : "Selecciona el destino"}
        </p>
        <div className="flex space-x-2">
          <button
            className={`px-2 py-1 text-xs rounded ${isSelectingOrigin ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setIsSelectingOrigin(true)}
          >
            Origen
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${!isSelectingOrigin ? 'bg-red-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setIsSelectingOrigin(false)}
          >
            Destino
          </button>
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="absolute bottom-2 left-2 bg-white p-2 rounded-md shadow z-10">
        <div className="flex items-center text-xs mb-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
          <span>Origen</span>
        </div>
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
          <span>Destino</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleMap; 