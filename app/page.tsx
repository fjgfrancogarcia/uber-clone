'use client'

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from 'next/image'
import Link from 'next/link'
import { UserCheck, Car, Clock, Navigation } from 'lucide-react'

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
    <main className="flex-1">
      {/* Hero Section */}
      <section className="py-16 md:py-24 lg:py-32 px-4 md:px-6 bg-gradient-to-br from-primary-50 to-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Tu viaje, tu <span className="text-primary-600">elección</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed">
                  Conectamos pasajeros con conductores para viajes seguros, rápidos y económicos.
                  Comienza a viajar o conducir hoy mismo.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {!session ? (
                  <>
                    <Link 
                      href="/auth/signup" 
                      className="btn btn-primary py-3 px-8 text-center"
                    >
                      Comenzar ahora
                    </Link>
                    <Link 
                      href="/auth/signin" 
                      className="btn btn-outline py-3 px-8 text-center"
                    >
                      Iniciar sesión
                    </Link>
                  </>
                ) : (
                  <Link 
                    href="/rides" 
                    className="btn btn-primary py-3 px-8 text-center"
                  >
                    Ver mis viajes
                  </Link>
                )}
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/hero-image.jpg"
                  alt="Uso de la aplicación de viajes"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-2xl"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tiempo estimado</p>
                    <p className="text-lg font-bold text-success-600">12 minutos</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-lg shadow-lg animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Destino</p>
                    <p className="text-lg font-bold text-primary-600">3.5 km</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Una experiencia de viaje excepcional
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Nuestra aplicación ofrece características diseñadas para hacer tus viajes más fáciles, seguros y cómodos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-card transition-all duration-300">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <Navigation className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Viajes rápidos</h3>
              <p className="text-gray-600">
                Algoritmo inteligente que conecta con el conductor más cercano para minimizar los tiempos de espera.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-card transition-all duration-300">
              <div className="w-14 h-14 bg-secondary-100 rounded-xl flex items-center justify-center mb-6">
                <Car className="w-7 h-7 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Conductores verificados</h3>
              <p className="text-gray-600">
                Todos nuestros conductores pasan por un riguroso proceso de verificación para garantizar tu seguridad.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-card transition-all duration-300">
              <div className="w-14 h-14 bg-success-100 rounded-xl flex items-center justify-center mb-6">
                <UserCheck className="w-7 h-7 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Experiencia personalizada</h3>
              <p className="text-gray-600">
                Adaptamos cada viaje a tus preferencias para ofrecerte la mejor experiencia posible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 md:px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Cómo funciona
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              En solo unos pocos pasos, estarás en camino a tu destino.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">1</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Registrarse</h3>
              <p className="text-gray-600">
                Crea una cuenta en nuestra plataforma como pasajero o conductor.
              </p>
            </div>

            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">2</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Solicitar un viaje</h3>
              <p className="text-gray-600">
                Ingresa tu destino y selecciona el tipo de vehículo que prefieras.
              </p>
            </div>

            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">3</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">¡Disfruta tu viaje!</h3>
              <p className="text-gray-600">
                Un conductor verificado te recogerá y te llevará a tu destino de manera segura.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-6 bg-primary-600">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Únete a nuestra comunidad
            </h2>
            <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto">
              Miles de personas ya están usando nuestra plataforma para sus viajes diarios.
              No te quedes atrás, comienza hoy mismo.
            </p>
            <div className="mt-8">
              <Link 
                href={session ? "/rides" : "/auth/signup"}
                className="bg-white text-primary-600 hover:bg-primary-50 transition-colors duration-200 inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm"
              >
                {session ? "Ver mis viajes" : "Registrarse ahora"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 