import { NextRequest, NextResponse } from 'next/server'
import { getUserFromCookie } from '../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getUserFromCookie(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }
    
    if (user.role !== 'DRIVER') {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 403 }
      )
    }
    
    // En una implementación real, consultar los viajes del conductor de la base de datos
    // Por ahora, devolver datos de ejemplo
    const mockRides = [
      {
        id: 'ride-123',
        pickup: 'Parque Centenario',
        dropoff: 'Palermo Hollywood',
        pickupLat: -34.6054,
        pickupLng: -58.4350,
        dropoffLat: -34.5810,
        dropoffLng: -58.4370,
        price: 12.75,
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Ayer
        passenger: {
          id: 'passenger-1',
          name: 'Ana Martínez',
          image: null
        }
      },
      {
        id: 'ride-456',
        pickup: 'Teatro Colón',
        dropoff: 'Puerto Madero',
        pickupLat: -34.6038,
        pickupLng: -58.3836,
        dropoffLat: -34.6192,
        dropoffLng: -58.3694,
        price: 9.25,
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // Anteayer
        passenger: {
          id: 'passenger-2',
          name: 'Juan Pérez',
          image: null
        }
      }
    ]
    
    // Devolver los viajes
    return NextResponse.json(mockRides)
  } catch (error) {
    console.error('Error al obtener viajes del conductor:', error)
    return NextResponse.json(
      { error: 'Error al obtener los viajes' },
      { status: 500 }
    )
  }
} 