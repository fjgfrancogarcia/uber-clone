'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  const becomeDriver = async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)
      setMessage(null)

      const response = await fetch(`/api/users/${session.user.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'DRIVER' }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al actualizar el rol')
      }

      // Actualizar la sesión para reflejar el nuevo rol
      await update({ role: 'DRIVER' })

      setMessage({
        text: '¡Felicidades! Ahora eres conductor. Puedes empezar a aceptar viajes.',
        type: 'success'
      })
    } catch (error) {
      console.error('Error al convertirse en conductor:', error)
      setMessage({
        text: error instanceof Error ? error.message : 'Hubo un error al procesar tu solicitud',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Información básica */}
            <div className="col-span-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                    {session?.user?.name || 'No especificado'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                    {session?.user?.email}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                    {session?.user?.role === 'DRIVER' 
                      ? 'Conductor' 
                      : session?.user?.role === 'ADMIN' 
                        ? 'Administrador' 
                        : 'Usuario'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Acciones */}
            <div className="col-span-1">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Acciones</h2>
                
                {session?.user?.role === 'USER' && (
                  <div>
                    <button
                      onClick={becomeDriver}
                      disabled={loading}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Procesando...' : 'Convertirme en conductor'}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Como conductor, podrás aceptar viajes y ganar dinero.
                    </p>
                  </div>
                )}
                
                {session?.user?.role === 'DRIVER' && (
                  <div>
                    <button
                      onClick={() => router.push('/driver')}
                      className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                    >
                      Ir al panel de conductor
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {message && (
            <div className={`mt-6 p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 