import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../prisma/prisma'
import bcryptjs from 'bcryptjs'
import { generateToken, getCookieExpirationDate } from '../../../../auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Extraer datos del usuario
    const body = await request.json()
    const { name, email, password } = body
    
    // Validar datos
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
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
    const hashedPassword = await bcryptjs.hash(password, 10)
    
    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER'
      }
    })
    
    // Generar token JWT
    const token = await generateToken({
      id: user.id,
      name: user.name || '',
      email: user.email,
      role: user.role as any
    })
    
    // Establecer cookie
    cookies().set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: await getCookieExpirationDate(),
      path: '/'
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