import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import { prisma } from '../../../../prisma/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validación de datos
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { message: 'Usuario no tiene contraseña configurada' },
        { status: 400 }
      );
    }

    // Verificar contraseña
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Retornar información del usuario (excepto la contraseña)
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      id: user.id,
      name: user.name || "",
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Error verificando credenciales:', error);
    return NextResponse.json(
      { message: 'Error al verificar credenciales' },
      { status: 500 }
    );
  }
} 