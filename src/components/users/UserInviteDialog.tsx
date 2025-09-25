
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUserInvitations } from '@/hooks/useUserInvitations'
import { toast } from 'sonner'

interface UserInviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

export const UserInviteDialog = ({ open, onOpenChange, onClose }: UserInviteDialogProps) => {
  const { sendInvitation } = useUserInvitations()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !role) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    setLoading(true)
    try {
      await sendInvitation.mutateAsync({ email, role, message })
      
      // Resetear formulario
      setEmail('')
      setRole('')
      setMessage('')
      onClose()
    } catch (error: any) {
      console.error('Error:', error)
      // El error ya se maneja en el hook, no mostramos toast aquí
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'partner', label: 'Partner' },
    { value: 'area_manager', label: 'Area Manager' },
    { value: 'senior', label: 'Senior' },
    { value: 'junior', label: 'Junior' },
    { value: 'finance', label: 'Finanzas' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invitar Usuario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje personalizado (opcional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Añade un mensaje personalizado para la invitación..."
              rows={3}
            />
          </div>

          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-700 font-medium">
              🔗 Modo aplicación interna
            </p>
            <p className="text-xs text-amber-600 mt-1">
              La invitación se creará sin enviar email automático. Deberás copiar y compartir el enlace manualmente desde la tabla de invitaciones.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Invitación'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
