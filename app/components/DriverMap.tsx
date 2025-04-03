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

// Función para crear marcadores HTML personalizados
const createHtmlIcon = (color: string, letter: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.4);">${letter}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Función para crear un popup personalizado
const createRidePopup = (ride: Ride, onAccept: (rideId: string) => void) => {
  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
  });

  const container = L.DomUtil.create('div', 'ride-popup');
  container.innerHTML = `
    <div class="p-3 max-w-xs">
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
    </div>
  `;

  // Agregar event listener al botón
  setTimeout(() => {
    const button = document.getElementById(`accept-ride-${ride.id}`);
    if (button) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        onAccept(ride.id);
      });
    }
  }, 0);

  return container;
};

const DriverMap = ({ rides, onAccept }: DriverMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const markers = useRef<L.Marker[]>([]);
  const polylines = useRef<L.Polyline[]>([]);

  // Inicializar mapa
  useEffect(() => {
    // Asegurarse de que el componente está montado y el mapa no está ya inicializado
    if (!mapRef.current || leafletMapRef.current) return;

    // Asegurarse de que Leaflet está disponible en el navegador
    if (typeof window !== 'undefined') {
      try {
        // Centro inicial (se ajustará automáticamente cuando se añadan marcadores)
        const newMap = L.map(mapRef.current, {
          // Opciones para evitar problemas de inicialización
          fadeAnimation: false,
          zoomAnimation: false
        }).setView([20.6666700, -103.3333300], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(newMap);

        // Asignar el mapa a la referencia
        leafletMapRef.current = newMap;

        // Damos tiempo a Leaflet para que se inicialice completamente
        setTimeout(() => {
          if (leafletMapRef.current) {
            // Forzar recálculo de tamaño del mapa
            leafletMapRef.current.invalidateSize();
            setIsMapReady(true);
          }
        }, 100);
      } catch (err) {
        console.error('Error al inicializar el mapa de Leaflet:', err);
      }
    }

    return () => {
      if (leafletMapRef.current) {
        // Limpiar todo antes de desmontar
        markers.current.forEach(marker => marker.remove());
        polylines.current.forEach(polyline => polyline.remove());
        markers.current = [];
        polylines.current = [];
        
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []);

  // Agregar marcadores cuando cambian los viajes
  useEffect(() => {
    // Solo proceder si el mapa está listo y hay viajes
    if (!isMapReady || !leafletMapRef.current || rides.length === 0) return;

    const map = leafletMapRef.current;

    // Limpiar marcadores y polilíneas existentes
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];
    
    polylines.current.forEach((polyline) => polyline.remove());
    polylines.current = [];

    try {
      const bounds = L.latLngBounds([]);

      // Agregar marcadores para cada viaje
      rides.forEach((ride) => {
        try {
          // Crear iconos personalizados para origen y destino
          const pickupIcon = createHtmlIcon('#10B981', 'A'); // Verde para origen
          const dropoffIcon = createHtmlIcon('#EF4444', 'B'); // Rojo para destino

          // Marcador de recogida
          const pickupMarker = L.marker([ride.pickupLat, ride.pickupLng], { icon: pickupIcon })
            .addTo(map)
            .bindPopup(() => createRidePopup(ride, onAccept));

          // Marcador de destino
          const dropoffMarker = L.marker([ride.dropoffLat, ride.dropoffLng], { icon: dropoffIcon })
            .addTo(map);

          // Línea entre recogida y destino
          const polyline = L.polyline(
            [
              [ride.pickupLat, ride.pickupLng],
              [ride.dropoffLat, ride.dropoffLng],
            ],
            { color: '#4F46E5', weight: 3, opacity: 0.7, dashArray: '7, 7' }
          ).addTo(map);

          // Extender los límites para incluir ambos puntos
          bounds.extend([ride.pickupLat, ride.pickupLng]);
          bounds.extend([ride.dropoffLat, ride.dropoffLng]);

          // Guardar marcadores y líneas para limpiarlos después
          markers.current.push(pickupMarker, dropoffMarker);
          polylines.current.push(polyline);
        } catch (err) {
          console.error('Error al añadir marcador:', err, ride);
        }
      });

      // Ajustar la vista para mostrar todos los marcadores
      if (bounds.isValid()) {
        // Envolver en try-catch y timeout para asegurar que el mapa está listo
        setTimeout(() => {
          try {
            if (map && bounds.isValid()) {
              map.invalidateSize();
              map.fitBounds(bounds, { padding: [50, 50] });
            }
          } catch (err) {
            console.error('Error al ajustar la vista del mapa:', err);
          }
        }, 100);
      }
    } catch (err) {
      console.error('Error general al actualizar el mapa:', err);
    }
  }, [isMapReady, rides, onAccept]);

  // Forzar recálculo del tamaño del mapa cuando la ventana cambia de tamaño
  useEffect(() => {
    const handleResize = () => {
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.invalidateSize();
        } catch (err) {
          console.error('Error al invalidar el tamaño del mapa:', err);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[500px] rounded-lg shadow-md"
      style={{ zIndex: 0 }}
    />
  );
};

export default DriverMap; 