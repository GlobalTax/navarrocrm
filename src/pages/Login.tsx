
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useSystemSetup } from '@/hooks/useSystemSetup'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { isSetup, loading: setupLoading } = useSystemSetup()

  const from = location.state?.from?.pathname || '/dashboard'

  // Redirigir al setup si el sistema no está configurado
  useEffect(() => {
    console.log('🔍 Verificando redirección:', { setupLoading, isSetup })
    if (!setupLoading && isSetup === false) {
      console.log('↪️ Redirigiendo al setup porque el sistema no está configurado')
      navigate('/setup', { replace: true })
    }
  }, [isSetup, setupLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      console.log('🔐 Iniciando proceso de login...')
      await signIn(email, password)
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema",
      })
      console.log('↪️ Redirigiendo a:', from)
      navigate(from, { replace: true })
    } catch (error: any) {
      console.error('❌ Error de autenticación:', error)
      let errorMessage = "Credenciales inválidas"
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Email o contraseña incorrectos"
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Por favor, confirma tu email antes de iniciar sesión"
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Error de autenticación",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Mostrar loading mientras se verifica el setup
  if (setupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando configuración del sistema...</p>
        </div>
      </div>
    )
  }

  // No mostrar login si el sistema no está configurado (se redirigirá al setup)
  if (isSetup === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo al setup inicial...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary-600">CRM Legal</CardTitle>
          <CardDescription>
            Inicia sesión en tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email.trim() || !password.trim()}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>¿Primera vez? El sistema te guiará en la configuración inicial.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
