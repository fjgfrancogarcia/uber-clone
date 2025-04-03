import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcrypt'
import { prisma } from '../../../../prisma/prisma'
import bcrypt from 'bcrypt'
import type { UserRole } from '../../../../types/auth'

export async function POST(request: NextRequest) {
  try {
    // Extraer datos del usuario
    const body = await request.json()
    const { name, email, password, role = 'USER' } = body
    
    // Validar datos
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Se requiere nombre, email y contraseña" },
        { status: 400 }
      )
    }
    
    // Verificar si el email ya está registrado
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 409 }
      )
    }
    
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as UserRole
      }
    })
    
    // Responder sin incluir la contraseña
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error("Error en registro de usuario:", error)
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    )
  }
} 