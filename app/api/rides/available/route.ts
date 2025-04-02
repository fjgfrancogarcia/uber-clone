import { NextRequest, NextResponse } from 'next/server'
import { getAvailableRides } from '../../../services/rideService'
import { getServerSession } from 'next-auth'

export async function GET(request: NextRequest) {
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
        { error: 'No tienes permisos para ver esta información' },
        { status: 403 }
      )
    }

    const rides = await getAvailableRides()
    
    return NextResponse.json(rides)
  } catch (error) {
    console.error('Error fetching available rides:', error)
    return NextResponse.json(
      { error: 'Hubo un error al obtener los viajes disponibles' },
      { status: 500 }
    )
  }
} 