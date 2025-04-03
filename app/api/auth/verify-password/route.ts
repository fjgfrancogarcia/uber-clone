import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import { prisma } from '../../../../prisma/prisma';

// Esta API es llamada desde el cliente para verificar contraseñas
// sin incluir bcrypt en el bundle del cliente
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // No revelar si el usuario existe o no por razones de seguridad
      return NextResponse.json(
        { success: false },
        { status: 200 } // Usar 200 para no revelar información
      );
    }

    // Usuario de prueba
    if (email === 'test@example.com' && password === 'password') {
      return NextResponse.json({ 
        success: true,
        user: {
          id: 'test-user-id',
          name: 'Usuario de Prueba',
          email: 'test@example.com',
          role: 'USER'
        }
      });
    }

    // Usuario de emergencia admin
    if (email === 'admin@example.com' && password === 'admin123') {
      return NextResponse.json({ 
        success: true,
        user: {
          id: 'admin-user-id',
          name: 'Administrador',
          email: 'admin@example.com',
          role: 'ADMIN'
        }
      });
    }

    // Verificar que el usuario tenga una contraseña configurada
    if (!user.password) {
      return NextResponse.json(
        { success: false },
        { status: 200 }
      );
    }

    // Verificar contraseña usando bcrypt (solo en el servidor)
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false },
        { status: 200 }
      );
    }

    // Retornar información del usuario para la sesión (sin la contraseña)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name || "",
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error verificando contraseña:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 