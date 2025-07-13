
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { AccessibleForm } from '@/components/common/AccessibleForm'
import { SmartLoadingButton } from '@/components/common/SmartLoadingButton'
import { useAccessibility } from '@/hooks/useAccessibility'
import { authLogger } from '@/utils/logger'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { session, user, signIn, authLoading } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const { announceRouteChange } = useAccessibility()

  const from = location.state?.from?.pathname || '/'

  // Redirección más directa
  useEffect(() => {
    authLogger.debug('Auth state check', { session: !!session, user: !!user, authLoading })
    
    if (authLoading) return

    if (session || user) {
      authLogger.info('User authenticated, redirecting', { from })
      announceRouteChange('Área principal')
      navigate(from, { replace: true })
    }
  }, [session, user, authLoading, navigate, from, announceRouteChange])

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Por favor, completa todos los campos")
      return
    }

    try {
      authLogger.info('Login attempt', { email })
      await signIn(email, password)
      
      toast.success("¡Bienvenido! Has iniciado sesión correctamente")
    } catch (error: any) {
      authLogger.error('Login failed', { error: error.message })
      
      let errorMessage = "Error al iniciar sesión"
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Email o contraseña incorrectos"
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Por favor, confirma tu email"
      }
      
      toast.error(errorMessage)
      throw error // Re-throw for SmartLoadingButton
    }
  }

  // Loading simplificado
  if (authLoading || (session || user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" aria-label="Cargando"></div>
          <p className="text-gray-600">Accediendo...</p>
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
          <AccessibleForm
            title="Formulario de inicio de sesión"
            description="Ingresa tu email y contraseña para acceder"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                autoComplete="email"
                aria-describedby="email-error"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                aria-describedby="password-error"
              />
            </div>
            
            <SmartLoadingButton
              onClick={handleSubmit}
              className="w-full"
              loadingText="Iniciando sesión..."
              minLoadingTime={800}
            >
              Iniciar Sesión
            </SmartLoadingButton>
            
            <div className="text-center text-sm text-gray-600">
              <p>Atajos de teclado:</p>
              <p>Alt + M: Menú principal | Alt + S: Buscar</p>
            </div>
          </AccessibleForm>
        </CardContent>
      </Card>
    </div>
  )
}
