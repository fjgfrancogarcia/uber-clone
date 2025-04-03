'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

type UserRole = 'USER' | 'DRIVER'

export default function SignUp() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('USER')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Redireccionar a la página principal si ya está autenticado
  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('Usuario ya autenticado, redirigiendo a la página principal')
      router.push('/')
    }
  }, [session, status, router])

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
      console.log("Registrando usuario:", { name, email, role });
      
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

      // Validar que la respuesta sea correcta antes de intentar parsear el JSON
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error en la respuesta:", response.status, errorData);
        throw new Error(`Error al registrar: ${response.status} ${errorData || response.statusText}`);
      }

      // Parsear la respuesta solo si es exitosa
      const data = await response.json();
      console.log("Respuesta del registro:", data);
      
      // Mostrar mensaje de éxito y redirigir al inicio de sesión después de un breve retraso
      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/signin')
      }, 2000)
    } catch (error: any) {
      console.error("Error durante el registro:", error);
      setError(error.message || 'Error al registrar el usuario. Por favor intente nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Si estamos cargando la sesión, mostrar un indicador de carga
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 rounded-full border-t-transparent mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si ya está autenticado, no mostrar el formulario (aunque el useEffect redirigirá)
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Ya has iniciado sesión. Redirigiendo...</p>
        </div>
      </div>
    )
  }

  // Si el registro fue exitoso, mostrar mensaje de éxito
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="mt-2 text-xl font-bold text-gray-900">¡Registro exitoso!</h2>
            <p className="mt-2 text-gray-600">
              Tu cuenta ha sido creada exitosamente. Serás redirigido para iniciar sesión.
            </p>
          </div>
        </div>
      </div>
    )
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
      </div>
    </div>
  )
} 