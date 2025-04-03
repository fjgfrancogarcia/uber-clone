import { NextResponse } from 'next/server'
import { prisma } from '../../../../prisma/prisma'
import { auth } from '../../../../auth'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No estás autenticado' },
        { status: 401 }
      )
    }

    // Buscar el usuario en la base de datos para obtener la información completa
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        // Incluir conteo de viajes
        _count: {
          select: {
            rides: true,
            driverRides: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Hubo un error al obtener tu perfil' },
      { status: 500 }
    )
  }
} 