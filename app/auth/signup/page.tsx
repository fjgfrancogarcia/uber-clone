'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

type UserRole = 'USER' | 'DRIVER'

export default function SignUp() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('USER')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validación básica
    if (name === '' || email === '' || password === '') {
      setError('Por favor complete todos los campos')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      // Registrar usuario
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      })

      // Verificar respuesta
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar el usuario');
      }

      // Si el registro es exitoso, mostrar mensaje de éxito
      setSuccess(true);
      
      // Iniciar sesión automáticamente después del registro
      setTimeout(async () => {
        await signIn('credentials', {
          redirect: false,
          email,
          password,
        });
        
        router.push('/');
        router.refresh();
      }, 1500);
    } catch (error: any) {
      console.error("Error durante el registro:", error);
      setError(error.message || 'Error al registrar el usuario. Por favor intente nuevamente.');
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crea tu cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            <Link href="/auth/signin" className="font-medium text-primary-600 hover:text-primary-700">
              ¿Ya tienes una cuenta? Inicia sesión
            </Link>
          </p>
        </div>
        
        {success ? (
          <div className="rounded-md bg-success-50 p-4 border border-success-200">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="mt-2 text-xl font-bold text-gray-900">¡Registro exitoso!</h2>
              <p className="mt-2 text-gray-600">
                Tu cuenta ha sido creada exitosamente. Serás redirigido automáticamente.
              </p>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Contraseña (mínimo 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Rol de usuario
                </label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      id="role-user"
                      name="role"
                      type="radio"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      checked={role === 'USER'}
                      onChange={() => setRole('USER')}
                    />
                    <label htmlFor="role-user" className="ml-2 block text-sm text-gray-700">
                      Pasajero
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="role-driver"
                      name="role"
                      type="radio"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      checked={role === 'DRIVER'}
                      onChange={() => setRole('DRIVER')}
                    />
                    <label htmlFor="role-driver" className="ml-2 block text-sm text-gray-700">
                      Conductor
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-danger-50 p-4 border border-danger-200">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-danger-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? 'Registrando...' : 'Registrarse'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
} 