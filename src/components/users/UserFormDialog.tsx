import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { useRegeneratePassword } from '@/hooks/useRegeneratePassword'
import { Copy, Eye, EyeOff, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: any
  onClose: () => void
}

export const UserFormDialog = ({ open, onOpenChange, user, onClose }: UserFormDialogProps) => {
  const { user: currentUser } = useApp()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { 
    regeneratePassword, 
    isRegenerating, 
    regeneratedCredentials, 
    clearCredentials 
  } = useRegeneratePassword()

  useEffect(() => {
    if (user) {
      setEmail(user.email || '')
      setRole(user.role || '')
    } else {
      setEmail('')
      setRole('')
    }
    // Limpiar credenciales al cambiar de usuario
    clearCredentials()
  }, [user, clearCredentials])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !role) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    try {
      if (user) {
        // Actualizar usuario existente
        const { error } = await supabase
          .from('users')
          .update({ role })
          .eq('id', user.id)

        if (error) throw error
        toast.success('Usuario actualizado correctamente')
      }
      
      onClose()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  const handleRegeneratePassword = () => {
    if (!user?.id) return
    regeneratePassword({ userId: user.id })
  }

  const handleCopyCredentials = () => {
    if (!regeneratedCredentials) return
    
    const credentialsText = `Usuario: ${regeneratedCredentials.email}\nNueva contraseña: ${regeneratedCredentials.password}`
    navigator.clipboard.writeText(credentialsText)
    toast.success('Credenciales copiadas al portapapeles')
  }

  const handleCloseDialog = () => {
    clearCredentials()
    onClose()
  }

  const roles = [
    { value: 'partner', label: 'Partner' },
    { value: 'area_manager', label: 'Area Manager' },
    { value: 'senior', label: 'Senior' },
    { value: 'junior', label: 'Junior' },
    { value: 'finance', label: 'Finanzas' }
  ]

  // Si se han regenerado credenciales, mostrar pantalla de éxito
  if (regeneratedCredentials) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Contraseña Regenerada
            </DialogTitle>
            <DialogDescription>
              Se ha generado exitosamente una nueva contraseña temporal para el usuario.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-800 mb-3">
                Nueva contraseña generada para {regeneratedCredentials.email}:
              </p>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-green-700">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={regeneratedCredentials.email} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-green-700">Nueva contraseña</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      value={regeneratedCredentials.password} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-9 w-9"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-700">
                <strong>⚠️ Importante:</strong> Esta contraseña se guarda por 24 horas. 
                El usuario debe cambiarla en su próximo acceso.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleCopyCredentials}
                variant="outline"
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Credenciales
              </Button>
              <Button onClick={handleCloseDialog} className="flex-1">
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              disabled={!!user} // Email no editable para usuarios existentes
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((roleOption) => (
                  <SelectItem key={roleOption.value} value={roleOption.value}>
                    {roleOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sección de regenerar contraseña - solo para usuarios existentes */}
          {user && (
            <>
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Gestión de Contraseña</Label>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-700 font-medium">
                        Regenerar contraseña
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Se generará una nueva contraseña temporal que será válida por 24 horas.
                        El usuario deberá cambiarla en su próximo acceso.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRegeneratePassword}
                  disabled={isRegenerating}
                  className="w-full"
                >
                  {isRegenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerar Contraseña
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : user ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}