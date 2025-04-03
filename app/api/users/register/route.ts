import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcrypt'
import { prisma } from '../../../../prisma/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, email, password } = data

    // Validación básica
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 400 })
    }

    // Hashear la contraseña (10 es el factor de costo, cuanto mayor sea, más seguro pero más lento)
    const hashedPassword = await hash(password, 10)

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER' // Por defecto, todos los usuarios nuevos son pasajeros
      }
    })

    // Excluir la contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Error registering user:', error)
    return NextResponse.json({ error: 'Error al registrar el usuario' }, { status: 500 })
  }
} 