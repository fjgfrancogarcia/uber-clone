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

// Fix para íconos de Leaflet en Next.js
const fixLeafletIcon = () => {
  // Solo ejecutar en el navegador
  if (typeof window !== 'undefined') {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }
};

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

// Mapa por defecto centrado en Guadalajara, México
const DEFAULT_CENTER: [number, number] = [20.6666700, -103.3333300];
const DEFAULT_ZOOM = 13;

const DriverMap = ({ rides, onAccept }: DriverMapProps) => {
  console.log('DriverMap renderizando con', rides.length, 'viajes');
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const markers = useRef<L.Marker[]>([]);
  const polylines = useRef<L.Polyline[]>([]);

  // Configurar los íconos de Leaflet
  useEffect(() => {
    fixLeafletIcon();
  }, []);

  // Inicializar mapa
  useEffect(() => {
    console.log('Ejecutando efecto de inicialización del mapa, DOM listo:', !!mapRef.current);
    
    // Asegurarse de que el componente está montado y el mapa no está ya inicializado
    if (!mapRef.current || leafletMapRef.current) return;

    // Asegurarse de que Leaflet está disponible en el navegador
    if (typeof window !== 'undefined') {
      try {
        console.log('Inicializando mapa Leaflet');
        
        // Crear mapa con opciones simplificadas
        const newMap = L.map(mapRef.current, {
          // Opciones para evitar problemas de inicialización
          fadeAnimation: false,
          zoomAnimation: false,
          attributionControl: true,
          zoomControl: true,
        }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

        // Añadir capa de tiles de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(newMap);

        // Añadir marcador de ejemplo para verificar que el mapa funciona
        L.marker(DEFAULT_CENTER as L.LatLngExpression).addTo(newMap)
          .bindPopup('Mapa inicializado correctamente')
          .openPopup();

        // Asignar el mapa a la referencia
        leafletMapRef.current = newMap;
        console.log('Mapa inicializado correctamente');

        // Damos tiempo a Leaflet para que se inicialice completamente
        setTimeout(() => {
          if (leafletMapRef.current) {
            console.log('Invalidando tamaño del mapa después de timeout');
            // Forzar recálculo de tamaño del mapa
            leafletMapRef.current.invalidateSize();
            setIsMapReady(true);
          }
        }, 300);
      } catch (err) {
        console.error('Error al inicializar el mapa de Leaflet:', err);
      }
    }

    return () => {
      console.log('Limpieza del efecto de inicialización del mapa');
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
    console.log('Ejecutando efecto de actualización de marcadores, mapa listo:', isMapReady, 'viajes:', rides.length);
    
    // Solo proceder si el mapa está listo
    if (!isMapReady || !leafletMapRef.current) {
      console.log('Mapa no listo o no hay mapa inicializado');
      return;
    }

    const map = leafletMapRef.current;

    // Limpiar marcadores y polilíneas existentes
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];
    
    polylines.current.forEach((polyline) => polyline.remove());
    polylines.current = [];

    // Si no hay viajes, mantener el mapa en la posición predeterminada
    if (rides.length === 0) {
      console.log('No hay viajes para mostrar');
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      // Añadir un marcador indicando que no hay viajes
      L.marker(DEFAULT_CENTER as L.LatLngExpression).addTo(map)
        .bindPopup('No hay viajes disponibles en este momento')
        .openPopup();
      return;
    }

    try {
      console.log('Agregando', rides.length, 'viajes al mapa');
      const bounds = L.latLngBounds([]);

      // Agregar marcadores para cada viaje
      rides.forEach((ride, index) => {
        try {
          console.log(`Procesando viaje ${index + 1}/${rides.length}, ID: ${ride.id}`);
          
          // Verificar que las coordenadas son números válidos
          if (isNaN(ride.pickupLat) || isNaN(ride.pickupLng) || 
              isNaN(ride.dropoffLat) || isNaN(ride.dropoffLng)) {
            console.error('Coordenadas inválidas para el viaje:', ride);
            return;
          }
          
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
          bounds.extend([ride.pickupLat, ride.pickupLng] as L.LatLngExpression);
          bounds.extend([ride.dropoffLat, ride.dropoffLng] as L.LatLngExpression);

          // Guardar marcadores y líneas para limpiarlos después
          markers.current.push(pickupMarker, dropoffMarker);
          polylines.current.push(polyline);
          
          console.log(`Viaje ${index + 1} añadido correctamente`);
        } catch (err) {
          console.error(`Error al añadir marcador para viaje ${index + 1}:`, err, ride);
        }
      });

      // Ajustar la vista para mostrar todos los marcadores
      if (bounds.isValid()) {
        console.log('Ajustando vista del mapa para mostrar todos los marcadores');
        // Envolver en try-catch y timeout para asegurar que el mapa está listo
        setTimeout(() => {
          try {
            if (map && bounds.isValid()) {
              map.invalidateSize();
              map.fitBounds(bounds, { padding: [50, 50] });
              console.log('Vista del mapa ajustada correctamente');
            }
          } catch (err) {
            console.error('Error al ajustar la vista del mapa:', err);
          }
        }, 300);
      } else {
        console.log('No se pudieron establecer límites válidos para el mapa');
        map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
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
          console.log('Invalidando tamaño del mapa por cambio de tamaño de ventana');
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

  // Añadir efecto para forzar invalidación del tamaño periódicamente
  useEffect(() => {
    // Algunas veces el mapa puede no inicializarse correctamente,
    // este intervalo asegura que se intente recalcular el tamaño
    const interval = setInterval(() => {
      if (leafletMapRef.current && isMapReady) {
        try {
          leafletMapRef.current.invalidateSize();
        } catch (err) {
          console.error('Error al invalidar tamaño del mapa en intervalo:', err);
        }
      }
    }, 2000); // Cada 2 segundos

    return () => clearInterval(interval);
  }, [isMapReady]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-[500px] rounded-lg shadow-md relative"
        style={{ zIndex: 0 }}
      />
      
      {/* Indicador de estado del mapa */}
      {!isMapReady && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
            <p className="text-gray-600">Inicializando mapa...</p>
          </div>
        </div>
      )}
      
      {/* Debug panel (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <p>Estado del mapa: {isMapReady ? 'Listo' : 'Cargando'}</p>
          <p>Viajes disponibles: {rides.length}</p>
          <p>Marcadores en mapa: {markers.current.length}</p>
        </div>
      )}
    </div>
  );
};

export default DriverMap; 