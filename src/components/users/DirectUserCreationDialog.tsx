import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDirectUserCreation } from '@/hooks/useDirectUserCreation'
import { Copy, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface DirectUserCreationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

export const DirectUserCreationDialog = ({ 
  open, 
  onOpenChange, 
  onClose 
}: DirectUserCreationDialogProps) => {
  const { mutateAsync: createUser, isPending } = useDirectUserCreation()
  
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  
  const [credentials, setCredentials] = useState<{
    email: string
    password: string
    userId: string
  } | null>(null)
  
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !role) {
      toast.error('Por favor completa email y rol')
      return
    }

    try {
      const result = await createUser({ 
        email, 
        role, 
        firstName, 
        lastName 
      })
      
      setCredentials(result)
    } catch (error) {
      // El error ya se maneja en el hook
    }
  }

  const handleCopyCredentials = () => {
    if (!credentials) return
    
    const credentialsText = `Usuario: ${credentials.email}\nContraseña: ${credentials.password}`
    navigator.clipboard.writeText(credentialsText)
    toast.success('Credenciales copiadas al portapapeles')
  }

  const handleClose = () => {
    // Reset form
    setEmail('')
    setRole('')
    setFirstName('')
    setLastName('')
    setCredentials(null)
    setShowPassword(false)
    onClose()
  }

  const roles = [
    { value: 'partner', label: 'Partner' },
    { value: 'area_manager', label: 'Area Manager' },
    { value: 'senior', label: 'Senior' },
    { value: 'junior', label: 'Junior' },
    { value: 'finance', label: 'Finanzas' }
  ]

  // Si ya se crearon las credenciales, mostrar la pantalla de éxito
  if (credentials) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Usuario Creado Exitosamente
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-800 mb-3">
                Credenciales generadas:
              </p>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-green-700">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={credentials.email} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-green-700">Contraseña temporal</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      value={credentials.password} 
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
                <strong>⚠️ Importante:</strong> Copia estas credenciales antes de cerrar. 
                La contraseña no se volverá a mostrar por seguridad.
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
              <Button onClick={handleClose} className="flex-1">
                Finalizar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Formulario de creación
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Usuario Directamente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Juan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellidos</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Pérez"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol *</Label>
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

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 font-medium">
              🔐 Creación directa
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Se generará una contraseña temporal automáticamente. 
              El usuario podrá cambiarla en su primer acceso.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}