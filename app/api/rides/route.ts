import { NextRequest, NextResponse } from 'next/server'
import { createRide, RideData, getRidesForUser } from '../../services/rideService'
import { getServerSession } from 'next-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No estás autenticado' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    const rideData: RideData = {
      pickup: data.pickup,
      dropoff: data.dropoff,
      pickupLat: data.pickupCoords[1],
      pickupLng: data.pickupCoords[0],
      dropoffLat: data.dropoffCoords[1],
      dropoffLng: data.dropoffCoords[0],
      price: data.price,
      passengerId: session.user.id
    }

    const ride = await createRide(rideData)
    
    return NextResponse.json(ride)
  } catch (error) {
    console.error('Error creating ride:', error)
    return NextResponse.json(
      { error: 'Hubo un error al solicitar el viaje' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Debe iniciar sesión para acceder a esta funcionalidad" },
        { status: 401 }
      )
    }

    const rides = await getRidesForUser(session.user.id)

    // Formatear los datos para la respuesta
    const formattedRides = rides.map((ride) => ({
      id: ride.id,
      status: ride.status,
      origin: ride.pickup,
      destination: ride.dropoff,
      price: ride.price,
      date: ride.createdAt.toISOString(),
    }))

    return NextResponse.json(formattedRides)
  } catch (error) {
    console.error("Error al obtener los viajes:", error)
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
} 