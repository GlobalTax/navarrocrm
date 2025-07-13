
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

  // Lógica de redirección mejorada con validaciones
  useEffect(() => {
    authLogger.debug('Auth state check', { 
      session: !!session, 
      user: !!user, 
      authLoading,
      from,
      userOrgId: user?.org_id,
      userId: user?.id
    })
    
    // Esperar a que termine la autenticación
    if (authLoading) {
      authLogger.debug('Still loading auth state, waiting...')
      return
    }

    // Verificar que tenemos una sesión válida Y datos de usuario completos
    if (session && user && user.id && user.org_id) {
      authLogger.info('User fully authenticated with complete data, redirecting', { 
        from,
        userId: user.id,
        orgId: user.org_id
      })
      
      // Añadir pequeño delay para evitar condiciones de carrera
      setTimeout(() => {
        announceRouteChange('Área principal')
        navigate(from, { replace: true })
      }, 100)
    } else if (session && user && (!user.id || !user.org_id)) {
      authLogger.warn('User session exists but incomplete user data', {
        hasSession: !!session,
        hasUser: !!user,
        hasUserId: !!user?.id,
        hasOrgId: !!user?.org_id
      })
      // En este caso, no redirigir automáticamente
    }
  }, [session, user, authLoading, navigate, from, announceRouteChange])

  const handleSubmit = async () => {
    console.log('🔥 [Login] handleSubmit iniciado', { 
      email: email.trim(), 
      passwordLength: password.length,
      hasPassword: !!password.trim() 
    })
    
    if (!email.trim() || !password.trim()) {
      console.log('❌ [Login] Validación fallida - campos vacíos')
      toast.error("Por favor, completa todos los campos")
      return
    }

    console.log('✅ [Login] Validación pasada, iniciando signIn...')

    try {
      authLogger.info('Login attempt started', { email })
      console.log('🚀 [Login] Llamando a signIn...', { email })
      
      // Llamar signIn y esperar la respuesta
      await signIn(email, password)
      
      console.log('✅ [Login] signIn completado sin errores')
      authLogger.info('Login successful, waiting for session update', { email })
      toast.success("¡Bienvenido! Has iniciado sesión correctamente")
      
      // No redirigir manualmente aquí - dejar que el useEffect lo maneje
      
    } catch (error: any) {
      console.error('💥 [Login] Error en handleSubmit:', error)
      authLogger.error('Login failed', { 
        error: error.message,
        email,
        timestamp: new Date().toISOString()
      })
      
      let errorMessage = "Error al iniciar sesión"
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Email o contraseña incorrectos"
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Por favor, confirma tu email"
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = "Demasiados intentos. Espera unos minutos"
      }
      
      console.log('📢 [Login] Mostrando error al usuario:', errorMessage)
      toast.error(errorMessage)
      
      // Limpiar campos en caso de error de credenciales
      if (error.message?.includes('Invalid login credentials')) {
        setPassword('')
      }
      
      throw error // Re-throw for SmartLoadingButton
    }
  }

  // Loading mejorado con más información
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" aria-label="Cargando"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si tenemos sesión y usuario completo, mostrar loading de redirección
  if (session && user && user.id && user.org_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" aria-label="Cargando"></div>
          <p className="text-gray-600">Accediendo al dashboard...</p>
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
              minLoadingTime={500}
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
