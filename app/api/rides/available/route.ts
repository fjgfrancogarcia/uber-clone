import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, RideStatus } from '@prisma/client'

const prisma = new PrismaClient()

// En una implementación real, estos datos vendrían de la base de datos,
// pero como estamos simulando, los guardamos en una variable global en memoria
// Estructura similar a Trip pero sin campos opcionales
interface PendingRide {
  id: string;
  pickup: string;
  dropoff: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  price: number;
  status: string;
  createdAt: string;
  passenger: {
    id: string;
    name: string;
    image: string | null;
  };
}

// Datos de ejemplo para viajes pendientes
const examplePendingRides: PendingRide[] = [
  {
    id: "ride-1",
    pickup: "Aeropuerto Internacional",
    dropoff: "Centro de la Ciudad",
    price: 25.50,
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    pickupLat: -34.8222,
    pickupLng: -58.5358,
    dropoffLat: -34.6037,
    dropoffLng: -58.3816,
    passenger: {
      id: "passenger-1",
      name: "Carlos Rodríguez",
      image: null
    }
  },
  {
    id: "ride-2",
    pickup: "Plaza de Mayo",
    dropoff: "Palermo Soho",
    price: 15.75,
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    pickupLat: -34.6083,
    pickupLng: -58.3712,
    dropoffLat: -34.5885,
    dropoffLng: -58.4339,
    passenger: {
      id: "passenger-2",
      name: "Laura Martínez",
      image: null
    }
  },
  {
    id: "ride-3",
    pickup: "Recoleta",
    dropoff: "La Boca",
    price: 18.20,
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    pickupLat: -34.5875,
    pickupLng: -58.3938,
    dropoffLat: -34.6345,
    dropoffLng: -58.3631,
    passenger: {
      id: "passenger-3",
      name: "Martín González",
      image: null
    }
  },
  {
    id: "ride-4",
    pickup: "Belgrano",
    dropoff: "San Telmo",
    price: 22.30,
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    pickupLat: -34.5573,
    pickupLng: -58.4613,
    dropoffLat: -34.6194,
    dropoffLng: -58.3714,
    passenger: {
      id: "passenger-4",
      name: "Ana Fernández",
      image: null
    }
  },
  {
    id: "ride-5",
    pickup: "Puerto Madero",
    dropoff: "Retiro",
    price: 12.80,
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    pickupLat: -34.6174,
    pickupLng: -58.3633,
    dropoffLat: -34.5915,
    dropoffLng: -58.3734,
    passenger: {
      id: "passenger-5",
      name: "Javier López",
      image: null
    }
  }
];

// Registro para almacenar viajes aceptados - esto sería una base de datos en una app real
const acceptedRides: Set<string> = new Set();

export async function GET(request: NextRequest) {
  try {
    console.log("[API] Recibiendo solicitud GET en /api/rides/available");
    
    // Consultar la base de datos para obtener todos los viajes pendientes
    const pendingRides = await prisma.ride.findMany({
      where: { 
        status: RideStatus.PENDING 
      },
      include: {
        passenger: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Más recientes primero
      }
    });
    
    // Mapear los resultados al formato que espera la interfaz
    const formattedRides = pendingRides.map(ride => ({
      id: ride.id,
      pickup: ride.pickup,
      dropoff: ride.dropoff,
      pickupLat: ride.pickupLat,
      pickupLng: ride.pickupLng,
      dropoffLat: ride.dropoffLat,
      dropoffLng: ride.dropoffLng,
      price: ride.price,
      status: ride.status,
      createdAt: ride.createdAt.toISOString(),
      passenger: {
        id: ride.passenger.id,
        name: ride.passenger.name || 'Pasajero',
        image: ride.passenger.image
      }
    }));
    
    console.log(`[API] Enviando ${formattedRides.length} viajes disponibles desde la base de datos`);
    
    return NextResponse.json(formattedRides);
  } catch (error) {
    console.error('[API] Error al consultar viajes disponibles:', error)
    return NextResponse.json(
      { error: 'Hubo un error al obtener los viajes disponibles' },
      { status: 500 }
    )
  }
}

// Actualizamos el endpoint para aceptar un viaje
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { rideId, driverId, driverName } = data;
    
    if (!rideId || !driverId) {
      return NextResponse.json(
        { error: 'Se requieren los IDs del viaje y del conductor' },
        { status: 400 }
      );
    }
    
    // Verificar que el viaje existe y está disponible
    const ride = await prisma.ride.findUnique({
      where: { id: rideId }
    });
    
    if (!ride) {
      return NextResponse.json(
        { error: 'Viaje no encontrado' },
        { status: 404 }
      );
    }
    
    if (ride.status !== RideStatus.PENDING) {
      return NextResponse.json(
        { error: 'Este viaje ya no está disponible' },
        { status: 400 }
      );
    }
    
    // Actualizar el estado del viaje en la base de datos
    const updatedRide = await prisma.ride.update({
      where: { id: rideId },
      data: { 
        status: RideStatus.ACCEPTED, 
        driverId,
        updatedAt: new Date() 
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Viaje aceptado correctamente',
      ride: updatedRide
    });
  } catch (error) {
    console.error('[API] Error al aceptar viaje:', error);
    return NextResponse.json(
      { error: 'Hubo un error al aceptar el viaje' },
      { status: 500 }
    );
  }
} 