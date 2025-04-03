'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function SignUp() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('USER') // Valor por defecto: pasajero
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
    setSuccess(false)

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role, // Enviar el rol seleccionado
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar el usuario')
      }

      setSuccess(true)
      
      // Redirigir a la página de inicio de sesión después de un registro exitoso
      setTimeout(() => {
        router.push('/auth/signin')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error durante el registro')
    } finally {
      setIsLoading(false)
    }
  }

  // Si estamos cargando la sesión, mostrar un indicador de carga
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear una cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
              ¿Ya tienes una cuenta? Inicia sesión
            </Link>
          </p>
        </div>
        
        {success ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">¡Registro exitoso!</h3>
                <p className="text-sm text-green-700 mt-2">
                  Tu cuenta ha sido creada. Serás redirigido a la página de inicio de sesión...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="name" className="sr-only">
                  Nombre
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Selección de rol */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona tu rol:
              </label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="user-role"
                    name="role"
                    type="radio"
                    value="USER"
                    checked={role === 'USER'}
                    onChange={() => setRole('USER')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="user-role" className="ml-2 block text-sm text-gray-700">
                    Pasajero
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="driver-role"
                    name="role"
                    type="radio"
                    value="DRIVER"
                    checked={role === 'DRIVER'}
                    onChange={() => setRole('DRIVER')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="driver-role" className="ml-2 block text-sm text-gray-700">
                    Conductor
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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