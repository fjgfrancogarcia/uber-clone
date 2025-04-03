'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

// Importar tipos de Leaflet sin importar la biblioteca completa
import type { Map as LeafletMap, Marker, Polyline } from 'leaflet'

// Función para cargar CSS de forma dinámica
function loadCSS(url: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }
}

// Interfaces
export interface MapComponentProps {
  onSelectOrigin: (address: string, coords: [number, number]) => void;
  onSelectDestination: (address: string, coords: [number, number]) => void;
  originCoords: [number, number] | null;
  destinationCoords: [number, number] | null;
}

// Función de geocodificación inversa mejorada
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    // Usamos Nominatim de OpenStreetMap para obtener nombres de lugares reales
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
      headers: {
        'Accept-Language': 'es', // Preferencia por resultados en español
        'User-Agent': 'UberCloneApp/1.0' // Identificador requerido por Nominatim
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener dirección');
    }
    
    const data = await response.json();
    
    // Construir una dirección legible a partir de los componentes
    let address = '';
    
    if (data.address) {
      const components = [];
      
      if (data.address.road) components.push(data.address.road);
      if (data.address.house_number) components.push(data.address.house_number);
      if (data.address.suburb) components.push(data.address.suburb);
      if (data.address.city || data.address.town || data.address.village) {
        components.push(data.address.city || data.address.town || data.address.village);
      }
      
      address = components.join(', ');
      
      // Si no pudimos construir una dirección, usar el display_name
      if (!address && data.display_name) {
        address = data.display_name;
      }
    }
    
    // Si todo falla, devolver coordenadas formateadas
    return address || `Ubicación (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  } catch (error) {
    console.error('Error en geocodificación inversa:', error);
    // En caso de error, devolver coordenadas formateadas
    return `Ubicación (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }
};

// Componente base del mapa que se cargará solo en el cliente
const MapComponent = ({ 
  onSelectOrigin, 
  onSelectDestination, 
  originCoords, 
  destinationCoords 
}: MapComponentProps) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isSelectingOrigin, setIsSelectingOrigin] = useState(true);
  const originMarkerRef = useRef<Marker | null>(null);
  const destMarkerRef = useRef<Marker | null>(null);
  const lineRef = useRef<Polyline | null>(null);
  const [L, setL] = useState<any>(null);

  // Cargar Leaflet dinámicamente solo en el cliente
  useEffect(() => {
    // Importar Leaflet solo en el cliente
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
      // Cargar CSS de Leaflet de forma manual
      loadCSS('https://unpkg.com/leaflet@1.7.1/dist/leaflet.css');
    });
  }, []);

  // Inicializar el mapa cuando el componente se monta y Leaflet está cargado
  useEffect(() => {
    if (!L || !mapContainerRef.current || mapRef.current) return;

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
    map.on('click', async (e: any) => {
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
    
    // Limpiar al desmontar
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [L, onSelectOrigin, onSelectDestination, isSelectingOrigin]);
  
  // Actualizar marcadores cuando cambian las coordenadas
  useEffect(() => {
    if (!L || !mapRef.current) return;
    
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
        .bindPopup('Destino');
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
  }, [L, originCoords, destinationCoords]);

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

// Exportamos un componente que solo se renderiza en el cliente
const SimpleMap = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
}) as React.ComponentType<MapComponentProps>

export default SimpleMap; 