import { NextRequest, NextResponse } from 'next/server'
import { createRide, RideData, getRidesForUser } from '../../services/rideService'
import { auth } from '../../../auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return new NextResponse(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const data = await request.json()
    
    // Validación de datos
    if (!data.pickup || !data.dropoff || !data.price || !data.pickupCoords || !data.dropoffCoords) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios' },
        { status: 400 }
      )
    }

    const rideData: RideData = {
      pickup: data.pickup,
      dropoff: data.dropoff,
      price: parseFloat(data.price),
      passengerId: session.user.id, 
      pickupLat: data.pickupCoords[1],
      pickupLng: data.pickupCoords[0],
      dropoffLat: data.dropoffCoords[1],
      dropoffLng: data.dropoffCoords[0],
    }

    const ride = await createRide(rideData)
    
    return new NextResponse(JSON.stringify(ride), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error al crear viaje:', error)
    return new NextResponse(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function GET(request: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return new NextResponse(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const userId = session.user.id
    const url = new URL(request.url)
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined

    // Obtener los viajes donde el usuario es pasajero
    const rides = await prisma.ride.findMany({
      where: {
        passengerId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...(limit && { take: limit }),
      select: {
        id: true,
        pickup: true,
        dropoff: true,
        price: true,
        status: true,
        createdAt: true,
        pickupLat: true,
        pickupLng: true,
        dropoffLat: true,
        dropoffLng: true,
        driver: {
          select: {
            name: true,
          },
        },
      },
    })

    // Formatear datos para la respuesta incluyendo distancia y duración
    const formattedRides = rides.map(ride => {
      // Calcular la distancia basada en coordenadas (si están disponibles)
      let distance = 0;
      let duration = 0;

      if (ride.pickupLat && ride.pickupLng && ride.dropoffLat && ride.dropoffLng) {
        distance = calculateDistance(
          [ride.pickupLng, ride.pickupLat],
          [ride.dropoffLng, ride.dropoffLat]
        );
        // Estimación simple: 1 km se recorre en aproximadamente 2 minutos
        duration = Math.round(distance * 2);
      } else {
        // Valores aleatorios para demostración si no hay coordenadas
        distance = Math.round((Math.random() * 10 + 2) * 10) / 10; // Entre 2 y 12 km
        duration = Math.round(distance * 2 + Math.random() * 5); // Duración con algo de variabilidad
      }

      return {
        id: ride.id,
        pickupLocation: ride.pickup,
        dropoffLocation: ride.dropoff,
        price: ride.price,
        status: ride.status,
        createdAt: ride.createdAt,
        distance: distance,
        duration: duration,
        driver: ride.driver,
      };
    });

    return new NextResponse(JSON.stringify(formattedRides), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error al obtener viajes:', error)
    return new NextResponse(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
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