import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Mail, Key, Link, Loader2, CheckCircle, XCircle } from 'lucide-react'

interface BulkSendAccessEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  users: any[]
  onComplete: () => void
}

export const BulkSendAccessEmailDialog = ({ open, onOpenChange, users, onComplete }: BulkSendAccessEmailDialogProps) => {
  const [mode, setMode] = useState<'credentials' | 'activation'>('activation')
  const [isSending, setIsSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{ sent: number; failed: number } | null>(null)

  const handleSend = async () => {
    setIsSending(true)
    setProgress(0)
    setResults(null)

    let sent = 0
    let failed = 0
    const currentUserId = (await supabase.auth.getUser()).data.user?.id

    for (let i = 0; i < users.length; i++) {
      // Throttle: esperar 600ms entre emails para no superar 2 req/s de Resend
      if (i > 0) await new Promise(r => setTimeout(r, 600))

      const user = users[i]
      try {
        if (mode === 'credentials') {
          const { data: regenData, error: regenError } = await supabase.functions.invoke('regenerate-user-password', {
            body: { userId: user.id }
          })
          if (regenError || !regenData?.password) throw new Error('Error regenerando')

          const { error } = await supabase.functions.invoke('send-welcome-email', {
            body: { mode: 'credentials', email: user.email, password: regenData.password, role: user.role, firstName: user.first_name }
          })
          if (error) throw error
        } else {
          const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          const { error: invError } = await supabase
            .from('user_invitations')
            .insert({ email: user.email, role: user.role, org_id: user.org_id, invited_by: currentUserId!, status: 'pending', token, expires_at: expiresAt })
          if (invError) throw invError

          const { error } = await supabase.functions.invoke('send-welcome-email', {
            body: { mode: 'activation', email: user.email, role: user.role, token, firstName: user.first_name }
          })
          if (error) throw error
        }
        sent++
      } catch {
        failed++
      }
      setProgress(Math.round(((i + 1) / users.length) * 100))
    }

    setResults({ sent, failed })
    setIsSending(false)
    if (sent > 0) toast.success(`${sent} email(s) enviado(s) correctamente`)
    if (failed > 0) toast.error(`${failed} email(s) fallido(s)`)
  }

  const handleClose = () => {
    setResults(null)
    setProgress(0)
    onOpenChange(false)
    if (results && results.sent > 0) onComplete()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Envío masivo de emails de acceso
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Se enviará un email de acceso a <strong>{users.length}</strong> usuario{users.length !== 1 ? 's' : ''}.
          </p>

          {!isSending && !results && (
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as any)} className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-[10px] border-[0.5px] border-border hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="credentials" id="bulk-credentials" className="mt-1" />
                <Label htmlFor="bulk-credentials" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-2 font-medium">
                    <Key className="h-4 w-4" />
                    Credenciales temporales
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Regenera contraseñas y las envía por email</p>
                </Label>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-[10px] border-[0.5px] border-border hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="activation" id="bulk-activation" className="mt-1" />
                <Label htmlFor="bulk-activation" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-2 font-medium">
                    <Link className="h-4 w-4" />
                    Enlace de activación
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Cada usuario establece su propia contraseña</p>
                </Label>
              </div>
            </RadioGroup>
          )}

          {isSending && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">{progress}% completado</p>
            </div>
          )}

          {results && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>{results.sent} enviado{results.sent !== 1 ? 's' : ''}</span>
              </div>
              {results.failed > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span>{results.failed} fallido{results.failed !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            {results ? (
              <Button onClick={handleClose} className="rounded-[10px]">Cerrar</Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleClose} disabled={isSending} className="border-[0.5px] border-black rounded-[10px]">
                  Cancelar
                </Button>
                <Button onClick={handleSend} disabled={isSending} className="rounded-[10px]">
                  {isSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                  {isSending ? 'Enviando...' : 'Enviar emails'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
