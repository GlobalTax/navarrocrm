import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Eye, Send, FileText, Euro } from 'lucide-react'
import { sanitizeEmailHTML } from '@/lib/security'

interface ProposalEmailPreviewProps {
  proposalTitle: string
  clientName: string
  totalAmount: number
  currency: string
  validUntil?: Date
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
}

export const ProposalEmailPreview = ({
  proposalTitle,
  clientName,
  totalAmount,
  currency,
  validUntil,
  isEnabled,
  onToggle
}: ProposalEmailPreviewProps) => {
  const [previewOpen, setPreviewOpen] = useState(false)

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

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Envío Automático de Propuesta
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
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{proposalTitle}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">{formatAmount(totalAmount)}</span>
                </div>
              </div>
              <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Preview de Email de Propuesta</DialogTitle>
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
