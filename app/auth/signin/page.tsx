'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignIn() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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

    if (email === '' || password === '') {
      setError('Por favor ingrese email y contraseña')
      setIsLoading(false)
      return
    }

    try {
      console.log("Iniciando sesión para:", email);
      
      // Importante: No se usa fetch directamente, sino la función signIn de NextAuth
      const result = await signIn('credentials', {
        redirect: false, // Cambiamos a false para poder manejar errores
        email,
        password
      })
      
      if (result?.error) {
        throw new Error(result.error)
      }
      
      // Si llegamos aquí, la autenticación fue exitosa
      router.push('/')
    } catch (error: any) {
      console.error("Error durante el inicio de sesión:", error);
      setError('Credenciales incorrectas. Por favor intente nuevamente.')
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
      </div>
    </div>
  )
} 