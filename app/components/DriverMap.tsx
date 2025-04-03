'use client'

import { useRef, useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet-defaulticon-compatibility'

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

// Inicializar iconos para evitar problemas con SSR
const initializeLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
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
  const [map, setMap] = useState<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || map) return;
    
    // Inicializar iconos
    initializeLeafletIcons();

    // Centro inicial (se ajustará automáticamente cuando se añadan marcadores)
    const initialMap = L.map(mapRef.current).setView([20.6666700, -103.3333300], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(initialMap);

    setMap(initialMap);

    return () => {
      initialMap.remove();
    };
  }, [map]);

  // Agregar marcadores cuando cambian los viajes
  useEffect(() => {
    if (!map) return;

    // Limpiar marcadores existentes
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    if (rides.length === 0) return;

    const bounds = L.latLngBounds([]);

    // Agregar marcadores para cada viaje
    rides.forEach((ride) => {
      // Marcador de recogida
      const pickupMarker = L.marker([ride.pickupLat, ride.pickupLng])
        .addTo(map)
        .bindPopup(() => createRidePopup(ride, onAccept));

      // Marcador de destino
      const dropoffMarker = L.marker([ride.dropoffLat, ride.dropoffLng])
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

      // Guardar marcadores para limpiarlos después
      markers.current.push(pickupMarker, dropoffMarker);
    });

    // Ajustar la vista para mostrar todos los marcadores
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, rides, onAccept]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[500px] rounded-lg shadow-md"
      style={{ zIndex: 0 }}
    />
  );
};

export default DriverMap; 