'use client'

import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

// Fix para los iconos en Leaflet
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

// Ampliar la definición de Leaflet para incluir Routing
declare module 'leaflet' {
  namespace Routing {
    function control(options: any): any;
  }
}

export interface MapComponentProps {
  onSelectOrigin: (address: string, coords: [number, number]) => void;
  onSelectDestination: (address: string, coords: [number, number]) => void;
  originCoords: [number, number] | null;
  destinationCoords: [number, number] | null;
}

// Simulación de servicio de geocodificación inversa
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  // En una implementación real, aquí se haría una llamada a una API como Nominatim, Google Maps, etc.
  // Para este demo, simplemente retornamos las coordenadas formateadas
  const address = `Ubicación (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  
  // Simulamos un retraso para mostrar cómo sería con una API real
  return new Promise(resolve => setTimeout(() => resolve(address), 300));
};

const LeafletMap = ({ 
  onSelectOrigin, 
  onSelectDestination, 
  originCoords, 
  destinationCoords 
}: MapComponentProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<any>(null);
  const markerOriginRef = useRef<L.Marker | null>(null);
  const markerDestinationRef = useRef<L.Marker | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [isSelectingOrigin, setIsSelectingOrigin] = useState(true);

  // Inicializar el mapa
  useEffect(() => {
    if (typeof window !== 'undefined' && !mapRef.current) {
      // Configuración de iconos de Leaflet
      // Método seguro para acceder a _getIconUrl que existe en la implementación pero no en los tipos
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: typeof iconRetinaUrl === 'object' ? iconRetinaUrl.src : iconRetinaUrl,
        iconUrl: typeof iconUrl === 'object' ? iconUrl.src : iconUrl,
        shadowUrl: typeof shadowUrl === 'object' ? shadowUrl.src : shadowUrl
      });

      // Crear mapa centrado en Madrid, España
      const map = L.map('map').setView([40.416775, -3.703790], 13);
      
      // Añadir capa base de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Configurar eventos de clic en el mapa
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
      setMapInitialized(true);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onSelectOrigin, onSelectDestination, isSelectingOrigin]);

  // Actualizar marcadores cuando cambian las coordenadas
  useEffect(() => {
    if (!mapInitialized) return;
    const map = mapRef.current;
    if (!map) return;

    // Limpiar marcadores anteriores
    if (markerOriginRef.current) {
      map.removeLayer(markerOriginRef.current);
      markerOriginRef.current = null;
    }

    // Crear marcador de origen si hay coordenadas
    if (originCoords) {
      const marker = L.marker(originCoords, {
        icon: new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(map);
      
      marker.bindTooltip('Origen', { permanent: true, direction: 'top', offset: L.point(0, -30) }).openTooltip();
      markerOriginRef.current = marker;
      
      // Centrar el mapa en el origen si no hay destino
      if (!destinationCoords) {
        map.setView(originCoords, 13);
      }
    }

    // Limpiar marcador de destino anterior
    if (markerDestinationRef.current) {
      map.removeLayer(markerDestinationRef.current);
      markerDestinationRef.current = null;
    }

    // Crear marcador de destino si hay coordenadas
    if (destinationCoords) {
      const marker = L.marker(destinationCoords, {
        icon: new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(map);
      
      marker.bindTooltip('Destino', { permanent: true, direction: 'top', offset: L.point(0, -30) }).openTooltip();
      markerDestinationRef.current = marker;
    }

    // Crear ruta si hay origen y destino
    if (originCoords && destinationCoords) {
      // Remover ruta anterior si existe
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }

      // Crear nueva ruta
      // Usar la declaración de módulo que hemos añadido arriba
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(originCoords[0], originCoords[1]),
          L.latLng(destinationCoords[0], destinationCoords[1])
        ],
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [{ color: '#6366F1', weight: 5 }]
        },
        createMarker: function() { return null; } // No crear marcadores adicionales
      }).addTo(map);

      routingControlRef.current = routingControl;
      
      // Ajustar vista para mostrar toda la ruta
      const bounds = L.latLngBounds([originCoords, destinationCoords]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [originCoords, destinationCoords, mapInitialized]);

  return (
    <div className="relative h-full w-full">
      <div id="map" className="h-full w-full z-0"></div>
      
      {/* Panel de instrucciones */}
      <div className="absolute top-2 right-2 bg-white p-2 rounded shadow-md z-10">
        <div className="text-sm font-medium mb-2">
          {isSelectingOrigin ? 'Selecciona el origen' : 'Selecciona el destino'}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsSelectingOrigin(true)}
            className={`px-2 py-1 rounded text-xs ${isSelectingOrigin ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Origen
          </button>
          <button 
            onClick={() => setIsSelectingOrigin(false)}
            className={`px-2 py-1 rounded text-xs ${!isSelectingOrigin ? 'bg-red-500 text-white' : 'bg-gray-100'}`}
          >
            Destino
          </button>
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="absolute bottom-2 left-2 bg-white p-2 rounded shadow-md z-10">
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Origen</span>
        </div>
        <div className="flex items-center space-x-2 text-xs mt-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Destino</span>
        </div>
      </div>
    </div>
  );
};

export default LeafletMap; 