'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SimpleMap from '../../components/SimpleMap'
import { toast } from 'react-hot-toast'
import { getCurrentUser } from '../../utils/client-auth'
import { UserData } from '../../../types/auth'
import { saveTrip } from '../../lib/localStorage'

// Calcular la distancia entre dos puntos usando la fórmula de Haversine
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c // Distancia en km
  return distance
}

// Calcular el precio basado en la distancia
const calculatePrice = (distance: number): number => {
  const baseFare = 3.5
  const pricePerKm = 1.2
  return baseFare + (distance * pricePerKm)
}

// Calcular el tiempo estimado basado en la distancia
const calculateTime = (distance: number): number => {
  const avgSpeedKmh = 35 // Velocidad promedio en km/h
  return (distance / avgSpeedKmh) * 60 // Tiempo en minutos
}

export default function RequestRidePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [originAddress, setOriginAddress] = useState('')
  const [destinationAddress, setDestinationAddress] = useState('')
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null)
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [price, setPrice] = useState<number | null>(null)
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)
  const [numberOfPassengers, setNumberOfPassengers] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Verificar si el usuario está autenticado y es un pasajero
  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await getCurrentUser()
        if (userData.user) {
          if (userData.user.role !== 'USER') {
            toast.error('Solo los pasajeros pueden solicitar viajes')
            router.push('/')
            return
          }
          setUser(userData.user)
        } else {
          toast.error('Debes iniciar sesión para solicitar un viaje')
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Error al verificar usuario:', error)
        toast.error('Error al verificar usuario')
        router.push('/auth/signin')
      } finally {
        setLoading(false)
      }
    }
    
    checkUser()
  }, [router])
  
  // Actualizar cálculos cuando cambian las coordenadas
  useEffect(() => {
    if (originCoords && destinationCoords) {
      const [originLat, originLng] = originCoords
      const [destLat, destLng] = destinationCoords
      const distanceInKm = calculateDistance(originLat, originLng, destLat, destLng)
      const calculatedPrice = calculatePrice(distanceInKm)
      const calculatedTime = calculateTime(distanceInKm)
      
      setDistance(distanceInKm)
      setPrice(calculatedPrice)
      setEstimatedTime(calculatedTime)
    } else {
      setDistance(null)
      setPrice(null)
      setEstimatedTime(null)
    }
  }, [originCoords, destinationCoords])
  
  const handleSelectOrigin = (address: string, coords: [number, number]) => {
    setOriginAddress(address)
    setOriginCoords(coords)
  }
  
  const handleSelectDestination = (address: string, coords: [number, number]) => {
    setDestinationAddress(address)
    setDestinationCoords(coords)
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!originCoords || !destinationCoords) {
      toast.error('Debes seleccionar origen y destino en el mapa')
      return
    }
    
    if (!user) {
      toast.error('Debes iniciar sesión para solicitar un viaje')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      console.log("Enviando solicitud de viaje con estos datos:", {
        userId: user.id,
        pickup: originAddress,
        dropoff: destinationAddress,
        coords: {
          originLat: originCoords[0],
          originLng: originCoords[1],
          destinationLat: destinationCoords[0],
          destinationLng: destinationCoords[1]
        }
      });
      
      // Crear el viaje en la base de datos a través de la API
      const response = await fetch('/api/rides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pickup: originAddress,
          dropoff: destinationAddress,
          pickupLat: originCoords[0],
          pickupLng: originCoords[1],
          dropoffLat: destinationCoords[0],
          dropoffLng: destinationCoords[1],
          price: parseFloat((price || 0).toFixed(2)),
          passengerId: user.id
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error al crear viaje:", errorData);
        throw new Error(errorData.error || 'Error al solicitar el viaje')
      }
      
      const newRide = await response.json()
      console.log("Viaje creado exitosamente:", newRide);
      
      // También guardar en localStorage para mantener compatibilidad
      const tripForLocalStorage = {
        id: newRide.id,
        passengerId: user.id,
        passengerName: user.name || 'Usuario',
        originAddress,
        destinationAddress,
        originLat: originCoords[0],
        originLng: originCoords[1],
        destinationLat: destinationCoords[0],
        destinationLng: destinationCoords[1],
        pickup: originAddress,
        dropoff: destinationAddress,
        pickupCoords: originCoords,
        dropoffCoords: destinationCoords,
        distance: distance?.toFixed(2) || '0',
        price: price?.toFixed(2) || '0',
        estimatedTime: Math.round(estimatedTime || 0),
        numberOfPassengers,
        paymentMethod,
        status: 'PENDING',
        driverId: null,
        driverName: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      saveTrip(tripForLocalStorage)
      
      toast.success('Viaje solicitado con éxito')
      router.push('/profile') // Redirigir al perfil donde se mostrará el historial de viajes
      
    } catch (error) {
      console.error('Error al solicitar viaje:', error)
      toast.error(error instanceof Error ? error.message : 'Error al solicitar el viaje')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Solicitar un viaje</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mapa */}
        <div className="md:col-span-2 h-[500px] bg-gray-100 rounded-lg overflow-hidden">
          <SimpleMap
            onSelectOrigin={handleSelectOrigin}
            onSelectDestination={handleSelectDestination}
            originCoords={originCoords}
            destinationCoords={destinationCoords}
          />
        </div>
        
        {/* Formulario */}
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Origen</label>
              <div className="relative">
                <input
                  type="text"
                  value={originAddress}
                  onChange={(e) => setOriginAddress(e.target.value)}
                  className="w-full p-2 pl-8 border rounded"
                  placeholder="Selecciona en el mapa"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              {originCoords && (
                <p className="text-xs text-gray-500 mt-1">
                  Lat: {originCoords[0].toFixed(4)}, Lng: {originCoords[1].toFixed(4)}
                </p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Destino</label>
              <div className="relative">
                <input
                  type="text"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  className="w-full p-2 pl-8 border rounded"
                  placeholder="Selecciona en el mapa"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
              </div>
              {destinationCoords && (
                <p className="text-xs text-gray-500 mt-1">
                  Lat: {destinationCoords[0].toFixed(4)}, Lng: {destinationCoords[1].toFixed(4)}
                </p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Pasajeros</label>
              <select
                value={numberOfPassengers}
                onChange={(e) => setNumberOfPassengers(parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              >
                <option value={1}>1 pasajero</option>
                <option value={2}>2 pasajeros</option>
                <option value={3}>3 pasajeros</option>
                <option value={4}>4 pasajeros</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Método de pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>
            
            {/* Resumen del viaje */}
            {distance && price && estimatedTime && (
              <div className="mb-6 p-3 bg-gray-50 rounded">
                <h3 className="font-medium mb-2">Resumen del viaje</h3>
                <div className="text-sm space-y-1">
                  <p>Distancia: {distance.toFixed(2)} km</p>
                  <p>Precio estimado: €{price.toFixed(2)}</p>
                  <p>Tiempo estimado: {Math.round(estimatedTime)} min</p>
                </div>
              </div>
            )}
            
            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={isSubmitting || !originCoords || !destinationCoords}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Solicitando...' : 'Solicitar viaje'}
              </button>
              
              <Link href="/" className="w-full text-center py-2 border border-gray-300 rounded hover:bg-gray-50">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 