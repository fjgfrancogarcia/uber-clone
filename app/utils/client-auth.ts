'use client';

import { UserData } from '../../types/auth';

// Para desarrollo, versión cliente que no usa módulos nativos
export async function login(email: string, password: string): Promise<{ success: boolean; user?: UserData; error?: string }> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }

    return { success: true, user: data.user };
  } catch (error: any) {
    console.error('Error en cliente durante login:', error);
    return { success: false, error: error.message || 'Error al iniciar sesión' };
  }
}

export async function register(userData: { 
  name: string; 
  email: string; 
  password: string; 
  role?: string; 
}): Promise<{ success: boolean; user?: UserData; error?: string }> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al registrar usuario');
    }

    return { success: true, user: data.user };
  } catch (error: any) {
    console.error('Error en cliente durante registro:', error);
    return { success: false, error: error.message || 'Error al registrar usuario' };
  }
}

export async function logout(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Error al cerrar sesión');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error en cliente durante logout:', error);
    return { success: false, error: error.message || 'Error al cerrar sesión' };
  }
}

export async function getCurrentUser(): Promise<{ user?: UserData; error?: string }> {
  try {
    const response = await fetch('/api/auth/me');
    
    if (!response.ok) {
      // No hay error si no hay usuario, simplemente devolvemos null
      if (response.status === 401) {
        return { user: undefined };
      }
      throw new Error('Error al obtener usuario');
    }

    const data = await response.json();
    return { user: data.user };
  } catch (error: any) {
    console.error('Error en cliente al obtener usuario:', error);
    return { error: error.message || 'Error al obtener usuario' };
  }
} 