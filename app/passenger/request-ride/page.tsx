'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '../../utils/client-auth'

export default function RequestRide() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const { user } = await getCurrentUser()
        setUser(user)
        
        // Si el usuario no está autenticado o no es un pasajero, redirigir al login
        if (!user || (user.role !== 'USER' && user.role !== 'ADMIN')) {
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error)
        router.push('/auth/signin')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)

    try {
      // En una implementación completa, aquí se enviaría la solicitud al backend
      // Aquí simulamos el proceso para la demo
      setTimeout(() => {
        setSuccess(true)
        setSubmitLoading(false)
      }, 1500)
    } catch (error) {
      console.error('Error al solicitar viaje:', error)
      setSubmitLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 mt-20 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario autenticado, mostrar un mensaje (aunque normalmente el useEffect redirigirá)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 mt-20 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">Debes iniciar sesión como pasajero para solicitar un viaje.</p>
          <Link href="/auth/signin" className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Solicitar un viaje</h1>
            
            {success ? (
              <div className="text-center py-10">
                <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
                  <h2 className="font-bold text-xl mb-2">¡Viaje solicitado!</h2>
                  <p>Un conductor está en camino.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-500">Conductor</span>
                    <span className="text-gray-800 font-medium">Miguel González</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-500">Vehículo</span>
                    <span className="text-gray-800 font-medium">Honda Civic - ABC123</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Tiempo estimado</span>
                    <span className="text-gray-800 font-medium">5 minutos</span>
                  </div>
                </div>
                
                <Link href="/passenger/active-ride" className="inline-flex items-center justify-center w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                  Ver detalles del viaje
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
                    Origen
                  </label>
                  <input
                    id="origin"
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="¿Dónde te recogemos?"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                    Destino
                  </label>
                  <input
                    id="destination"
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="¿A dónde vas?"
                    required
                  />
                </div>
                
                <div className="bg-gray-200 h-64 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">Mapa</p>
                    <p className="text-sm text-gray-400">Selecciona ubicación en el mapa</p>
                  </div>
                </div>
                
                <div className="flex justify-between bg-gray-50 p-4 rounded-md">
                  <div>
                    <h3 className="font-medium">UberX</h3>
                    <p className="text-sm text-gray-500">4 pasajeros</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$15.50</p>
                    <p className="text-sm text-gray-500">15 min</p>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={submitLoading || !origin || !destination}
                  className="inline-flex items-center justify-center w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300"
                >
                  {submitLoading ? 'Solicitando...' : 'Solicitar viaje'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 