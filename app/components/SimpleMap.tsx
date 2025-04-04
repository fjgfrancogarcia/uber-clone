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
  onSelectOrigin?: (address: string, coords: [number, number]) => void;
  onSelectDestination?: (address: string, coords: [number, number]) => void;
  originCoords: [number, number] | null;
  destinationCoords: [number, number] | null;
  readOnly?: boolean;
  originLat?: number;
  originLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  onReset?: () => void;
}

// Función de geocodificación inversa mejorada
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    // Usamos Nominatim de OpenStreetMap para obtener nombres de lugares reales
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
      headers: {
        'Accept-Language': 'es', // Preferencia por resultados en español
        'User-Agent': 'ChauTuTaxiApp/1.0' // Identificador requerido por Nominatim
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
  destinationCoords,
  readOnly = false,
  originLat,
  originLng,
  destinationLat,
  destinationLng,
  onReset
}: MapComponentProps) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isSelectingOrigin, setIsSelectingOrigin] = useState(true);
  const originMarkerRef = useRef<Marker | null>(null);
  const destMarkerRef = useRef<Marker | null>(null);
  const lineRef = useRef<Polyline | null>(null);
  const [L, setL] = useState<any>(null);
  const [userLocationLoading, setUserLocationLoading] = useState(false);
  const [userLocationError, setUserLocationError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isUpdatingMarkers, setIsUpdatingMarkers] = useState(false);

  // Preparar las coordenadas
  const effectiveOriginCoords = originCoords || (originLat && originLng ? [originLat, originLng] as [number, number] : null);
  const effectiveDestCoords = destinationCoords || (destinationLat && destinationLng ? [destinationLat, destinationLng] as [number, number] : null);

  // Cargar Leaflet dinámicamente solo en el cliente
  useEffect(() => {
    // Importar Leaflet solo en el cliente
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
      // Cargar CSS de Leaflet de forma manual
      loadCSS('https://unpkg.com/leaflet@1.7.1/dist/leaflet.css');
    });
  }, []);

  // Función segura para operar en el mapa
  const safeMapOperation = (operation: (map: LeafletMap) => void) => {
    if (!mapRef.current || !mapReady) return;
    
    try {
      operation(mapRef.current);
    } catch (error) {
      console.error('Error en operación del mapa:', error);
    }
  };

  // Función para obtener la ubicación actual del usuario
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setUserLocationError('Tu navegador no soporta geolocalización');
      return;
    }

    setUserLocationLoading(true);
    setUserLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        safeMapOperation(map => {
          map.setView([latitude, longitude], 15);
        });
        
        // Si estamos seleccionando origen y no hay uno definido aún, establecerlo automáticamente
        if (isSelectingOrigin && !effectiveOriginCoords && onSelectOrigin) {
          try {
            const address = await reverseGeocode(latitude, longitude);
            onSelectOrigin(address, [latitude, longitude]);
          } catch (error) {
            console.error('Error al obtener dirección:', error);
          }
        }
        
        setUserLocationLoading(false);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error.message);
        setUserLocationError('No se pudo obtener tu ubicación');
        setUserLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  // Cambiar modo de selección con seguridad
  const toggleSelectionMode = (selectOrigin: boolean) => {
    // Evitar cambios rápidos consecutivos
    setTimeout(() => {
      setIsSelectingOrigin(selectOrigin);
    }, 50);
  };

  // Función para reiniciar el mapa
  const handleReset = () => {
    if (onReset) {
      // Llamar al callback del componente padre
      onReset();
    } else {
      // Si no hay callback, intentar limpiar internamente
      if (mapRef.current) {
        // Limpiar marcadores existentes
        try {
          setIsUpdatingMarkers(true);
          const map = mapRef.current;
          
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
          
          // Volver a modo selección de origen
          setIsSelectingOrigin(true);
          setIsUpdatingMarkers(false);
        } catch (error) {
          console.error('Error al reiniciar el mapa:', error);
          setIsUpdatingMarkers(false);
        }
      }
    }
  };

  // Inicializar el mapa cuando el componente se monta y Leaflet está cargado
  useEffect(() => {
    if (!L || !mapContainerRef.current || mapRef.current) return;

    try {
      // Garantizar que el contenedor tenga altura
      if (mapContainerRef.current.clientHeight === 0) {
        mapContainerRef.current.style.height = '400px';
      }

      // Solucionar el problema de los iconos
      const DefaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });
      
      L.Marker.prototype.options.icon = DefaultIcon;
      
      // Crear el mapa
      const map = L.map(mapContainerRef.current, {
        // Opciones adicionales para estabilidad
        fadeAnimation: false,
        zoomAnimation: false,
        markerZoomAnimation: false
      });
      
      // Añadir capa base
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Si hay coordenadas existentes, centrar el mapa en ellas
      if (effectiveOriginCoords) {
        map.setView(effectiveOriginCoords, 15);
        // Si hay origen pero no destino, cambiar automáticamente a modo selección de destino
        if (!effectiveDestCoords) {
          setTimeout(() => setIsSelectingOrigin(false), 100);
        }
      } else if (effectiveDestCoords) {
        map.setView(effectiveDestCoords, 15);
      } else {
        // Establecer una vista predeterminada solo si no hay ninguna coordenada
        map.setView([-34.603722, -58.381592], 13);
        // Asegurar que estamos en modo selección de origen si no hay coordenadas
        setTimeout(() => setIsSelectingOrigin(true), 100);
      }
      
      // Configurar evento de clic solo si no estamos en modo solo lectura
      if (!readOnly) {
        map.on('click', async (e: any) => {
          // Ignorar clics si estamos actualizando marcadores
          if (isUpdatingMarkers) return;
          
          try {
            const { lat, lng } = e.latlng;
            const address = await reverseGeocode(lat, lng);
            
            // Si no hay origen, siempre seleccionar origen primero
            if (!effectiveOriginCoords && onSelectOrigin) {
              onSelectOrigin(address, [lat, lng]);
              // Cambiar a modo destino automáticamente después de seleccionar origen
              setTimeout(() => setIsSelectingOrigin(false), 50);
            } 
            // Si ya hay origen pero estamos en modo origen, reemplazar el origen
            else if (isSelectingOrigin && onSelectOrigin) {
              onSelectOrigin(address, [lat, lng]);
            } 
            // Si ya hay origen y estamos en modo destino, seleccionar destino
            else if (!isSelectingOrigin && onSelectDestination) {
              onSelectDestination(address, [lat, lng]);
              // Volver a modo origen para futuros clics (aunque estará deshabilitado visualmente)
              setTimeout(() => setIsSelectingOrigin(true), 50);
            }
          } catch (error) {
            console.error('Error al manejar clic en el mapa:', error);
          }
        });
      }
      
      mapRef.current = map;
      
      // Notificar que el mapa está listo (con un pequeño retraso para estar seguros)
      setTimeout(() => {
        setMapReady(true);
        
        // Intentar obtener la ubicación actual del usuario
        if (!readOnly && !effectiveOriginCoords) {
          setTimeout(getUserLocation, 200);
        }
      }, 300);
    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
    }
    
    // Limpiar al desmontar
    return () => {
      try {
        setMapReady(false);
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (error) {
        console.error('Error al limpiar el mapa:', error);
      }
    };
  }, [L, onSelectOrigin, onSelectDestination, readOnly, effectiveOriginCoords, effectiveDestCoords]);
  
  // Actualizar marcadores cuando cambian las coordenadas
  useEffect(() => {
    if (!L || !mapRef.current || !mapReady) return;
    
    try {
      setIsUpdatingMarkers(true);
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
      if (effectiveOriginCoords) {
        originMarkerRef.current = L.marker(effectiveOriginCoords)
          .addTo(map)
          .bindPopup('Origen');
      }
      
      // Crear marcador de destino
      if (effectiveDestCoords) {
        destMarkerRef.current = L.marker(effectiveDestCoords)
          .addTo(map)
          .bindPopup('Destino');
      }
      
      // Crear línea entre origen y destino
      if (effectiveOriginCoords && effectiveDestCoords) {
        lineRef.current = L.polyline([effectiveOriginCoords, effectiveDestCoords], {
          color: 'blue',
          weight: 3
        }).addTo(map);
        
        // Ajustar vista para mostrar ambos puntos
        const bounds = L.latLngBounds([effectiveOriginCoords, effectiveDestCoords]);
        setTimeout(() => {
          if (mapRef.current) {
            try {
              mapRef.current.fitBounds(bounds, { padding: [50, 50] });
            } catch (error) {
              console.error('Error al ajustar vista:', error);
            }
          }
        }, 100);
      }
      // Finalizar la actualización con un pequeño retraso
      setTimeout(() => {
        setIsUpdatingMarkers(false);
      }, 100);
    } catch (error) {
      console.error('Error al actualizar marcadores:', error);
      setIsUpdatingMarkers(false);
    }
  }, [L, effectiveOriginCoords, effectiveDestCoords, mapReady]);

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-grow">
        <div ref={mapContainerRef} className="h-full w-full"></div>
        
        {/* Panel de control (solo visible si no es de solo lectura) */}
        {!readOnly && (
          <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow z-[1000] border-2 border-gray-300">
            <p className="text-sm font-medium mb-2">
              {isSelectingOrigin ? "Selecciona el origen" : "Selecciona el destino"}
            </p>
            <div className="flex space-x-2 mb-2">
              <button
                className={`px-2 py-1 text-xs rounded ${isSelectingOrigin ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                onClick={() => toggleSelectionMode(true)}
                disabled={isUpdatingMarkers}
              >
                Origen
              </button>
              <button
                className={`px-2 py-1 text-xs rounded ${!isSelectingOrigin ? 'bg-red-500 text-white' : effectiveOriginCoords ? 'bg-gray-100' : 'bg-gray-300 cursor-not-allowed'}`}
                onClick={() => toggleSelectionMode(false)}
                disabled={!effectiveOriginCoords || isUpdatingMarkers}
              >
                Destino
              </button>
            </div>
            <div className="flex space-x-2 mb-2">
              <button
                className="flex-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                onClick={getUserLocation}
                disabled={userLocationLoading || !mapReady}
              >
                {userLocationLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Localizando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>Mi ubicación</span>
                  </>
                )}
              </button>
              
              {(effectiveOriginCoords || effectiveDestCoords) && (
                <button
                  className="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center"
                  onClick={handleReset}
                  disabled={isUpdatingMarkers || (!effectiveOriginCoords && !effectiveDestCoords)}
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>Limpiar</span>
                </button>
              )}
            </div>
            
            {userLocationError && (
              <p className="text-xs text-red-500 mt-1">{userLocationError}</p>
            )}
            {!mapReady && (
              <p className="text-xs text-gray-500 mt-1">Cargando mapa...</p>
            )}
            {effectiveOriginCoords && !effectiveDestCoords && (
              <p className="text-xs text-blue-500 mt-1">Origen seleccionado. Ahora selecciona el destino.</p>
            )}
            {effectiveOriginCoords && effectiveDestCoords && (
              <p className="text-xs text-green-500 mt-1">¡Origen y destino seleccionados!</p>
            )}
          </div>
        )}
        
        {/* Leyenda (siempre visible) */}
        <div className="absolute bottom-2 left-2 bg-white p-2 rounded-md shadow z-[1000] border-2 border-gray-300">
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
      
      {/* Instrucciones de uso (siempre visibles debajo del mapa) */}
      {!readOnly && (
        <div className="bg-white p-3 rounded-md shadow border-2 border-gray-300 text-center mt-2">
          <p className="text-sm font-medium mb-2">¿Cómo usar el mapa?</p>
          <ol className="text-xs text-left list-decimal pl-5 space-y-1">
            <li>Haz clic en el mapa para seleccionar el <span className="text-blue-500 font-medium">origen</span></li>
            <li>Luego haz clic nuevamente para seleccionar el <span className="text-red-500 font-medium">destino</span></li>
            <li>O puedes usar el botón "Mi ubicación" para usar tu ubicación actual como origen</li>
            <li>Usa el botón "Limpiar" si necesitas reiniciar los puntos seleccionados</li>
          </ol>
        </div>
      )}
    </div>
  );
};

// Exportamos un componente que solo se renderiza en el cliente
const SimpleMap = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
}) as React.ComponentType<MapComponentProps>

export default SimpleMap; 