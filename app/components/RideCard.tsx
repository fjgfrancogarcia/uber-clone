'use client'

import { useState } from 'react'
import { Button } from './Button'
import { Card, CardContent, CardFooter } from './Card'
import { MapPin, Navigation, Clock, Users, DollarSign, Car } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistance, formatRelative } from 'date-fns'
import { es } from 'date-fns/locale'

interface RideProps {
  id: string
  origin: {
    address: string
    lat: number
    lng: number
  }
  destination: {
    address: string
    lat: number
    lng: number
  }
  distance: {
    text: string
    value: number
  }
  duration: {
    text: string
    value: number
  }
  price: number
  createdAt: Date
  passengerName: string
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED'
  isDriver?: boolean
  onAccept?: (rideId: string) => Promise<void>
}

export function RideCard({
  id,
  origin,
  destination,
  distance,
  duration,
  price,
  createdAt,
  passengerName,
  status,
  isDriver = false,
  onAccept
}: RideProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAccept = async () => {
    if (!onAccept) return
    setIsLoading(true)
    try {
      await onAccept(id)
    } catch (error) {
      console.error('Error al aceptar el viaje:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'ACCEPTED':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'COMPLETED':
        return 'bg-success-50 text-success-700 border-success-200'
      case 'CANCELLED':
        return 'bg-danger-50 text-danger-700 border-danger-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const formatStatus = () => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente'
      case 'ACCEPTED':
        return 'En progreso'
      case 'COMPLETED':
        return 'Completado'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status
    }
  }

  const formatTime = (date: Date) => {
    return formatRelative(date, new Date(), { locale: es })
  }

  return (
    <Card className="h-full">
      <CardContent className="p-0">
        <div className="p-4 sm:p-6">
          {/* Estado y tiempo */}
          <div className="flex justify-between items-start mb-4">
            <div className={cn('px-2.5 py-1 rounded-full text-xs font-medium border', getStatusColor())}>
              {formatStatus()}
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <Clock size={14} className="mr-1 text-gray-400" />
              {formatTime(createdAt)}
            </div>
          </div>

          {/* Ruta del viaje */}
          <div className="space-y-3 mb-4">
            <div className="flex items-start">
              <div className="mt-1 mr-3">
                <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center">
                  <MapPin size={14} className="text-primary-600" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Origen</p>
                <p className="text-sm font-medium text-gray-900">{origin.address}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 mr-3">
                <div className="h-6 w-6 rounded-full bg-secondary-100 flex items-center justify-center">
                  <Navigation size={14} className="text-secondary-600" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Destino</p>
                <p className="text-sm font-medium text-gray-900">{destination.address}</p>
              </div>
            </div>
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-500 flex items-center mb-1">
                <Users size={12} className="mr-1" />
                Pasajero
              </p>
              <p className="text-sm font-medium truncate">{passengerName}</p>
            </div>
            
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-500 flex items-center mb-1">
                <Car size={12} className="mr-1" />
                Distancia
              </p>
              <p className="text-sm font-medium">{distance.text}</p>
            </div>
            
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-500 flex items-center mb-1">
                <DollarSign size={12} className="mr-1" />
                Precio
              </p>
              <p className="text-sm font-medium">${price.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
      
      {isDriver && status === 'PENDING' && onAccept && (
        <CardFooter className="border-t border-gray-100 p-4">
          <Button 
            variant="primary" 
            fullWidth 
            isLoading={isLoading}
            onClick={handleAccept}
          >
            Aceptar Viaje
          </Button>
        </CardFooter>
      )}
    </Card>
  )
} 