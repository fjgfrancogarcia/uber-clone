import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import { prisma } from '../../../../prisma/prisma';

export async function POST(request: NextRequest) {
  console.log("Recibida solicitud a verify-credentials");
  
  try {
    const { email, password } = await request.json();
    console.log("Verificando credenciales para email:", email);

    // Validación de datos
    if (!email || !password) {
      console.log("Error: Credenciales incompletas");
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
      console.log("Error: Usuario no encontrado:", email);
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    console.log("Usuario encontrado:", user.id);

    if (!user.password) {
      console.log("Error: Usuario sin contraseña");
      return NextResponse.json(
        { message: 'Usuario no tiene contraseña configurada' },
        { status: 400 }
      );
    }

    // Verificar contraseña
    console.log("Comparando contraseñas...");
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      console.log("Error: Contraseña incorrecta");
      return NextResponse.json(
        { message: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    console.log("Autenticación exitosa para:", user.email);

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