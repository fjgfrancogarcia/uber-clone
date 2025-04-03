import { NextResponse } from "next/server";
import { verifyCredentials, generateToken, getCookieExpirationDate } from "../../../../auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    // Extraer credenciales de la solicitud
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Se requiere email y contraseña" }, 
        { status: 400 }
      );
    }

    // Verificar credenciales
    const user = await verifyCredentials({ email, password });
    
    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" }, 
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = generateToken(user);
    
    // Crear respuesta
    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
    // Establecer cookie con el token
    cookies().set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: getCookieExpirationDate(),
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error("Error en inicio de sesión:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
} 