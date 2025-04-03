import { NextRequest, NextResponse } from 'next/server'

// Implementación con datos simulados
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validación de datos
    if (!data.pickup || !data.dropoff || !data.price || !data.pickupCoords || !data.dropoffCoords) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios' },
        { status: 400 }
      )
    }

    // Crear respuesta simulada
    const mockRide = {
      id: `ride-${Date.now()}`,
      pickup: data.pickup,
      dropoff: data.dropoff,
      price: parseFloat(data.price),
      passengerId: "passenger-mock-id",
      status: "PENDING",
      pickupLat: data.pickupCoords[1],
      pickupLng: data.pickupCoords[0],
      dropoffLat: data.dropoffCoords[1],
      dropoffLng: data.dropoffCoords[0],
      createdAt: new Date().toISOString()
    }
    
    return new NextResponse(JSON.stringify(mockRide), {
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
  try {
    // Datos de viajes de ejemplo
    const mockRides = [
      {
        id: "ride-1",
        pickupLocation: "Aeropuerto Internacional",
        dropoffLocation: "Centro de la Ciudad", 
        price: 25.50,
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        distance: 12.5,
        duration: 25,
        driver: { name: "Conductor A" }
      },
      {
        id: "ride-2",
        pickupLocation: "Centro Comercial", 
        dropoffLocation: "Parque Central",
        price: 12.75,
        status: "PENDING",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        distance: 5.2,
        duration: 12,
        driver: null
      },
      {
        id: "ride-3",
        pickupLocation: "Residencial Las Palmas", 
        dropoffLocation: "Universidad Nacional",
        price: 18.25,
        status: "ACCEPTED",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        distance: 8.7,
        duration: 18,
        driver: { name: "Conductor B" }
      }
    ]

    return new NextResponse(JSON.stringify(mockRides), {
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