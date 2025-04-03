'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function BecomeDriverPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!session || !session.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-xl font-semibold">No has iniciado sesión</h1>
          <p className="mt-2">Debes iniciar sesión para acceder a esta página.</p>
        </div>
      </div>
    )
  }

  if (session.user.role === 'DRIVER') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-xl font-semibold">¡Ya eres conductor!</h1>
          <p className="mt-2">Ya tienes el rol de conductor en la plataforma.</p>
          <button
            onClick={() => router.push('/driver')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Ir al panel de conductor
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log('Intentando actualizar rol a DRIVER para usuario:', session.user.id)
      const response = await fetch(`/api/users/${session.user.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'DRIVER' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el rol')
      }

      console.log('Rol actualizado correctamente:', data)
      setSuccess(true)
      
      // Actualizar la sesión para reflejar el nuevo rol
      await update()
      
      // Redireccionar después de un breve retraso
      setTimeout(() => {
        router.push('/driver')
      }, 2000)
    } catch (err: any) {
      console.error('Error al convertirse en conductor:', err)
      setError(err.message || 'Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Conviértete en conductor</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success ? (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            ¡Felicidades! Ahora eres conductor. Redirigiendo al panel de conductor...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="mb-4">
              Al convertirte en conductor, podrás aceptar viajes de pasajeros y ganar dinero.
              Este proceso es irreversible.
            </p>
            
            <div className="flex items-center gap-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Procesando...' : 'Convertirme en conductor'}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
} 