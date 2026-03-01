import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Mail, Key, Link, Loader2 } from 'lucide-react'

interface SendAccessEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
}

export const SendAccessEmailDialog = ({ open, onOpenChange, user }: SendAccessEmailDialogProps) => {
  const [mode, setMode] = useState<'credentials' | 'activation'>('activation')
  const [isSending, setIsSending] = useState(false)

  if (!user) return null

  const handleSend = async () => {
    setIsSending(true)
    try {
      if (mode === 'credentials') {
        // Step 1: Regenerate password
        const { data: regenData, error: regenError } = await supabase.functions.invoke('regenerate-user-password', {
          body: { userId: user.id }
        })
        if (regenError || !regenData?.password) {
          throw new Error(regenData?.error || regenError?.message || 'Error regenerando contraseña')
        }

        // Step 2: Send credentials email
        const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
          body: {
            mode: 'credentials',
            email: user.email,
            password: regenData.password,
            role: user.role,
            firstName: user.first_name
          }
        })
        if (emailError) throw emailError
        toast.success('Credenciales regeneradas y enviadas por email')

      } else {
        // Activation mode: create invitation token and send
        const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        const currentUserId = (await supabase.auth.getUser()).data.user?.id

        const { error: invError } = await supabase
          .from('user_invitations')
          .insert({
            email: user.email,
            role: user.role,
            org_id: user.org_id,
            invited_by: currentUserId!,
            status: 'pending',
            token,
            expires_at: expiresAt
          })

        if (invError) throw invError

        const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
          body: {
            mode: 'activation',
            email: user.email,
            role: user.role,
            token,
            firstName: user.first_name
          }
        })
        if (emailError) throw emailError
        toast.success('Email con enlace de activación enviado')
      }

      onOpenChange(false)
    } catch (err: any) {
      console.error('Error sending access email:', err)
      toast.error(err.message || 'Error enviando el email')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Enviar email de acceso
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-[10px] border-[0.5px] border-border">
            <p className="text-sm">
              <strong>{user.first_name} {user.last_name}</strong>
              <br />
              <span className="text-muted-foreground">{user.email}</span>
            </p>
          </div>

          <RadioGroup value={mode} onValueChange={(v) => setMode(v as any)} className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-[10px] border-[0.5px] border-border hover:bg-muted/30 transition-colors">
              <RadioGroupItem value="credentials" id="credentials" className="mt-1" />
              <Label htmlFor="credentials" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2 font-medium">
                  <Key className="h-4 w-4" />
                  Enviar credenciales
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Regenera la contraseña y envía email con usuario + contraseña temporal
                </p>
              </Label>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-[10px] border-[0.5px] border-border hover:bg-muted/30 transition-colors">
              <RadioGroupItem value="activation" id="activation" className="mt-1" />
              <Label htmlFor="activation" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2 font-medium">
                  <Link className="h-4 w-4" />
                  Enviar enlace de activación
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  El usuario recibe un enlace para establecer su propia contraseña
                </p>
              </Label>
            </div>
          </RadioGroup>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[0.5px] border-black rounded-[10px]">
              Cancelar
            </Button>
            <Button onClick={handleSend} disabled={isSending} className="rounded-[10px]">
              {isSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
              {isSending ? 'Enviando...' : 'Enviar email'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
