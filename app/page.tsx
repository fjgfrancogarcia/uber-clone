'use client'

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from 'next/image'
import Link from 'next/link'
import { UserCheck, Car, Clock, Navigation } from 'lucide-react'
import AuthStatus from './components/AuthStatus'

// Importar toast de forma dinámica
const toast = {
  loading: (message: string) => {
    // Esta función será sobrescrita cuando el módulo toast se cargue
    console.log('Loading:', message);
    return '';
  },
  success: (message: string, options?: any) => {
    console.log('Success:', message);
  },
  error: (message: string, options?: any) => {
    console.error('Error:', message);
  }
};

// Cargar el módulo de forma dinámica
if (typeof window !== 'undefined') {
  import('react-hot-toast').then((mod) => {
    // Reemplazar las funciones del objeto toast
    Object.assign(toast, mod.toast);
  });
}

// Cargar directamente el componente LeafletMap para evitar problemas de SSR
const LeafletMap = dynamic(() => import("./components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    </div>
  )
})

// Función para convertir coordenadas a dirección (geocodificación inversa)
const getAddressFromCoords = async (coords: [number, number]): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[1]}&lon=${coords[0]}&addressdetails=1`
    );
    const data = await response.json();
    
    if (data && data.display_name) {
      // Extraer solo los componentes importantes de la dirección
      const parts = data.display_name.split(', ');
      // Tomar solo los primeros 2-3 componentes para una dirección más corta
      return parts.slice(0, 3).join(', ');
    }
    return `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`;
  } catch (error) {
    console.error('Error al obtener dirección:', error);
    return `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`;
  }
};

export default function Home() {
  const { data: session } = useSession()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Uber Clone</h1>
          <AuthStatus />
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