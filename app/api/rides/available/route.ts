import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '../../../../auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
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

    // Obtener viajes disponibles (pendientes y sin conductor asignado)
    const rides = await prisma.ride.findMany({
      where: {
        status: 'PENDING',
        driverId: null,
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
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(rides)
  } catch (error) {
    console.error('Error fetching available rides:', error)
    return NextResponse.json(
      { error: 'Hubo un error al obtener los viajes disponibles' },
      { status: 500 }
    )
  }
} 