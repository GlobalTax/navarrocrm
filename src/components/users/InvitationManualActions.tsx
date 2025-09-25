import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Copy, 
  Send, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Link as LinkIcon,
  X
} from 'lucide-react'
import { useUserInvitations } from '@/hooks/useUserInvitations'
import { toast } from 'sonner'

interface InvitationManualActionsProps {
  invitation?: any
}

export function InvitationManualActions({ invitation }: InvitationManualActionsProps) {
  const [isResending, setIsResending] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const { resendInvitation, cancelInvitation } = useUserInvitations()

  const copyInvitationLink = () => {
    if (!invitation?.token) {
      toast.error('No hay token de invitación disponible')
      return
    }

    const invitationUrl = `${window.location.origin}/activate-account?token=${invitation.token}`
    navigator.clipboard.writeText(invitationUrl)
    toast.success('Enlace de invitación copiado al portapapeles')
  }

  const handleResendInvitation = async () => {
    if (!invitation?.id) {
      toast.error('ID de invitación no válido')
      return
    }

    setIsResending(true)
    try {
      await resendInvitation.mutateAsync(invitation.id)
      toast.success('Invitación reenviada correctamente')
    } catch (error: any) {
      console.error('Error reenviando invitación:', error)
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsResending(false)
    }
  }

  const handleCancelInvitation = async () => {
    if (!invitation?.id) {
      toast.error('ID de invitación no válido')
      return
    }

    setIsCancelling(true)
    try {
      await cancelInvitation.mutateAsync(invitation.id)
      toast.success('Invitación cancelada correctamente')
    } catch (error: any) {
      console.error('Error cancelando invitación:', error)
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsCancelling(false)
    }
  }

  if (!invitation) {
    return (
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Acciones Manuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Selecciona una invitación para ver las acciones disponibles
          </p>
        </CardContent>
      </Card>
    )
  }

  const isExpired = new Date(invitation.expires_at) < new Date()
  const isPending = invitation.status === 'pending' && !isExpired
  const isCancellable = invitation.status === 'pending'

  return (
    <Card className="border-0.5 border-black rounded-[10px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Acciones Manuales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Invitación seleccionada</Label>
          <div className="flex items-center gap-2">
            <Input
              value={invitation.email}
              readOnly
              className="border-0.5 border-gray-300 rounded-[10px] bg-gray-50"
            />
            <Badge className={`text-xs font-medium border ${
              isPending ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
              invitation.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
              invitation.status === 'cancelled' ? 'bg-gray-50 text-gray-700 border-gray-200' :
              'bg-red-50 text-red-700 border-red-200'
            }`}>
              {isPending ? 'Pendiente' : 
               invitation.status === 'accepted' ? 'Aceptada' :
               invitation.status === 'cancelled' ? 'Cancelada' :
               isExpired ? 'Expirada' : invitation.status}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Enlace de invitación</Label>
          <div className="flex gap-2">
            <Input
              value={`${window.location.origin}/activate-account?token=${invitation.token}`}
              readOnly
              className="border-0.5 border-gray-300 rounded-[10px] bg-gray-50 text-xs"
            />
            <Button
              onClick={copyInvitationLink}
              variant="outline"
              size="sm"
              className="border-0.5 border-black rounded-[10px]"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Acciones disponibles</Label>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={copyInvitationLink}
              variant="outline"
              className="border-0.5 border-black rounded-[10px] flex-1 min-w-0"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Enlace
            </Button>
            
            {isPending && (
              <Button
                onClick={handleResendInvitation}
                disabled={isResending}
                className="border-0.5 border-black rounded-[10px] hover-lift flex-1 min-w-0"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Reenviar
                  </>
                )}
              </Button>
            )}

            {isCancellable && (
              <Button
                onClick={handleCancelInvitation}
                disabled={isCancelling}
                variant="destructive"
                className="border-0.5 border-red-500 rounded-[10px] flex-1 min-w-0"
              >
                {isCancelling ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {isExpired && (
          <Alert className="border-0.5 border-red-300 rounded-[10px]">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta invitación ha expirado. Puedes copiar el enlace y compartirlo manualmente, 
              o crear una nueva invitación.
            </AlertDescription>
          </Alert>
        )}

        {invitation.status === 'accepted' && (
          <Alert className="border-0.5 border-green-300 rounded-[10px]">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Esta invitación ya ha sido aceptada. El usuario debería tener acceso al sistema.
            </AlertDescription>
          </Alert>
        )}

        {invitation.status === 'cancelled' && (
          <Alert className="border-0.5 border-gray-300 rounded-[10px]">
            <X className="h-4 w-4" />
            <AlertDescription>
              Esta invitación ha sido cancelada. Puedes crear una nueva invitación para este usuario.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}