'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface RideRequestProps {
  pickup: string
  dropoff: string
  setPickup: (value: string) => void
  setDropoff: (value: string) => void
}

export default function RideRequest({ pickup, setPickup, dropoff, setDropoff }: RideRequestProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Aquí implementaremos la lógica para solicitar el viaje
    setIsLoading(false)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Solicitar Viaje</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Origen</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-3 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="¿Dónde estás?"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Destino</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-3 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="¿A dónde vas?"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isLoading ? 'Solicitando...' : 'Solicitar Viaje'}
        </button>
      </form>
    </div>
  )
} 