'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { UserData } from '../../types/auth';
import { getCurrentUser, logout } from '../utils/client-auth';

export default function AuthStatus() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const result = await getCurrentUser();
        if (result.user) {
          setUser(result.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error al verificar estado de autenticación:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        setUser(null);
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      {user ? (
        <div className="flex items-center space-x-4">
          <span>Hola, {user.name}</span>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      ) : (
        <div className="flex space-x-4">
          <Link
            href="/auth/signin"
            className="text-blue-600 hover:underline"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/auth/signup"
            className="text-blue-600 hover:underline"
          >
            Registrarse
          </Link>
        </div>
      )}
    </div>
  );
} 