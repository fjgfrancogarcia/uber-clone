'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const [errorType, setErrorType] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const error = searchParams.get('error')
    setErrorType(error || 'unknown')

    // Mapear códigos de error a mensajes amigables
    const errorMessages: Record<string, string> = {
      'Configuration': 'Hay un problema con la configuración del servidor.',
      'AccessDenied': 'No tienes permiso para acceder a este recurso.',
      'Verification': 'El enlace de verificación ha expirado o ya ha sido usado.',
      'OAuthSignin': 'Error al iniciar sesión con el proveedor OAuth.',
      'OAuthCallback': 'Error en la respuesta del proveedor OAuth.',
      'OAuthCreateAccount': 'No se pudo crear una cuenta usando el proveedor OAuth.',
      'EmailCreateAccount': 'No se pudo crear una cuenta usando la dirección de correo electrónico.',
      'Callback': 'Error en la respuesta del servidor de autenticación.',
      'OAuthAccountNotLinked': 'Esta cuenta ya está asociada con otro inicio de sesión.',
      'EmailSignin': 'Error al enviar el correo electrónico de verificación.',
      'CredentialsSignin': 'Las credenciales proporcionadas no son válidas.',
      'SessionRequired': 'Se requiere iniciar sesión para acceder a esta página.',
      'default': 'Ocurrió un error durante la autenticación.'
    }

    setErrorMessage(errorMessages[error || 'default'] || errorMessages.default)
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Error de autenticación
          </h2>
          <div className="mt-2 text-center text-sm text-gray-600">
            <p>Tipo de error: {errorType}</p>
          </div>
        </div>

        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {errorMessage}
              </h3>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <Link 
            href="/auth/signin" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Volver a iniciar sesión
          </Link>
          <Link 
            href="/" 
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ir a la página principal
          </Link>
        </div>
      </div>
    </div>
  )
} 