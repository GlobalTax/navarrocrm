import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Send, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useSimpleOutlookConnection } from '@/hooks/useSimpleOutlookConnection'
import { toast } from 'sonner'

export function EmailCompose() {
  const { connectionStatus, isConnected } = useSimpleOutlookConnection()
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    body: ''
  })
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (connectionStatus !== 'connected') {
      toast.error('Debe conectar con Outlook primero')
      return
    }

    if (!formData.to || !formData.subject || !formData.body) {
      toast.error('Todos los campos son obligatorios')
      return
    }

    setIsSending(true)
    
    try {
      console.log('📧 Enviando email con Outlook:', formData)
      
      const { data, error } = await supabase.functions.invoke('outlook-email-send', {
        body: {
          to: formData.to,
          subject: formData.subject,
          body: formData.body,
          save_to_sent: true
        }
      })
      
      if (error) {
        throw error
      }
      
      toast.success('Email enviado correctamente')
      setFormData({ to: '', subject: '', body: '' })
    } catch (error: any) {
      console.error('❌ Error enviando email:', error)
      const errorMessage = error.message || 'Error enviando el email'
      if (errorMessage.includes('401') || errorMessage.includes('authorization')) {
        toast.error('Su sesión de Outlook ha expirado. Reconecte su cuenta.')
      } else {
        toast.error(`Error enviando email: ${errorMessage}`)
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <StandardPageHeader
        title="Redactar Email"
        description="Envía emails directamente desde el CRM"
      />

      {connectionStatus !== 'connected' && (
        <Alert className="border-0.5 border-black rounded-[10px]">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Debe conectar su cuenta de Outlook primero para poder enviar emails.
            Vaya a la configuración de emails para conectar su cuenta.
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Nuevo Mensaje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="to">Para</Label>
              <Input
                id="to"
                type="email"
                value={formData.to}
                onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                placeholder="destinatario@ejemplo.com"
                className="border-0.5 border-black rounded-[10px]"
                disabled={connectionStatus !== 'connected'}
              />
            </div>

            <div>
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Asunto del email"
                className="border-0.5 border-black rounded-[10px]"
                disabled={connectionStatus !== 'connected'}
              />
            </div>

            <div>
              <Label htmlFor="body">Mensaje</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Escriba su mensaje aquí..."
                rows={10}
                className="border-0.5 border-black rounded-[10px]"
                disabled={connectionStatus !== 'connected'}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSending || connectionStatus !== 'connected'}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isSending ? 'Enviando...' : 'Enviar Email'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}