import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Mail, Eye, Send } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { sanitizeEmailHTML } from '@/lib/security'

interface EmailInvitationPreviewProps {
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation?: string
  eventDescription?: string
  attendees: string[]
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
}

export const EmailInvitationPreview = ({
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  eventDescription,
  attendees,
  isEnabled,
  onToggle
}: EmailInvitationPreviewProps) => {
  const [previewOpen, setPreviewOpen] = useState(false)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const generateEmailPreview = () => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0;">Invitación a reunión</h2>
        </div>
        
        <div style="padding: 20px;">
          <h3 style="color: #0061FF; margin-bottom: 16px;">${eventTitle}</h3>
          
          <div style="background: #f1f5f9; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 8px 0;"><strong>📅 Fecha:</strong> ${formatDate(eventDate)}</p>
            <p style="margin: 8px 0;"><strong>🕐 Hora:</strong> ${eventTime}</p>
            ${eventLocation ? `<p style="margin: 8px 0;"><strong>📍 Ubicación:</strong> ${eventLocation}</p>` : ''}
          </div>
          
          ${eventDescription ? `
            <div style="margin-bottom: 20px;">
              <h4 style="color: #333;">Descripción:</h4>
              <p style="color: #666; line-height: 1.6;">${eventDescription}</p>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #0061FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Confirmar Asistencia
            </a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
            <p style="color: #666; font-size: 14px; text-align: center;">
              Este evento se ha añadido automáticamente a tu calendario de Outlook.
            </p>
          </div>
        </div>
      </div>
    `
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Invitaciones por Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="email-invitations"
              checked={isEnabled}
              onChange={(e) => onToggle(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="email-invitations" className="text-sm font-medium">
              Enviar invitaciones automáticamente
            </label>
          </div>
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? "Activo" : "Inactivo"}
          </Badge>
        </div>

        {isEnabled && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Participantes ({attendees.length})
                </span>
                <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Email
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Preview de Invitación</DialogTitle>
                    </DialogHeader>
                    <div 
                      className="border rounded-lg p-4 bg-white"
                      dangerouslySetInnerHTML={{ 
                        __html: sanitizeEmailHTML(generateEmailPreview())
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                {attendees.map((email, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="text-sm">{email}</span>
                    <Badge variant="outline" className="text-xs">
                      <Send className="h-3 w-3 mr-1" />
                      Pendiente
                    </Badge>
                  </div>
                ))}
              </div>

              {attendees.length === 0 && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    Añade participantes para enviar invitaciones automáticamente
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
