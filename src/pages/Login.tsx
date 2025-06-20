
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useSystemSetup } from '@/hooks/useSystemSetup'
import { SystemDiagnostics } from '@/components/SystemDiagnostics'
import { SecurityVerification } from '@/components/SecurityVerification'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, Settings, Shield, Wifi, WifiOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [showSecurity, setShowSecurity] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { isSetup, loading: setupLoading, error: setupError } = useSystemSetup()

  const from = location.state?.from?.pathname || '/dashboard'

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Redirigir al setup si el sistema no está configurado
  useEffect(() => {
    console.log('🔍 Verificando redirección:', { setupLoading, isSetup, setupError })
    if (!setupLoading && isSetup === false && !setupError) {
      console.log('↪️ Redirigiendo al setup porque el sistema no está configurado')
      navigate('/setup', { replace: true })
    }
  }, [isSetup, setupLoading, setupError, navigate])

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

    if (!isOnline) {
      toast({
        title: "Sin conexión",
        description: "Verifica tu conexión a internet e intenta de nuevo",
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
      } else if (error.message?.includes('Too many requests') || error.message?.includes('429')) {
        errorMessage = "Demasiados intentos. Intenta de nuevo en unos minutos"
      } else if (error.message?.includes('fetch')) {
        errorMessage = "Error de conexión. Verifica tu internet e intenta de nuevo"
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
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Verificando configuración del sistema...</p>
          {!isOnline && (
            <div className="flex items-center justify-center gap-2 text-red-600 text-sm">
              <WifiOff className="h-4 w-4" />
              <span>Sin conexión a internet</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // No mostrar login si el sistema no está configurado (se redirigirá al setup)
  if (isSetup === false && !setupError) {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* Indicador de conexión */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
          isOnline 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          {isOnline ? 'Conectado' : 'Sin conexión'}
        </div>
      </div>

      <Card className="w-full max-w-md mb-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary-600">CRM Legal</CardTitle>
          <CardDescription>
            Inicia sesión en tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mostrar error de setup si existe */}
          {setupError && (
            <Alert className="mb-4">
              <AlertDescription>
                {setupError}
              </AlertDescription>
            </Alert>
          )}

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
                disabled={loading || !isOnline}
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
                disabled={loading || !isOnline}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email.trim() || !password.trim() || !isOnline}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>¿Primera vez? El sistema te guiará en la configuración inicial.</p>
          </div>
        </CardContent>
      </Card>

      {/* Verificación de Seguridad */}
      <Collapsible open={showSecurity} onOpenChange={setShowSecurity} className="mb-4">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="mb-4">
            <Shield className="h-4 w-4 mr-2" />
            Verificación de Seguridad
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SecurityVerification />
        </CollapsibleContent>
      </Collapsible>

      {/* Diagnósticos del Sistema */}
      <Collapsible open={showDiagnostics} onOpenChange={setShowDiagnostics}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="mb-4">
            <Settings className="h-4 w-4 mr-2" />
            Diagnósticos del Sistema
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SystemDiagnostics />
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
