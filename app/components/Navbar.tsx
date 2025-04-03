'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import Image from 'next/image'

const Navbar = () => {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  // Flag para mostrar siempre las opciones de inicio de sesión/registro mientras se arregla la autenticación
  const showAuthLinks = true

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const closeDropdown = () => {
    setDropdownOpen(false)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
    closeMenu()
    closeDropdown()
  }

  // Revisar si el usuario es conductor (DRIVER)
  const isDriver = session?.user?.role === 'DRIVER'

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-md py-2' 
          : 'bg-white py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="flex items-center space-x-2"
              onClick={closeMenu}
            >
              <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="text-gray-900 font-semibold text-xl">Uber</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link
                href="/"
                className={`${
                  pathname === '/'
                    ? 'text-primary-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                } transition-colors duration-200 text-sm`}
              >
                Inicio
              </Link>
              
              {session ? (
                <>
                  <Link
                    href="/rides"
                    className={`${
                      pathname === '/rides'
                        ? 'text-primary-600 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    } transition-colors duration-200 text-sm`}
                  >
                    Mis Viajes
                  </Link>
                  
                  {session.user?.role === 'DRIVER' && (
                    <Link
                      href="/rides/available"
                      className={`${
                        pathname === '/rides/available'
                          ? 'text-primary-600 font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                      } transition-colors duration-200 text-sm`}
                    >
                      Viajes Disponibles
                    </Link>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* User section */}
          <div className="hidden md:flex items-center space-x-6">
            {session ? (
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 group"
                  onClick={toggleDropdown}
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border-2 border-white shadow-sm">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User profile'}
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-700 font-medium text-sm">
                        {session.user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:inline-block">
                    {session.user?.name || 'Usuario'}
                  </span>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 animate-fade-in"
                    onMouseLeave={closeDropdown}
                  >
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50"
                      onClick={closeDropdown}
                    >
                      Mi Perfil
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Mostrar los enlaces de autenticación siempre mientras se arregla la autenticación
              <>
                <Link
                  href="/auth/signin"
                  className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn btn-primary"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={toggleMenu}
            >
              <span className="sr-only">
                {isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              </span>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t animate-slide-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className={`${
                pathname === '/'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              } block px-3 py-2 rounded-md text-base font-medium`}
              onClick={closeMenu}
            >
              Inicio
            </Link>
            
            {session && (
              <>
                <Link
                  href="/rides"
                  className={`${
                    pathname === '/rides'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  } block px-3 py-2 rounded-md text-base font-medium`}
                  onClick={closeMenu}
                >
                  Mis Viajes
                </Link>
                
                {session.user?.role === 'DRIVER' && (
                  <Link
                    href="/rides/available"
                    className={`${
                      pathname === '/rides/available'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    } block px-3 py-2 rounded-md text-base font-medium`}
                    onClick={closeMenu}
                  >
                    Viajes Disponibles
                  </Link>
                )}
              </>
            )}
            
            {/* Mostrar siempre los enlaces de inicio de sesión/registro en el menú móvil */}
            <Link
              href="/auth/signin"
              className="text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
              onClick={closeMenu}
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/signup"
              className="text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
              onClick={closeMenu}
            >
              Registrarse
            </Link>
          </div>
          
          {session && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User profile'}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-700 font-medium">
                        {session.user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {session.user?.name || 'Usuario'}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {session.user?.email || ''}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={closeMenu}
                >
                  Mi Perfil
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar 