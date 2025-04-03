'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const Navbar = () => {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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
            </div>
          </div>

          {/* User section */}
          <div className="hidden md:flex items-center space-x-6">
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
        </div>
      )}
    </nav>
  )
}

export default Navbar 