
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, UserPlus, Clock, AlertCircle, Check } from 'lucide-react'
import { useUserInvitations } from '@/hooks/useUserInvitations'
import { validateAndSanitizeEmail } from '@/lib/security'

interface EnhancedUserInviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

export const EnhancedUserInviteDialog = ({ open, onOpenChange, onClose }: EnhancedUserInviteDialogProps) => {
  const { sendInvitation, getRoleLabel } = useUserInvitations()
  
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    message: '',
    sendEmail: true,
    expiryDays: 7
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const roles = [
    { value: 'partner', label: 'Partner' },
    { value: 'area_manager', label: 'Area Manager' },
    { value: 'senior', label: 'Senior' },
    { value: 'junior', label: 'Junior' },
    { value: 'finance', label: 'Finanzas' }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else {
      const emailResult = validateAndSanitizeEmail(formData.email)
      if (!emailResult.isValid) {
        newErrors.email = emailResult.error || 'Email no válido'
      }
    }

    if (!formData.role) {
      newErrors.role = 'El rol es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      // Sanitizar email antes de enviar
      const emailResult = validateAndSanitizeEmail(formData.email)
      
      await sendInvitation.mutateAsync({
        email: emailResult.sanitizedEmail,
        role: formData.role,
        message: formData.message
      })
      
      // Reset form
      setFormData({
        email: '',
        role: '',
        message: '',
        sendEmail: true,
        expiryDays: 7
      })
      setErrors({})
      onClose()
    } catch (error) {
      // Error handled by the hook
    }
  }

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const rolePermissions = {
    partner: ['Acceso completo al sistema', 'Gestión de usuarios', 'Reportes avanzados'],
    area_manager: ['Gestión de casos', 'Asignación de tareas', 'Reportes de área'],
    senior: ['Crear casos y propuestas', 'Gestión de tiempo', 'Comunicación con clientes'],
    junior: ['Ejecutar tareas', 'Registrar tiempo', 'Ver casos asignados'],
    finance: ['Gestión de facturación', 'Reportes financieros', 'Control de pagos']
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invitar Nuevo Usuario
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información del Usuario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className={errors.email ? 'border-red-300' : ''}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol *</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger className={errors.role ? 'border-red-300' : ''}>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.role}
                  </p>
                )}
              </div>

              {/* Permisos del rol seleccionado */}
              {formData.role && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Permisos del rol {getRoleLabel(formData.role)}:
                  </h4>
                  <ul className="space-y-1">
                    {rolePermissions[formData.role as keyof typeof rolePermissions]?.map((permission, index) => (
                      <li key={index} className="text-sm text-blue-800 flex items-center gap-2">
                        <Check className="h-3 w-3" />
                        {permission}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mensaje personalizado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mensaje de Invitación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="message">Mensaje personalizado (opcional)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Añade un mensaje personalizado para incluir en el email de invitación..."
                  rows={3}
                />
                <p className="text-xs text-slate-500">
                  Este mensaje aparecerá en el email de invitación que reciba el usuario.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de envío */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuración de Invitación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Enviar email automáticamente</Label>
                  <p className="text-xs text-slate-500">
                    El usuario recibirá un email con el enlace de invitación
                  </p>
                </div>
                <Switch
                  checked={formData.sendEmail}
                  onCheckedChange={(checked) => handleInputChange('sendEmail', checked)}
                />
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>La invitación expirará en {formData.expiryDays} días</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 mb-1">
                  ¿Qué pasará después?
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Se creará una invitación en el sistema</li>
                  <li>• El usuario recibirá un email con un enlace seguro</li>
                  <li>• Podrá registrarse usando el enlace de invitación</li>
                  <li>• Tendrá acceso con el rol asignado automáticamente</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={sendInvitation.isPending}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {sendInvitation.isPending ? 'Enviando...' : 'Enviar Invitación'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
