import { NextRequest, NextResponse } from 'next/server'
import { updateRideStatus } from '../../../../services/rideService'
import { auth } from '../../../../../auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No estás autenticado' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { status } = data

    if (!status || !['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Estado no válido' },
        { status: 400 }
      )
    }

    const rideId = params.id

    const ride = await updateRideStatus(rideId, status)
    
    return NextResponse.json(ride)
  } catch (error) {
    console.error('Error updating ride status:', error)
    return NextResponse.json(
      { error: 'Hubo un error al actualizar el estado del viaje' },
      { status: 500 }
    )
  }
} 