import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Implementación temporal con datos simulados
    const data = await request.json()
    const { status } = data
    const rideId = params.id

    if (!status || !['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Estado no válido' },
        { status: 400 }
      )
    }

    // Simular una respuesta exitosa
    return NextResponse.json({
      id: rideId,
      status: status,
      updatedAt: new Date().toISOString(),
      message: `El estado del viaje ha sido actualizado a ${status}`
    })
  } catch (error) {
    console.error('Error updating ride status:', error)
    return NextResponse.json(
      { error: 'Hubo un error al actualizar el estado del viaje' },
      { status: 500 }
    )
  }
} 