'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, MapPin, Navigation } from 'lucide-react'
import { toast } from 'react-hot-toast'
import dynamic from 'next/dynamic'
import { getUserTrips, updateTripStatus, Trip } from '../../lib/localStorage'

// Importaciones temporales para UI components - Nota: Estos deberían existir o ser creados
const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-white rounded-lg shadow ${className || ''}`} {...props}>{children}</div>
)
const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 border-b ${className || ''}`} {...props}>{children}</div>
)
const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-lg font-semibold ${className || ''}`} {...props}>{children}</h3>
)
const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-gray-500 ${className || ''}`} {...props}>{children}</p>
)
const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 ${className || ''}`} {...props}>{children}</div>
)
const Button = ({ 
  className, 
  children, 
  variant = 'default', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' }) => (
  <button 
    className={`px-4 py-2 rounded font-medium ${
      variant === 'outline' 
        ? 'border border-gray-300 hover:bg-gray-50' 
        : 'bg-blue-600 text-white hover:bg-blue-700'
    } ${className || ''}`} 
    {...props}
  >
    {children}
  </button>
)
const Badge = ({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className || ''}`} {...props}>
    {children}
  </span>
)

// Cargar el mapa de forma dinámica para evitar problemas con SSR
const MapWithNoSSR = dynamic(() => import('../../components/SimpleMap'), {
  ssr: false,
  loading: () => <p className="text-center py-4">Cargando mapa...</p>
})

// Interfaz para el viaje activo que se almacena en localStorage
interface ActiveRideInfo {
  id: string;
  pickup: string;
  dropoff: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  price: number;
  distance: string;
  passengerName: string;
  passengerId: string;
  driverId: string;
  driverName: string;
  status: string;
  createdAt: string;
  acceptedAt: string;
}

export default function ActiveRidePage() {
  const { data: session, status } = useSession()
  const [activeRide, setActiveRide] = useState<ActiveRideInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session?.user?.email) {
      // Intentar obtener la información del viaje activo desde localStorage
      const activeRideJson = localStorage.getItem('activeRideInfo')
      
      if (activeRideJson) {
        try {
          const parsedRide: ActiveRideInfo = JSON.parse(activeRideJson)
          
          // Verificar que el viaje pertenece al conductor actual
          if (parsedRide.driverId === session.user.email) {
            setActiveRide(parsedRide)
          }
        } catch (error) {
          console.error('Error al parsear la información del viaje activo:', error)
        }
      }
      
      setLoading(false)
    }
  }, [status, session, router])

  // Función para completar un viaje
  const handleCompleteRide = async () => {
    if (!activeRide || !session?.user?.email) return
    
    try {
      setCompleting(true)
      
      // En una implementación completa, aquí enviaríamos una petición al servidor
      // para marcar el viaje como completado
      
      // Actualizar estado en localStorage
      const updatedRide = {
        ...activeRide,
        status: 'COMPLETED',
        completedAt: new Date().toISOString()
      }
      
      // Guardar la información actualizada
      localStorage.setItem('activeRideInfo', JSON.stringify(updatedRide))
      
      toast.success('¡Viaje completado con éxito!')
      
      // Eliminar del localStorage después de un breve retraso
      setTimeout(() => {
        localStorage.removeItem('activeRideInfo')
        
        // Redirigir al panel de conductor
        router.push('/driver')
      }, 1500)
    } catch (error) {
      console.error('Error al completar el viaje:', error)
      toast.error(error instanceof Error ? error.message : 'Error al completar el viaje')
    } finally {
      setCompleting(false)
    }
  }

  // Función para calcular la duración estimada
  const calculateDuration = (distanceKm: number) => {
    // Velocidad promedio de 30 km/h
    const hours = distanceKm / 30
    const minutes = Math.round(hours * 60)
    return minutes
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Viaje Activo</h1>
        <p className="text-center py-8">Cargando información del viaje...</p>
      </div>
    )
  }

  if (!activeRide) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Viaje Activo</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="mb-4">No tienes ningún viaje activo en este momento.</p>
              <div className="flex flex-col space-y-2">
                <Link href="/rides/available">
                  <Button className="w-full">Ver Viajes Disponibles</Button>
                </Link>
                <Link href="/driver">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Panel
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calcular la duración estimada en minutos
  const distance = activeRide ? parseFloat(activeRide.distance || '0') : 0;
  const durationMinutes = calculateDuration(distance)
  
  // Formatear la hora de creación
  const createdAt = activeRide ? new Date(activeRide.createdAt) : new Date()
  const formattedDate = createdAt.toLocaleDateString()
  const formattedTime = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Viaje Activo</h1>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Detalles del Viaje</span>
            <Badge>{activeRide.status}</Badge>
          </CardTitle>
          <CardDescription>
            ID: {activeRide.id}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Información del pasajero */}
            <div className="border-b pb-4">
              <h3 className="font-medium mb-2">Pasajero</h3>
              <p>{activeRide.passengerName}</p>
            </div>
            
            {/* Origen y destino */}
            <div className="border-b pb-4">
              <div className="mb-3">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Origen</p>
                    <p className="text-sm text-gray-600">{activeRide.pickup}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Destino</p>
                    <p className="text-sm text-gray-600">{activeRide.dropoff}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Información adicional */}
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <p className="text-sm text-gray-500 flex items-center">
                  <Navigation className="h-4 w-4 mr-1" />
                  Distancia
                </p>
                <p className="font-medium">{distance} km</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Duración Est.
                </p>
                <p className="font-medium">{durationMinutes} min</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Fecha
                </p>
                <p className="font-medium">{formattedDate}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Precio</p>
                <p className="font-medium">${activeRide.price.toFixed(2)}</p>
              </div>
            </div>
            
            {/* Mapa */}
            <div className="h-64 mt-4">
              {activeRide && (
                <MapWithNoSSR
                  originCoords={[activeRide.pickupLat, activeRide.pickupLng] as [number, number]}
                  destinationCoords={[activeRide.dropoffLat, activeRide.dropoffLng] as [number, number]}
                  readOnly={true}
                />
              )}
            </div>
            
            {/* Acciones */}
            <div className="flex flex-col space-y-2 pt-4">
              <Button 
                onClick={handleCompleteRide}
                disabled={completing}
                className="w-full"
              >
                {completing ? 'Completando...' : 'Completar Viaje'}
              </Button>
              
              <Link href="/driver">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Panel
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 