'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/auth/signin')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 rounded-full border-t-transparent mb-4"></div>
        <p className="text-gray-600">Redirigiendo a la página de inicio de sesión...</p>
      </div>
    </div>
  )
} 