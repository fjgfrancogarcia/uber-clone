import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Implementación temporal con datos simulados
    const { role } = await request.json()
    const userId = params.id

    if (!role || !['USER', 'DRIVER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Rol no válido' },
        { status: 400 }
      )
    }

    // Simular una respuesta exitosa
    return NextResponse.json({
      id: userId,
      role: role,
      updatedAt: new Date().toISOString(),
      message: `El rol del usuario ha sido actualizado a ${role}`
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Hubo un error al actualizar el rol del usuario' },
      { status: 500 }
    )
  }
} 