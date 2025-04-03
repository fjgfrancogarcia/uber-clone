import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Implementación temporal que devuelve datos de ejemplo mientras se arregla la autenticación
    return NextResponse.json([
      {
        id: "ride-1",
        pickup: "Aeropuerto Internacional",
        dropoff: "Centro de la Ciudad",
        price: 25.50,
        status: "PENDING",
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
        id: "ride-2",
        pickup: "Plaza Principal",
        dropoff: "Zona Comercial",
        price: 15.75,
        status: "PENDING",
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        pickupLat: 40.7580,
        pickupLng: -73.9855,
        dropoffLat: 40.7489,
        dropoffLng: -73.9680,
        passenger: {
          id: "passenger-2",
          name: "Usuario Ejemplo",
          image: null
        }
      }
    ])
  } catch (error) {
    console.error('Error fetching available rides:', error)
    return NextResponse.json(
      { error: 'Hubo un error al obtener los viajes disponibles' },
      { status: 500 }
    )
  }
} 