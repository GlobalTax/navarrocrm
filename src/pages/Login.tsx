
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
  const { user, session, signIn, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { isSetup, loading: setupLoading } = useSystemSetup()

  const from = location.state?.from?.pathname || '/dashboard'

  // Redirección automática mejorada - priorizar session
  useEffect(() => {
    if (!authLoading && !setupLoading) {
      // Si hay sesión válida o usuario, redirigir
      if ((session || user) && isSetup !== false) {
        console.log('🔐 [Login] Usuario/sesión encontrada, redirigiendo a:', from)
        navigate(from, { replace: true })
      }
      
      // Si el sistema no está configurado, ir a setup
      if (isSetup === false) {
        console.log('🔧 [Login] Sistema no configurado, redirigiendo a setup')
        navigate('/setup', { replace: true })
      }
    }
  }, [session, user, authLoading, setupLoading, isSetup, navigate, from])

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
      await signIn(email, password)
      // La redirección se manejará automáticamente por el useEffect
    } catch (error: any) {
      console.error('❌ [Login] Error en login:', error)
      toast({
        title: "Error de autenticación",
        description: error.message === 'Invalid login credentials' 
          ? "Email o contraseña incorrectos" 
          : "Error al iniciar sesión. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Mostrar loading mientras se verifica el estado
  if (authLoading || setupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            {setupLoading ? 'Verificando configuración...' : 'Verificando autenticación...'}
          </p>
        </div>
      </div>
    )
  }

  // Si hay sesión/usuario y sistema configurado, mostrar redirección
  if ((session || user) && isSetup !== false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo al dashboard...</p>
        </div>
      </div>
    )
  }

  // Si el sistema no está configurado, mostrar redirección a setup
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
        </CardContent>
      </Card>
    </div>
  )
}
