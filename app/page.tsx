'use client'

import { useState } from "react"
import Image from 'next/image'
import Link from 'next/link'
import { UserCheck, Car, Clock, Navigation } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Uber Clone</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-12 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Bienvenido a nuestra aplicación de transporte
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Una plataforma para conectar pasajeros con conductores.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                <div className="mt-5 flex flex-col items-start space-y-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Solicita un viaje
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Encuentra conductores disponibles cerca de ti y llega a tu destino rápidamente.
                  </p>
                  <Link
                    href="/passenger/request-ride"
                    className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Solicitar viaje
                  </Link>
                </div>
                <div className="mt-5 flex flex-col items-start space-y-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Conviértete en conductor
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Genera ingresos conduciendo en tus tiempos libres.
                  </p>
                  <Link
                    href="/become-driver"
                    className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                  >
                    Ser conductor
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 