import { NextRequest, NextResponse } from 'next/server'
import { getUserFromCookie } from '../../lib/auth'
import { UserData } from '../../../types/auth'

// Implementación con datos simulados para la demostración
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const userData = await getUserFromCookie(request)
    if (!userData) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Asegurarse de que el usuario sea un pasajero
    if (userData.role !== 'USER') {
      return NextResponse.json(
        { error: 'Solo los pasajeros pueden solicitar viajes' },
        { status: 403 }
      )
    }

    const data = await request.json()
    
    // Compatibilidad con ambos formatos (nuevo y antiguo)
    const originAddress = data.originAddress || data.pickup;
    const destinationAddress = data.destinationAddress || data.dropoff;
    const originLat = data.originLat || (data.pickupCoords ? data.pickupCoords[0] : null);
    const originLng = data.originLng || (data.pickupCoords ? data.pickupCoords[1] : null);
    const destinationLat = data.destinationLat || (data.dropoffCoords ? data.dropoffCoords[0] : null);
    const destinationLng = data.destinationLng || (data.dropoffCoords ? data.dropoffCoords[1] : null);
    
    // Validación de datos
    if (!originAddress || !destinationAddress || 
        !originLat || !originLng || 
        !destinationLat || !destinationLng) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios para el viaje' },
        { status: 400 }
      )
    }

    // Crear viaje simulado
    const tripId = `trip-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    const mockTrip = {
      id: tripId,
      passengerId: userData.id,
      passengerName: userData.name,
      // Guardar usando ambos formatos para compatibilidad
      originAddress,
      destinationAddress,
      pickup: originAddress,
      dropoff: destinationAddress,
      originLat,
      originLng,
      destinationLat, 
      destinationLng,
      pickupLat: originLat,
      pickupLng: originLng,
      dropoffLat: destinationLat,
      dropoffLng: destinationLng,
      distance: data.distance || '0',
      price: data.price || '0',
      estimatedTime: data.estimatedTime || 0,
      numberOfPassengers: data.numberOfPassengers || 1,
      paymentMethod: data.paymentMethod || 'efectivo',
      status: 'PENDING',
      driverId: null,
      driverName: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // En una aplicación real, aquí guardaríamos en la base de datos
    // Para esta demo, simulamos un éxito
    
    return NextResponse.json({ 
      success: true, 
      message: 'Viaje solicitado con éxito',
      trip: mockTrip 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear viaje:', error)
    return NextResponse.json({ 
      error: 'Error al procesar la solicitud',
      details: error.message
    }, { status: 500 })
  }
}

// Endpoint para obtener todos los viajes del usuario
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const userData = await getUserFromCookie(request)
    if (!userData) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Generar viajes de ejemplo para el usuario
    const userTrips = generateMockTripsForUser(userData)
    
    return NextResponse.json({ 
      success: true, 
      trips: userTrips 
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error al obtener viajes:', error)
    return NextResponse.json({ 
      error: 'Error al procesar la solicitud',
      details: error.message
    }, { status: 500 })
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