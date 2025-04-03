import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, RideStatus } from '@prisma/client'

const prisma = new PrismaClient()

// Crear un nuevo viaje
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validación de datos
    if (!data.pickup || !data.dropoff || data.pickupLat === undefined || 
        data.pickupLng === undefined || data.dropoffLat === undefined || 
        data.dropoffLng === undefined || !data.passengerId) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios para crear el viaje', data },
        { status: 400 }
      )
    }

    // Crear el viaje en la base de datos
    const newRide = await prisma.ride.create({
      data: {
        pickup: data.pickup,
        dropoff: data.dropoff,
        pickupLat: data.pickupLat,
        pickupLng: data.pickupLng,
        dropoffLat: data.dropoffLat,
        dropoffLng: data.dropoffLng,
        price: data.price || 0,
        status: RideStatus.PENDING,
        passengerId: data.passengerId
      }
    })
    
    console.log('[API] Viaje creado con éxito:', newRide.id)
    
    return NextResponse.json(newRide, { status: 201 })
  } catch (error) {
    console.error('[API] Error al crear viaje:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al crear el viaje' },
      { status: 500 }
    )
  }
}

// Obtener todos los viajes
export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de consulta (status, userId)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const passengerId = searchParams.get('passengerId')
    const driverId = searchParams.get('driverId')
    
    // Construir condiciones de filtrado
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (passengerId) {
      where.passengerId = passengerId
    }
    
    if (driverId) {
      where.driverId = driverId
    }
    
    // Obtener viajes de la base de datos
    const rides = await prisma.ride.findMany({
      where,
      include: {
        passenger: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(rides)
  } catch (error) {
    console.error('[API] Error al obtener viajes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener los viajes' },
      { status: 500 }
    )
  }
}

// Función para calcular la distancia entre dos puntos (en km)
function calculateDistance(point1: [number, number], point2: [number, number]): number {
  const [lon1, lat1] = point1;
  const [lon2, lat2] = point2;
  
  // Radio de la Tierra en km
  const R = 6371;
  
  // Convertir a radianes
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  // Fórmula de Haversine
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distancia en km
  
  return Math.round(distance * 10) / 10; // Redondear a 1 decimal
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
} 