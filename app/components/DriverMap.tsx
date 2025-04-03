'use client'

import { useRef, useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
// Eliminamos estas importaciones que causan problemas en producción
// import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
// import 'leaflet-defaulticon-compatibility'

// Definir interfaces
interface Passenger {
  id: string;
  name: string;
  image: string | null;
}

interface Ride {
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
}

interface DriverMapProps {
  rides: Ride[];
  onAccept: (rideId: string) => void;
}

// Mapa por defecto centrado en Guadalajara, México
const DEFAULT_CENTER: [number, number] = [20.6666700, -103.3333300];
const DEFAULT_ZOOM = 13;

const DriverMap = ({ rides, onAccept }: DriverMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const markersRef = useRef<L.Marker[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);

  // Configurar el mapa cuando el componente se monta
  useEffect(() => {
    // Evitar errores con SSR
    if (typeof window === 'undefined' || !mapRef.current) {
      return;
    }

    // Arreglar el problema de los íconos de Leaflet
    // @ts-ignore - _getIconUrl existe en la implementación pero no en el tipo
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    try {
      console.log('Inicializando mapa...');
      
      // Inicializar mapa con opciones simples
      const mapInstance = L.map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: true,
      });

      // Añadir capa de tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapInstance);

      // Guardar la instancia del mapa
      setMap(mapInstance);
      
      // Dar tiempo al mapa para inicializarse
      setTimeout(() => {
        if (mapInstance) {
          mapInstance.invalidateSize();
          setIsLoading(false);
          console.log('Mapa inicializado correctamente');
        }
      }, 300);

      // Limpiar al desmontar
      return () => {
        mapInstance.remove();
      };
    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
      setIsLoading(false);
    }
  }, []);

  // Añadir marcadores cuando cambian los viajes o cuando el mapa está listo
  useEffect(() => {
    if (!map) return;

    console.log(`Actualizando mapa con ${rides.length} viajes`);

    // Limpiar marcadores existentes
    markersRef.current.forEach(marker => marker.remove());
    polylinesRef.current.forEach(polyline => polyline.remove());
    markersRef.current = [];
    polylinesRef.current = [];

    // Si no hay viajes, mostrar mensaje
    if (rides.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      
      // Añadir marcador informativo
      const marker = L.marker(DEFAULT_CENTER)
        .addTo(map)
        .bindPopup('No hay viajes disponibles en este momento')
        .openPopup();
      
      markersRef.current.push(marker);
      return;
    }

    // Añadir marcadores para cada viaje
    const bounds = L.latLngBounds([]);
    
    rides.forEach(ride => {
      try {
        // Crear íconos personalizados
        const pickupIcon = L.divIcon({
          className: 'custom-pickup-icon',
          html: `<div style="background-color: #10B981; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.4);">A</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        
        const dropoffIcon = L.divIcon({
          className: 'custom-dropoff-icon',
          html: `<div style="background-color: #EF4444; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.4);">B</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        // Añadir marcador de origen
        const pickupMarker = L.marker([ride.pickupLat, ride.pickupLng], { icon: pickupIcon })
          .addTo(map)
          .bindPopup(() => {
            // Crear popup
            const container = document.createElement('div');
            container.className = 'p-3 max-w-xs';
            
            // Formatear precio
            const formatter = new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'USD',
            });
            
            // Contenido del popup
            container.innerHTML = `
              <div class="flex items-center mb-2">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <span class="text-blue-600 font-bold">${ride.passenger.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h3 class="font-medium">${ride.passenger.name}</h3>
                  <p class="text-sm text-green-600 font-bold">${formatter.format(ride.price)}</p>
                </div>
              </div>
              <div class="mb-3">
                <div class="flex items-start mb-1">
                  <div class="w-4 h-4 rounded-full bg-green-500 mt-1 mr-2"></div>
                  <p class="text-sm font-medium">${ride.pickup}</p>
                </div>
                <div class="flex items-start">
                  <div class="w-4 h-4 rounded-full bg-red-500 mt-1 mr-2"></div>
                  <p class="text-sm">${ride.dropoff}</p>
                </div>
              </div>
              <button id="accept-ride-${ride.id}" class="w-full py-2 px-3 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                Aceptar viaje
              </button>
            `;
            
            // Añadir event listener
            setTimeout(() => {
              const button = document.getElementById(`accept-ride-${ride.id}`);
              if (button) {
                button.addEventListener('click', () => onAccept(ride.id));
              }
            }, 0);
            
            return container;
          });
        
        // Añadir marcador de destino
        const dropoffMarker = L.marker([ride.dropoffLat, ride.dropoffLng], { icon: dropoffIcon })
          .addTo(map);
        
        // Añadir línea entre origen y destino
        const polyline = L.polyline(
          [
            [ride.pickupLat, ride.pickupLng],
            [ride.dropoffLat, ride.dropoffLng],
          ],
          { color: '#4F46E5', weight: 3, opacity: 0.7, dashArray: '7, 7' }
        ).addTo(map);
        
        // Guardar referencias
        markersRef.current.push(pickupMarker, dropoffMarker);
        polylinesRef.current.push(polyline);
        
        // Expandir bounds para incluir estos puntos
        bounds.extend([ride.pickupLat, ride.pickupLng]);
        bounds.extend([ride.dropoffLat, ride.dropoffLng]);
      } catch (error) {
        console.error('Error al procesar viaje:', error, ride);
      }
    });
    
    // Ajustar vista para mostrar todos los marcadores
    if (bounds.isValid()) {
      setTimeout(() => {
        try {
          map.invalidateSize();
          map.fitBounds(bounds, { padding: [50, 50] });
        } catch (error) {
          console.error('Error al ajustar vista:', error);
        }
      }, 200);
    }
  }, [rides, map, onAccept]);

  // Actualizar tamaño del mapa cuando cambia el tamaño de la ventana
  useEffect(() => {
    if (!map) return;
    
    const handleResize = () => {
      map.invalidateSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  return (
    <div className="relative w-full h-[500px]">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg shadow-md"
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70 rounded-lg">
          <div className="text-center">
            <div className="animate-spin w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
            <p className="text-gray-600">Cargando mapa...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverMap; 