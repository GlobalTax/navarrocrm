
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

interface UserDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  onClose: () => void
}

export const UserDeleteDialog = ({ open, onOpenChange, user, onClose }: UserDeleteDialogProps) => {
  const { user: currentUser } = useApp()
  const queryClient = useQueryClient()
  const [confirmText, setConfirmText] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const expectedText = user?.email || ''

  const handleDelete = async () => {
    if (confirmText !== expectedText) {
      toast.error('El texto de confirmación no coincide')
      return
    }

    if (!reason.trim()) {
      toast.error('Por favor proporciona una razón para la eliminación')
      return
    }

    setLoading(true)
    try {
      // Soft delete - marcar como inactivo
      const { error } = await supabase
        .from('users')
        .update({
          is_active: false,
          deleted_at: new Date().toISOString(),
          deleted_by: currentUser?.id
        })
        .eq('id', user.id)

      if (error) throw error

      // Registrar en auditoría
      await supabase
        .from('user_audit_log')
        .insert({
          org_id: currentUser!.org_id,
          target_user_id: user.id,
          action_by: currentUser!.id,
          action_type: 'user_deleted',
          old_value: { is_active: true },
          new_value: { is_active: false },
          details: `Usuario desactivado. Razón: ${reason}`
        })

      // Cancelar invitaciones pendientes del usuario
      await supabase
        .from('user_invitations')
        .update({ status: 'cancelled' })
        .eq('invited_by', user.id)
        .eq('status', 'pending')

      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] })
      
      toast.success('Usuario desactivado correctamente')
      onClose()
      setConfirmText('')
      setReason('')
    } catch (error: any) {
      console.error('Error desactivando usuario:', error)
      toast.error('Error desactivando el usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setConfirmText('')
    setReason('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Desactivar Usuario
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 mb-1">
                  ¿Estás seguro de que quieres desactivar este usuario?
                </h4>
                <p className="text-sm text-red-700">
                  Esta acción desactivará a <strong>{user?.email}</strong> y:
                </p>
                <ul className="text-sm text-red-700 mt-2 list-disc list-inside space-y-1">
                  <li>El usuario no podrá acceder al sistema</li>
                  <li>Se cancelarán sus invitaciones pendientes</li>
                  <li>Sus datos se conservarán para auditoría</li>
                  <li>Podrás reactivar el usuario más tarde</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Razón de la desactivación *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explica por qué estás desactivando este usuario..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">
              Para confirmar, escribe <strong>{expectedText}</strong>
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={expectedText}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmText !== expectedText || !reason.trim() || loading}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {loading ? 'Desactivando...' : 'Desactivar Usuario'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
