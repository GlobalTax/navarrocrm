import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { SmartLoadingButton } from '@/components/common/SmartLoadingButton'
import { useAccessibility } from '@/hooks/useAccessibility'
import { authLogger } from '@/utils/logging'
import { supabase } from '@/integrations/supabase/client'

export default function ActivateAccount() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [invitationData, setInvitationData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const { activateAccount } = useApp()
  const navigate = useNavigate()
  const { announceRouteChange } = useAccessibility()

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      toast.error('Token de invitación no válido')
      navigate('/login')
      return
    }

    // Verificar el token de invitación
    const verifyToken = async () => {
      try {
        const { data, error } = await supabase
          .from('user_invitations')
          .select('email, role, expires_at, status')
          .eq('token', token)
          .eq('status', 'pending')
          .single()

        if (error || !data) {
          toast.error('Enlace de invitación inválido o expirado')
          navigate('/login')
          return
        }

        // Verificar expiración
        if (new Date(data.expires_at) < new Date()) {
          toast.error('El enlace de invitación ha expirado')
          navigate('/login')
          return
        }

        setInvitationData(data)
        setLoading(false)
      } catch (error) {
        authLogger.error('Error verifying invitation token', { error })
        toast.error('Error al verificar la invitación')
        navigate('/login')
      }
    }

    verifyToken()
  }, [token, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password.trim() || !confirmPassword.trim()) {
      toast.error("Por favor, completa todos los campos")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    try {
      authLogger.info('Account activation started', { email: invitationData.email })
      
      await activateAccount(token!, password)
      
      toast.success("¡Cuenta activada correctamente! Has iniciado sesión")
      announceRouteChange('Dashboard')
      navigate('/')
      
    } catch (error: any) {
      authLogger.error('Account activation failed', { 
        error: error.message,
        email: invitationData?.email
      })
      
      let errorMessage = "Error al activar la cuenta"
      
      if (error.message?.includes('User already registered')) {
        errorMessage = "Ya existe una cuenta con este email"
      } else if (error.message?.includes('Password')) {
        errorMessage = "La contraseña no cumple los requisitos"
      } else if (error.message?.includes('Token')) {
        errorMessage = "El enlace de invitación no es válido"
      }
      
      toast.error(errorMessage)
      throw error // Re-throw for SmartLoadingButton
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando invitación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary-600">Activar Cuenta</CardTitle>
          <CardDescription>
            Configura tu contraseña para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Email:</strong> {invitationData?.email}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Rol:</strong> {invitationData?.role}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={6}
              />
              <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            
            <SmartLoadingButton
              onClick={async () => {
                if (!password.trim() || !confirmPassword.trim()) {
                  toast.error("Por favor, completa todos los campos")
                  throw new Error("Campos requeridos")
                }
                if (password !== confirmPassword) {
                  toast.error("Las contraseñas no coinciden")
                  throw new Error("Contraseñas no coinciden")
                }
                if (password.length < 6) {
                  toast.error("La contraseña debe tener al menos 6 caracteres")
                  throw new Error("Contraseña muy corta")
                }
                await activateAccount(token!, password)
                toast.success("¡Cuenta activada correctamente!")
              }}
              className="w-full"
              loadingText="Activando cuenta..."
              minLoadingTime={1000}
            >
              Activar Cuenta
            </SmartLoadingButton>
          </form>

          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/login')}
              className="text-sm"
            >
              Volver al inicio de sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}