'use client'

import { useState, useEffect } from "react"
import Image from 'next/image'
import Link from 'next/link'
import { UserCheck, Car, Clock, MapPin, CreditCard, Shield, Users } from 'lucide-react'

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header con efecto de transparencia al hacer scroll */}
      <header className={`fixed top-0 w-full z-10 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-6'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className={`text-3xl font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>
            ChauTuTaxi
          </h1>
          <div className="flex space-x-4">
            <Link 
              href="/auth/signin" 
              className={`px-4 py-2 rounded-full transition-colors ${
                scrolled 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              Iniciar sesión
            </Link>
            <Link 
              href="/auth/signup" 
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section con imagen de fondo */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 z-10" />
          <Image 
            src="https://images.unsplash.com/photo-1519677584237-752f8853252e?q=80&w=2070"
            alt="Ciudad con tráfico"
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-20 text-white">
          <div className="max-w-3xl">
            <h2 className="text-5xl font-bold mb-6">Viaja más rápido y seguro</h2>
            <p className="text-xl mb-8 text-gray-200">
              Conectamos pasajeros y conductores para que llegues a tu destino de manera cómoda, segura y a un precio justo.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/passenger/request-ride"
                className="px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Solicitar un viaje
              </Link>
              <Link 
                href="/become-driver"
                className="px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Conviértete en conductor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">¿Por qué elegirnos?</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center transition-transform hover:scale-105">
              <div className="mb-4 rounded-full bg-blue-100 p-3 w-16 h-16 flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Rápido y puntual</h3>
              <p className="text-gray-600">
                Nuestros conductores llegan rápidamente y te llevan a tiempo a tu destino.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm text-center transition-transform hover:scale-105">
              <div className="mb-4 rounded-full bg-blue-100 p-3 w-16 h-16 flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Seguridad garantizada</h3>
              <p className="text-gray-600">
                Todos nuestros conductores pasan por un riguroso proceso de verificación.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm text-center transition-transform hover:scale-105">
              <div className="mb-4 rounded-full bg-blue-100 p-3 w-16 h-16 flex items-center justify-center mx-auto">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Pagos flexibles</h3>
              <p className="text-gray-600">
                Paga como prefieras: efectivo, tarjeta o métodos digitales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección para conductores */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-12">
              <h2 className="text-4xl font-bold mb-6">Genera ingresos conduciendo</h2>
              <p className="text-xl text-gray-600 mb-8">
                Únete a nuestra plataforma como conductor y comienza a generar ingresos en tus tiempos libres.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="mr-4 mt-1 rounded-full bg-green-100 p-1">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-gray-700">Cientos de pasajeros buscan viajes diariamente</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-4 mt-1 rounded-full bg-green-100 p-1">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-gray-700">Tú decides cuándo y cuánto trabajar</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-4 mt-1 rounded-full bg-green-100 p-1">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-gray-700">Recibe pagos semanales directamente a tu cuenta</span>
                </li>
              </ul>
              <Link
                href="/become-driver"
                className="px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors inline-flex items-center"
              >
                <Car className="mr-2 h-5 w-5" />
                Comenzar como conductor
              </Link>
            </div>
            <div className="md:w-1/2 relative h-80 md:h-96 rounded-xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070"
                alt="Conductor en un automóvil"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 bg-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">¿Listo para comenzar?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Únete a miles de usuarios que confían en nosotros para sus desplazamientos diarios.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/auth/signup"
              className="px-8 py-4 bg-white text-blue-700 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Crear una cuenta
            </Link>
            <Link 
              href="/passenger/request-ride"
              className="px-8 py-4 bg-blue-600 text-white border border-white rounded-full text-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Solicitar un viaje
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">ChauTuTaxi</h3>
              <p className="mb-4">La forma moderna de viajar en la ciudad.</p>
            </div>
            <div>
              <h4 className="text-white text-md font-medium mb-4">Servicios</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition-colors">Viajes</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Conducir</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Empresas</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-md font-medium mb-4">Compañía</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition-colors">Acerca de</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Seguridad</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-md font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition-colors">Términos</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacidad</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} ChauTuTaxi. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 