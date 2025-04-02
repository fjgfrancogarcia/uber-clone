import { NextRequest, NextResponse } from 'next/server'
import { acceptRide } from '../../../../services/rideService'
import { getServerSession } from 'next-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No estás autenticado' },
        { status: 401 }
      )
    }

    // Verificar que el usuario es conductor o admin
    if (session.user.role !== 'DRIVER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para aceptar viajes' },
        { status: 403 }
      )
    }

    const rideId = params.id
    const driverId = session.user.id

    const ride = await acceptRide(rideId, driverId)
    
    return NextResponse.json(ride)
  } catch (error) {
    console.error('Error accepting ride:', error)
    return NextResponse.json(
      { error: 'Hubo un error al aceptar el viaje' },
      { status: 500 }
    )
  }
} 