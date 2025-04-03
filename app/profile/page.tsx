'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { getCurrentUser } from '../utils/client-auth'
import { UserData } from '../../types/auth'
import { getUserTrips, initializeSampleTrips, Trip } from '../lib/localStorage'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingTrips, setLoadingTrips] = useState(true)
  
  // Obtener datos del usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser()
        if (userData.user) {
          setUser(userData.user)
        } else {
          toast.error('No se pudo obtener información del usuario')
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Error al obtener usuario:', error)
        toast.error('Error al cargar perfil')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUser()
  }, [router])
  
  // Obtener historial de viajes utilizando almacenamiento local
  useEffect(() => {
    const loadTrips = () => {
      if (!user) return
      
      try {
        setLoadingTrips(true)
        
        // Inicializar viajes de ejemplo si no hay ninguno
        initializeSampleTrips(user.id, user.name)
        
        // Obtener viajes del usuario
        const userTrips = getUserTrips(user.id)
        setTrips(userTrips)
      } catch (error) {
        console.error('Error al cargar viajes:', error)
        toast.error('Error al cargar historial de viajes')
      } finally {
        setLoadingTrips(false)
      }
    }
    
    if (user) {
      loadTrips()
    }
  }, [user])
  
  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  
  // Calcular tiempo de membresía
  const getMembershipTime = (createdAt?: string) => {
    if (!createdAt) return 'Desconocido'
    
    const joinDate = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - joinDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays} día${diffDays !== 1 ? 's' : ''}`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} mes${months !== 1 ? 'es' : ''}`
    } else {
      const years = Math.floor(diffDays / 365)
      return `${years} año${years !== 1 ? 's' : ''}`
    }
  }
  
  // Mapear estado a texto y color
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string, color: string }> = {
      'PENDING': { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      'ACCEPTED': { text: 'Aceptado', color: 'bg-blue-100 text-blue-800' },
      'COMPLETED': { text: 'Completado', color: 'bg-green-100 text-green-800' },
      'CANCELLED': { text: 'Cancelado', color: 'bg-red-100 text-red-800' }
    }
    
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' }
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Acceso Restringido</h2>
          <p className="mb-6">Debes iniciar sesión para ver tu perfil</p>
          <Link 
            href="/auth/signin" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Cabecera con información del usuario */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-blue-100">{user.email}</p>
            </div>
            <div className="mt-2 md:mt-0 flex flex-col items-end">
              <span className="text-sm bg-blue-700 px-3 py-1 rounded-full">
                {user.role === 'USER' ? 'Pasajero' : user.role === 'DRIVER' ? 'Conductor' : 'Administrador'}
              </span>
              <span className="text-xs text-blue-200 mt-1">
                ID: {user.id}
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="bg-blue-700 px-4 py-2 rounded">
              <span className="text-xs text-blue-200">Miembro desde</span>
              <p className="text-sm">{user.createdAt ? formatDate(user.createdAt) : 'Desconocido'}</p>
            </div>
            <div className="bg-blue-700 px-4 py-2 rounded">
              <span className="text-xs text-blue-200">Tiempo como miembro</span>
              <p className="text-sm">{getMembershipTime(user.createdAt)}</p>
            </div>
          </div>
        </div>
        
        {/* Sección de viajes recientes */}
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Mis Viajes Recientes</h2>
          
          {loadingTrips ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : trips.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trips.map((trip) => {
                    const { text: statusText, color: statusColor } = getStatusInfo(trip.status)
                    return (
                      <tr key={trip.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(trip.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {trip.originAddress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {trip.destinationAddress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          €{trip.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                            {statusText}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Link 
                            href={`/trips/${trip.id}`} 
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            Detalles
                          </Link>
                          {trip.status === 'PENDING' && (
                            <button 
                              className="text-red-600 hover:text-red-800"
                              onClick={() => toast.error('Función no implementada: Cancelar viaje')}
                            >
                              Cancelar
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded">
              <p className="text-gray-500">No has realizado ningún viaje aún.</p>
              <Link 
                href="/passenger/request-ride" 
                className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Solicitar un viaje
              </Link>
            </div>
          )}
        </div>
        
        {/* Botones de acción según el rol */}
        <div className="p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Acciones</h3>
          <div className="flex flex-wrap gap-4">
            {user.role === 'USER' && (
              <>
                <Link 
                  href="/passenger/request-ride" 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Solicitar un viaje
                </Link>
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  onClick={() => toast.error('Función no implementada: Editar perfil')}
                >
                  Editar perfil
                </button>
              </>
            )}
            
            {user.role === 'DRIVER' && (
              <>
                <Link 
                  href="/driver/available-rides" 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Ver viajes disponibles
                </Link>
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  onClick={() => toast.error('Función no implementada: Editar perfil')}
                >
                  Editar perfil
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Indicar que esta página requiere renderizado dinámico
export const dynamic = 'force-dynamic' 