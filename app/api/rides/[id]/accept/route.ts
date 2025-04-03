import { NextResponse } from 'next/server'
import { auth } from '../../../../../auth'
import { db } from '@/lib/db'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si el usuario está autenticado
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    
    // Verificar si el usuario es un conductor
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user || user.role !== 'DRIVER') {
      return NextResponse.json(
        { error: 'Solo los conductores pueden aceptar viajes' },
        { status: 403 }
      )
    }

    const rideId = params.id
    
    // Verificar que el viaje exista y esté disponible
    const ride = await db.ride.findUnique({
      where: { id: rideId },
      select: { status: true }
    })

    if (!ride) {
      return NextResponse.json(
        { error: 'Viaje no encontrado' },
        { status: 404 }
      )
    }

    if (ride.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Este viaje ya ha sido aceptado o cancelado' },
        { status: 400 }
      )
    }

    // Actualizar el viaje
    const updatedRide = await db.ride.update({
      where: { id: rideId },
      data: {
        driverId: userId,
        status: 'ACCEPTED'
      }
    })

    return NextResponse.json(updatedRide)
  } catch (error) {
    console.error('Error al aceptar el viaje:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
} 