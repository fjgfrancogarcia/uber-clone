import { NextResponse } from "next/server";
import { verifyToken } from "../../../../auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Obtener token de la cookie
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    // Información de depuración
    const allCookies = cookieStore.getAll();
    const cookieDebug = allCookies.map(c => `${c.name}: ${c.value.substring(0, 10)}...`).join(', ');
    
    console.log('Cookies disponibles:', cookieDebug);
    console.log('Token encontrado:', token ? 'Sí' : 'No');
    
    if (!token) {
      return NextResponse.json(
        { 
          error: "No autenticado",
          debug: {
            cookiesAvailable: allCookies.length > 0,
            cookieNames: allCookies.map(c => c.name)
          }
        }, 
        { status: 401 }
      );
    }
    
    // Verificar token
    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { 
          error: "Token inválido o expirado",
          debug: { tokenExists: true }
        }, 
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
      { 
        error: "Error en el servidor",
        debug: { message: error instanceof Error ? error.message : String(error) }
      },
      { status: 500 }
    );
  }
} 