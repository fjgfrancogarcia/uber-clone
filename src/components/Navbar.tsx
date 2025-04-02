'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                Uber Clone
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  Hola, {session.user?.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/auth/signin')}
                className="text-gray-700 hover:text-indigo-600"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 