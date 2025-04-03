'use client'

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

// Importar toast de forma dinámica
const toast = {
  loading: (message: string) => {
    // Esta función será sobrescrita cuando el módulo toast se cargue
    console.log('Loading:', message);
    return '';
  },
  success: (message: string, options?: any) => {
    console.log('Success:', message);
  },
  error: (message: string, options?: any) => {
    console.error('Error:', message);
  }
};

// Cargar el módulo de forma dinámica
if (typeof window !== 'undefined') {
  import('react-hot-toast').then((mod) => {
    // Reemplazar las funciones del objeto toast
    Object.assign(toast, mod.toast);
  });
}

// Cargar directamente el componente LeafletMap para evitar problemas de SSR
const LeafletMap = dynamic(() => import("./components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    </div>
  )
})

// Función para convertir coordenadas a dirección (geocodificación inversa)
const getAddressFromCoords = async (coords: [number, number]): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[1]}&lon=${coords[0]}&addressdetails=1`
    );
    const data = await response.json();
    
    if (data && data.display_name) {
      // Extraer solo los componentes importantes de la dirección
      const parts = data.display_name.split(', ');
      // Tomar solo los primeros 2-3 componentes para una dirección más corta
      return parts.slice(0, 3).join(', ');
    }
    return `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`;
  } catch (error) {
    console.error('Error al obtener dirección:', error);
    return `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`;
  }
};

export default function HomePage() {
  const [pickup, setPickup] = useState("")
  const [dropoff, setDropoff] = useState("")
  const [pickupCoords, setPickupCoords] = useState<[number, number] | undefined>(undefined)
  const [dropoffCoords, setDropoffCoords] = useState<[number, number] | undefined>(undefined)
  const [price, setPrice] = useState<number | null>(null)
  const router = useRouter()
  const { data: session } = useSession()

  // Redireccionar a los conductores al panel de conductor
  useEffect(() => {
    if (session?.user?.role === 'DRIVER') {
      router.push('/driver');
    }
  }, [session, router]);

  // Si el usuario es conductor, no mostrar la interfaz de solicitud de viaje
  if (session?.user?.role === 'DRIVER') {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Panel de Conductor</h1>
          <p className="text-gray-600 mb-6">
            Como conductor, no puedes solicitar viajes. Estás siendo redirigido al panel de conductor.
          </p>
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  // Calcular el precio basado en la distancia entre origen y destino
  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      // Fórmula muy simplificada para calcular el precio basado en la distancia
      const distance = calculateDistance(pickupCoords, dropoffCoords)
      const calculatedPrice = Math.round(distance * 1.5) // $1.5 por km
      setPrice(calculatedPrice)
    } else {
      setPrice(null)
    }
  }, [pickupCoords, dropoffCoords])

  // Actualizar la dirección cuando cambien las coordenadas
  useEffect(() => {
    if (pickupCoords) {
      getAddressFromCoords(pickupCoords).then(address => {
        setPickup(address);
      });
    }
  }, [pickupCoords]);

  useEffect(() => {
    if (dropoffCoords) {
      getAddressFromCoords(dropoffCoords).then(address => {
        setDropoff(address);
      });
    }
  }, [dropoffCoords]);

  // Función para calcular la distancia entre dos puntos
  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const [lon1, lat1] = point1
    const [lon2, lat2] = point2
    
    // Radio de la Tierra en km
    const R = 6371
    
    // Convertir a radianes
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    
    // Fórmula de Haversine
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c // Distancia en km
    
    return distance
  }

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180)
  }

  const handleRequestRide = async () => {
    if (!pickupCoords || !dropoffCoords || !price) return
    
    try {
      // Mostrar estado de carga
      const loadingToast = toast.loading('Solicitando viaje...')
      
      // Enviar datos a la API
      const response = await fetch('/api/rides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickup,
          dropoff,
          price,
          pickupCoords,
          dropoffCoords,
        }),
      })
      
      const data = await response.json()
      
      // Actualizar estado de carga según resultado
      if (response.ok) {
        toast.success('¡Viaje solicitado con éxito!', { id: loadingToast })
        
        // Reset form
        setPickup('')
        setDropoff('')
        setPickupCoords(undefined)
        setDropoffCoords(undefined)
        setPrice(null)
        
        // Redirigir a la página de viajes
        router.push('/rides')
      } else {
        toast.error(`Error: ${data.error || 'No se pudo solicitar el viaje'}`, { id: loadingToast })
      }
    } catch (error) {
      console.error('Error al solicitar viaje:', error)
      toast.error('Error al conectar con el servidor')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Uber Clone</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Solicitar un viaje</h2>
          
          <LeafletMap 
            pickupCoords={pickupCoords}
            dropoffCoords={dropoffCoords}
            onPickupSelect={(coords) => {
              setPickupCoords(coords)
            }}
            onDropoffSelect={(coords) => {
              setDropoffCoords(coords)
            }}
          />
          
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="pickup" className="block text-sm font-medium text-gray-700">
                Punto de recogida
              </label>
              <input
                type="text"
                id="pickup"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ingresa tu ubicación o selecciona en el mapa"
              />
            </div>

            <div>
              <label htmlFor="dropoff" className="block text-sm font-medium text-gray-700">
                Destino
              </label>
              <input
                type="text"
                id="dropoff"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="¿A dónde vas? O selecciona en el mapa"
              />
            </div>

            {price !== null && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="text-lg font-medium text-green-800">Precio estimado: ${price}</h3>
                <p className="text-sm text-green-600">Este precio puede variar según la demanda y el tráfico</p>
              </div>
            )}

            <div className="mt-4">
              <button
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleRequestRide}
                disabled={!pickupCoords || !dropoffCoords}
              >
                Solicitar viaje
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Información</h2>
          <p className="text-gray-600 mb-4">
            Esta es una aplicación clon de Uber desarrollada con Next.js 14 y Tailwind CSS. 
            Puedes solicitar viajes, ver tu historial de viajes, y si eres conductor, aceptar viajes disponibles.
          </p>
          <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Funcionalidades disponibles:</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>Solicitar viajes desde cualquier origen a destino</li>
              <li>Ver el historial completo de viajes en tu perfil</li>
              <li>Convertirte en conductor para aceptar viajes</li>
              <li>Calcular precios basados en la distancia del viaje</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 