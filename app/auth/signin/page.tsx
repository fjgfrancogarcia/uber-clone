'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    if (email === '' || password === '') {
      setError('Por favor ingrese email y contraseña')
      setIsLoading(false)
      return
    }

    try {
      // Iniciar sesión con NextAuth
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError('Credenciales incorrectas. Por favor intente nuevamente.')
        setIsLoading(false)
      } else {
        setSuccess(true)
        
        // Esperar un momento y luego redirigir según el rol
        setTimeout(() => {
          // La redirección se manejará a través del middleware
          router.push('/')
          router.refresh()
        }, 1500)
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error)
      setError('Error durante el inicio de sesión. Por favor intente nuevamente.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Inicia sesión en tu cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            <Link href="/auth/signup" className="font-medium text-primary-600 hover:text-primary-700">
              ¿No tienes una cuenta? Regístrate
            </Link>
          </p>
        </div>
        
        {success ? (
          <div className="rounded-md bg-success-50 p-4 border border-success-200">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-success-800">¡Inicio de sesión exitoso!</h3>
                <p className="mt-2 text-sm text-success-700">
                  Estás siendo redirigido...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
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
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
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
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
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

            <div className="text-sm text-gray-600 mb-4">
              <p>Para fines de prueba, puedes usar:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Pasajero: test@example.com / password</li>
                <li>Administrador: admin@example.com / admin123</li>
              </ul>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
} 