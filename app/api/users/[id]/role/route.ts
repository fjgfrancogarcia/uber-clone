import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '../../../../../auth'

const prisma = new PrismaClient()

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

    // Solo los administradores pueden cambiar roles (o el propio usuario puede hacerse conductor)
    if (session.user.role !== 'ADMIN' && session.user.id !== params.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      )
    }

    const data = await request.json()
    const { role } = data

    if (!role || !['USER', 'DRIVER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Rol no válido' },
        { status: 400 }
      )
    }

    // Si no es admin, solo puede cambiar a DRIVER
    if (session.user.role !== 'ADMIN' && role === 'ADMIN') {
      return NextResponse.json(
        { error: 'No puedes asignarte el rol de administrador' },
        { status: 403 }
      )
    }

    const user = await prisma.user.update({
      where: {
        id: params.id
      },
      data: {
        role
      }
    })
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Hubo un error al actualizar el rol del usuario' },
      { status: 500 }
    )
  }
} 