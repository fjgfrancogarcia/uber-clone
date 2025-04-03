import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Datos simulados de viajes para conductores
    const mockDriverRides = [
      {
        id: "driver-ride-1",
        pickup: "Aeropuerto Internacional",
        dropoff: "Centro de la Ciudad",
        price: 25.50,
        status: "ACCEPTED",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        pickupLat: 40.7128,
        pickupLng: -74.0060,
        dropoffLat: 40.7580,
        dropoffLng: -73.9855,
        passenger: {
          id: "passenger-1",
          name: "Cliente Demo",
          image: null
        }
      },
      {
        id: "driver-ride-2",
        pickup: "Plaza Principal",
        dropoff: "Zona Residencial",
        price: 18.25,
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        pickupLat: 40.7580,
        pickupLng: -73.9855,
        dropoffLat: 40.7489,
        dropoffLng: -73.9680,
        passenger: {
          id: "passenger-2",
          name: "Usuario Ejemplo",
          image: null
        }
      },
      {
        id: "driver-ride-3",
        pickup: "Centro Comercial",
        dropoff: "Universidad Central",
        price: 15.75,
        status: "IN_PROGRESS",
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        pickupLat: 40.7489,
        pickupLng: -73.9680,
        dropoffLat: 40.7280,
        dropoffLng: -73.9920,
        passenger: {
          id: "passenger-3",
          name: "Otro Usuario",
          image: null
        }
      }
    ]
    
    return NextResponse.json(mockDriverRides)
  } catch (error) {
    console.error('Error fetching driver rides:', error)
    return NextResponse.json(
      { error: 'Hubo un error al obtener tus viajes' },
      { status: 500 }
    )
  }
} 