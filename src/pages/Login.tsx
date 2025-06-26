
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { session, user, signIn, authLoading } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Control de redirección
  const redirectCheckedRef = useRef(false)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  const from = location.state?.from?.pathname || '/dashboard'

  // Resetear estado cuando cambia el usuario
  useEffect(() => {
    redirectCheckedRef.current = false
    setShouldRedirect(false)
  }, [user?.id])

  // Redirección controlada para usuarios autenticados
  useEffect(() => {
    if (authLoading) return

    if ((session || user) && !redirectCheckedRef.current) {
      console.log('🔐 [Login] Usuario autenticado detectado, preparando redirección a:', from)
      redirectCheckedRef.current = true
      
      setTimeout(() => {
        setShouldRedirect(true)
      }, 100)
    }
  }, [session, user, authLoading, from])

  // Ejecutar redirección
  useEffect(() => {
    if (shouldRedirect && (session || user)) {
      console.log('🔐 [Login] Ejecutando redirección')
      navigate(from, { replace: true })
    }
  }, [shouldRedirect, session, user, navigate, from])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim()) {
      toast.error("Por favor, completa todos los campos")
      return
    }

    setLoading(true)

    try {
      await signIn(email, password)
      toast.success("¡Bienvenido! Has iniciado sesión correctamente")
    } catch (error: any) {
      console.error('❌ [Login] Error:', error)
      
      let errorMessage = "Error al iniciar sesión"
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Email o contraseña incorrectos"
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Por favor, confirma tu email"
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Loading simplificado
  if (authLoading || shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            {shouldRedirect ? 'Accediendo...' : 'Verificando autenticación...'}
          </p>
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
        </CardContent>
      </Card>
    </div>
  )
}
