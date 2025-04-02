'use client'

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Cerrar el menú cuando se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-800">Uber Clone</span>
            </Link>

            {session && (
              <div className="ml-10 flex items-center space-x-4">
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Solicitar viaje
                </Link>

                <Link 
                  href="/rides-static" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Mis viajes
                </Link>

                {(session.user?.role === 'DRIVER' || session.user?.role === 'ADMIN') && (
                  <Link 
                    href="/driver" 
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Panel de conductor
                  </Link>
                )}

                {session.user?.role === 'ADMIN' && (
                  <Link 
                    href="/admin" 
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Panel de administrador
                  </Link>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4" ref={menuRef}>
                <div className="relative">
                  <button 
                    className="flex items-center space-x-1 text-gray-700"
                    onClick={() => setMenuOpen(!menuOpen)}
                  >
                    <span>
                      {session.user?.name} ({session.user?.role === 'DRIVER' ? 'Conductor' : session.user?.role === 'ADMIN' ? 'Admin' : 'Usuario'})
                    </span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 transform transition-transform ${menuOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Mi Perfil
                      </Link>
                      
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 