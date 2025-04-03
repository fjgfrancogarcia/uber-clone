import { NextRequest, NextResponse } from 'next/server'
import { getUserFromCookie } from '../../lib/auth'
import { UserData } from '../../../types/auth'
import { PrismaClient, RideStatus } from '@prisma/client'

const prisma = new PrismaClient()

// Implementación con datos simulados para la demostración
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validar datos mínimos
    if (!data.originAddress || !data.destinationAddress || !data.passengerId) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios para crear el viaje' },
        { status: 400 }
      )
    }
    
    // Extraer las coordenadas correctamente, considerando ambos formatos posibles
    const pickupLat = data.originLat || (data.pickupCoords ? data.pickupCoords[0] : null)
    const pickupLng = data.originLng || (data.pickupCoords ? data.pickupCoords[1] : null)
    const dropoffLat = data.destinationLat || (data.dropoffCoords ? data.dropoffCoords[0] : null)
    const dropoffLng = data.destinationLng || (data.dropoffCoords ? data.dropoffCoords[1] : null)
    
    // Validar que tenemos las coordenadas necesarias
    if (pickupLat === null || pickupLng === null || dropoffLat === null || dropoffLng === null) {
      return NextResponse.json(
        { error: 'Faltan coordenadas para crear el viaje' },
        { status: 400 }
      )
    }
    
    // Determinar el precio (usar el proporcionado o convertir a número)
    const price = typeof data.price === 'number' 
      ? data.price 
      : parseFloat(data.price || '0')
    
    // Crear el viaje en la base de datos
    const newRide = await prisma.ride.create({
      data: {
        pickup: data.originAddress || data.pickup,
        dropoff: data.destinationAddress || data.dropoff,
        pickupLat,
        pickupLng,
        dropoffLat,
        dropoffLng,
        price,
        status: RideStatus.PENDING,
        passengerId: data.passengerId
      }
    })
    
    console.log('[API/trips legacy] Viaje creado con éxito:', newRide.id)
    
    return NextResponse.json(newRide, { status: 201 })
  } catch (error) {
    console.error('[API/trips legacy] Error al crear viaje:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al crear el viaje' },
      { status: 500 }
    )
  }
}

// Endpoint para obtener todos los viajes del usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const passengerId = searchParams.get('passengerId')
    
    // Filtrar por pasajero si se proporciona un ID
    const where = passengerId ? { passengerId } : {}
    
    // Obtener los viajes de la base de datos
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
    
    // Formatear los datos para mantener compatibilidad con el formato anterior
    const formattedRides = rides.map(ride => ({
      id: ride.id,
      passengerId: ride.passengerId,
      passengerName: ride.passenger?.name || 'Usuario',
      originAddress: ride.pickup,
      destinationAddress: ride.dropoff,
      pickup: ride.pickup,
      dropoff: ride.dropoff,
      originLat: ride.pickupLat,
      originLng: ride.pickupLng,
      destinationLat: ride.dropoffLat,
      destinationLng: ride.dropoffLng,
      pickupCoords: [ride.pickupLat, ride.pickupLng],
      dropoffCoords: [ride.dropoffLat, ride.dropoffLng],
      price: ride.price.toString(),
      status: ride.status,
      driverId: ride.driverId,
      driverName: ride.driver?.name || null,
      createdAt: ride.createdAt.toISOString(),
      updatedAt: ride.updatedAt.toISOString()
    }))
    
    return NextResponse.json(formattedRides)
  } catch (error) {
    console.error('[API/trips legacy] Error al obtener viajes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener los viajes' },
      { status: 500 }
    )
  }
}

// Función para generar viajes de ejemplo para un usuario
function generateMockTripsForUser(user: UserData) {
  const now = new Date()
  
  // Generar viajes con diferentes estados y fechas
  return [
    {
      id: `trip-1-${user.id}`,
      passengerId: user.id,
      passengerName: user.name,
      originAddress: "Aeropuerto Madrid Barajas",
      destinationAddress: "Plaza Mayor, Madrid",
      pickup: "Aeropuerto Madrid Barajas",
      dropoff: "Plaza Mayor, Madrid",
      originLat: 40.4983,
      originLng: -3.5676,
      destinationLat: 40.4168,
      destinationLng: -3.7038,
      pickupLat: 40.4983,
      pickupLng: -3.5676,
      dropoffLat: 40.4168,
      dropoffLng: -3.7038,
      distance: "15.8",
      price: "22.46",
      estimatedTime: 28,
      numberOfPassengers: 1,
      paymentMethod: "efectivo",
      status: "COMPLETED",
      driverId: "driver-1",
      driverName: "Carlos Rodríguez",
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString()
    },
    {
      id: `trip-2-${user.id}`,
      passengerId: user.id,
      passengerName: user.name,
      originAddress: "Estación Atocha",
      destinationAddress: "Estadio Santiago Bernabéu",
      pickup: "Estación Atocha",
      dropoff: "Estadio Santiago Bernabéu",
      originLat: 40.4065,
      originLng: -3.6895,
      destinationLat: 40.4530,
      destinationLng: -3.6883,
      pickupLat: 40.4065,
      pickupLng: -3.6895,
      dropoffLat: 40.4530,
      dropoffLng: -3.6883,
      distance: "8.3",
      price: "13.46",
      estimatedTime: 18,
      numberOfPassengers: 2,
      paymentMethod: "tarjeta",
      status: "COMPLETED",
      driverId: "driver-2",
      driverName: "María González",
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString()
    },
    {
      id: `trip-3-${user.id}`,
      passengerId: user.id,
      passengerName: user.name,
      originAddress: "Plaza de España",
      destinationAddress: "Puerta del Sol",
      pickup: "Plaza de España",
      dropoff: "Puerta del Sol",
      originLat: 40.4234,
      originLng: -3.7123,
      destinationLat: 40.4168,
      destinationLng: -3.7038,
      pickupLat: 40.4234,
      pickupLng: -3.7123,
      dropoffLat: 40.4168,
      dropoffLng: -3.7038,
      distance: "1.2",
      price: "4.94",
      estimatedTime: 8,
      numberOfPassengers: 1,
      paymentMethod: "efectivo",
      status: "ACCEPTED",
      driverId: "driver-3",
      driverName: "Javier López",
      createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString()
    },
    {
      id: `trip-4-${user.id}`,
      passengerId: user.id,
      passengerName: user.name,
      originAddress: "Gran Vía 28",
      destinationAddress: "Parque del Retiro",
      pickup: "Gran Vía 28",
      dropoff: "Parque del Retiro",
      originLat: 40.4203,
      originLng: -3.7059,
      destinationLat: 40.4153,
      destinationLng: -3.6844,
      pickupLat: 40.4203,
      pickupLng: -3.7059,
      dropoffLat: 40.4153,
      dropoffLng: -3.6844,
      distance: "2.8",
      price: "6.86",
      estimatedTime: 12,
      numberOfPassengers: 3,
      paymentMethod: "efectivo",
      status: "PENDING",
      driverId: null,
      driverName: null,
      createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString()
    }
  ]
} 