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

export async function GET() {
  const session = await auth()
  
  if (!session?.user) {
    return new NextResponse(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const userId = session.user.id

    // Obtener los viajes donde el usuario es pasajero
    const rides = await prisma.ride.findMany({
      where: {
        passengerId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        pickup: true,
        dropoff: true,
        price: true,
        status: true,
        createdAt: true,
        driver: {
          select: {
            name: true,
          },
        },
      },
    })

    return new NextResponse(JSON.stringify(rides), {
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