
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/contexts/AppContext'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { session, user, isSetup, signIn, authLoading, setupLoading } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const from = location.state?.from?.pathname || '/'

  // Redirección simplificada y más rápida
  useEffect(() => {
    // Solo esperar la carga crítica de auth, no el setup
    if (authLoading) {
      console.log('🔄 [Login] Esperando autenticación...')
      return
    }

    // Si hay usuario/sesión válida, redirigir inmediatamente
    if (session || user) {
      // No esperar a que termine de cargar el setup, redirigir ya
      console.log('🔐 [Login] Usuario autenticado, redirigiendo inmediatamente')
      navigate(from, { replace: true })
      return
    }
    
    // Solo si definitivamente no hay setup y ya terminó de cargar, ir a setup
    if (isSetup === false && !setupLoading) {
      console.log('🔧 [Login] Sistema no configurado, redirigiendo a setup')
      navigate('/setup', { replace: true })
      return
    }
  }, [session, user, isSetup, authLoading, setupLoading, navigate, from])

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
      console.log('🔐 [Login] Intentando login para:', email)
      await signIn(email, password)
      
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      })
      
      // La redirección se manejará automáticamente por el useEffect
    } catch (error: any) {
      console.error('❌ [Login] Error en login:', error)
      
      let errorMessage = "Error al iniciar sesión. Inténtalo de nuevo."
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Email o contraseña incorrectos"
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Por favor, confirma tu email antes de iniciar sesión"
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = "Demasiados intentos. Espera unos minutos antes de intentar de nuevo"
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

  // Mostrar loading solo durante la carga inicial crítica
  const showLoading = authLoading || ((session || user) && !setupLoading)
  
  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? 'Verificando autenticación...' : 'Accediendo...'}
          </p>
          {setupLoading && (
            <p className="text-sm text-gray-500 mt-2">
              Verificando configuración en segundo plano...
            </p>
          )}
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
                autoComplete="email"
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
                autoComplete="current-password"
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
          
          {/* Mostrar el estado de verificación del setup si está cargando */}
          {setupLoading && (
            <div className="mt-4 text-center text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                Verificando configuración del sistema...
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
