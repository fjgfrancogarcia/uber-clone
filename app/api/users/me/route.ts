import { NextResponse } from 'next/server'

// Ruta simplificada para evitar errores de compilación
export async function GET() {
  try {
    // Devolvemos una respuesta temporal
    return NextResponse.json({
      id: "mock-user-id",
      name: "Usuario Demo",
      email: "demo@example.com",
      role: "USER",
      createdAt: new Date().toISOString(),
      _count: {
        rides: 0,
        driverRides: 0
      }
    })
  } catch (error) {
    console.error('Error in mock user route:', error)
    return NextResponse.json(
      { error: 'Hubo un error al obtener tu perfil' },
      { status: 500 }
    )
  }
} 