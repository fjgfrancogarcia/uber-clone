import { NextResponse } from "next/server";
import { verifyToken } from "../../../../auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Obtener token de la cookie
    const token = cookies().get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "No autenticado" }, 
        { status: 401 }
      );
    }
    
    // Verificar token
    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: "Token inválido o expirado" }, 
        { status: 401 }
      );
    }
    
    // Devolver datos del usuario (sin información sensible)
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
} 