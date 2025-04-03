import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "../../../../auth";

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
    const userData = verifyToken(token);
    
    if (!userData) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }
    
    // Devolver datos del usuario sin info sensible
    return NextResponse.json({
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      }
    });
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
} 