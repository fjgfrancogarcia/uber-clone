import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { Trip } from '../../../lib/localStorage'

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
    // En una implementación real, aquí consultaríamos la base de datos
    // para obtener los viajes pendientes, por ejemplo:
    // const pendingRides = await prisma.trip.findMany({
    //   where: { status: 'PENDING' },
    //   include: { passenger: true }
    // });
    
    // Filtramos los viajes que no han sido aceptados
    const availableRides = examplePendingRides.filter(ride => !acceptedRides.has(ride.id));
    
    // Devolvemos los viajes disponibles
    return NextResponse.json(availableRides);
  } catch (error) {
    console.error('Error fetching available rides:', error)
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
    const { rideId, driverId } = data;
    
    if (!rideId || !driverId) {
      return NextResponse.json(
        { error: 'Se requieren los IDs del viaje y del conductor' },
        { status: 400 }
      );
    }
    
    // Verificar que el viaje existe y está disponible
    const rideIndex = examplePendingRides.findIndex(ride => ride.id === rideId);
    
    if (rideIndex === -1 || acceptedRides.has(rideId)) {
      return NextResponse.json(
        { error: 'Este viaje no está disponible o ya ha sido aceptado' },
        { status: 400 }
      );
    }
    
    // Marcar el viaje como aceptado
    acceptedRides.add(rideId);
    
    // En una implementación real, aquí actualizaríamos la base de datos
    // await prisma.trip.update({
    //   where: { id: rideId },
    //   data: { status: 'ACCEPTED', driverId }
    // });
    
    return NextResponse.json({ success: true, message: 'Viaje aceptado correctamente' });
  } catch (error) {
    console.error('Error accepting ride:', error);
    return NextResponse.json(
      { error: 'Hubo un error al aceptar el viaje' },
      { status: 500 }
    );
  }
} 