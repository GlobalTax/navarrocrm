
import { useState, useRef } from 'react'
import DOMPurify from 'dompurify'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Eye, Send, FileText, Euro, Loader2, Mail } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface ProposalEmailPreviewProps {
  proposalTitle: string
  clientName: string
  totalAmount: number
  currency: string
  validUntil?: Date
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
  // Nuevas props para envío real
  proposalId?: string
  clientEmail?: string
  onSent?: () => void
}

export const ProposalEmailPreview = ({
  proposalTitle,
  clientName,
  totalAmount,
  currency,
  validUntil,
  isEnabled,
  onToggle,
  proposalId,
  clientEmail,
  onSent
}: ProposalEmailPreviewProps) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(amount)
  }

  const generateEmailPreview = () => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0;">Nueva Propuesta Comercial</h2>
        </div>
        
        <div style="padding: 20px;">
          <p style="margin-bottom: 16px;">Estimado/a ${clientName},</p>
          
          <p style="margin-bottom: 20px; line-height: 1.6;">
            Nos complace presentarle nuestra propuesta comercial para <strong>${proposalTitle}</strong>.
          </p>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <h3 style="color: #0061FF; margin: 0 0 16px 0;">Resumen de la Propuesta</h3>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 18px; color: #333;">Importe Total:</span>
              <span style="font-size: 24px; font-weight: bold; color: #0061FF;">${formatAmount(totalAmount)}</span>
            </div>
            ${validUntil ? `
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
                <span style="color: #666; font-size: 14px;">Válida hasta: ${validUntil.toLocaleDateString('es-ES')}</span>
              </div>
            ` : ''}
          </div>
          
          <p style="margin: 20px 0; line-height: 1.6;">
            Hemos preparado esta propuesta cuidadosamente teniendo en cuenta sus necesidades específicas. 
            Incluye todos los servicios detallados y nuestras tarifas competitivas.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #0061FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 12px;">
              Ver Propuesta Completa
            </a>
            <a href="#" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Aceptar Propuesta
            </a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
            <p style="color: #666; line-height: 1.6; margin-bottom: 16px;">
              Si tiene alguna pregunta o necesita aclaraciones adicionales, no dude en contactarnos. 
              Estamos aquí para ayudarle.
            </p>
            
            <p style="color: #333; margin-bottom: 8px;">Saludos cordiales,</p>
            <p style="color: #333; font-weight: 500;">El equipo de [Nombre del Despacho]</p>
          </div>
        </div>
      </div>
    `
  }

  const handleSendEmail = async () => {
    if (!clientEmail || !proposalId) {
      toast.error('Falta el email del cliente o el ID de la propuesta')
      return
    }

    setIsSending(true)
    try {
      const htmlContent = generateEmailPreview()
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: clientEmail,
          subject: `Propuesta Comercial: ${proposalTitle}`,
          html: htmlContent
        }
      })

      if (error) throw error
      if (data && !data.success) throw new Error(data.error || 'Error desconocido al enviar')

      toast.success(`Email enviado correctamente a ${clientEmail}`)
      setConfirmOpen(false)
      onSent?.()
    } catch (error: any) {
      console.error('Error sending proposal email:', error)
      toast.error(`Error al enviar email: ${error.message}`)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Envío de Propuesta por Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto-send-proposal"
              checked={isEnabled}
              onChange={(e) => onToggle(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="auto-send-proposal" className="text-sm font-medium">
              Enviar propuesta automáticamente por email
            </label>
          </div>
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? "Activo" : "Inactivo"}
          </Badge>
        </div>

        {isEnabled && (
          <>
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{proposalTitle}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-chart-2" />
                  <span className="text-sm text-muted-foreground">{formatAmount(totalAmount)}</span>
                </div>
                {clientEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{clientEmail}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Preview de Email de Propuesta</DialogTitle>
                    </DialogHeader>
                    <div 
                      className="border rounded-lg p-4 bg-white"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generateEmailPreview()) }}
                    />
                  </DialogContent>
                </Dialog>

                {clientEmail && proposalId && (
                  <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" disabled={isSending}>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Email
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmar envío de propuesta</DialogTitle>
                        <DialogDescription>
                          Se enviará la propuesta comercial al siguiente destinatario:
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4 space-y-3">
                        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{clientEmail}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{proposalTitle}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Euro className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{formatAmount(totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isSending}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSendEmail} disabled={isSending}>
                          {isSending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Confirmar Envío
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
