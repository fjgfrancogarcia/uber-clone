'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '../Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../Card'
import { User, Mail, Key, Lock, UserCheck, Eye, EyeOff } from 'lucide-react'

interface AuthFormProps {
  type: 'login' | 'signup'
}

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' as 'USER' | 'DRIVER'
  })

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (type === 'login') {
        // Iniciar sesión
        const result = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        })

        if (!result?.ok) {
          throw new Error(result?.error || 'Error al iniciar sesión')
        }

        router.push('/')
      } else {
        // Registrarse
        const response = await fetch('/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || 'Error al registrarse')
        }

        // Iniciar sesión automáticamente después de registrarse
        await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        })

        router.push('/')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto my-8 px-4 sm:px-0">
      <Card>
        <CardHeader>
          <CardTitle>
            {type === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </CardTitle>
          <CardDescription>
            {type === 'login'
              ? 'Ingresa tus credenciales para acceder a tu cuenta'
              : 'Completa el formulario para crear tu cuenta'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-danger-50 border border-danger-200 text-danger-700 text-sm animate-fade-in">
                {error}
              </div>
            )}
            
            {type === 'signup' && (
              <div className="space-y-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={type === 'login' ? "current-password" : "new-password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input pl-10 pr-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder={type === 'login' ? "Tu contraseña" : "Crea una contraseña segura"}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {type === 'signup' && (
              <div className="space-y-1">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Tipo de Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <UserCheck size={18} />
                  </div>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-input pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="USER">Pasajero</option>
                    <option value="DRIVER">Conductor</option>
                  </select>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              fullWidth 
              isLoading={isLoading}
              disabled={isLoading}
            >
              {type === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <div className="w-full text-center text-sm">
            {type === 'login' ? (
              <>
                ¿No tienes una cuenta?{' '}
                <Link href="/auth/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                  Regístrate aquí
                </Link>
              </>
            ) : (
              <>
                ¿Ya tienes una cuenta?{' '}
                <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Inicia sesión aquí
                </Link>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 