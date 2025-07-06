import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Send, Save, X, Paperclip } from 'lucide-react'
import { toast } from 'sonner'

export function EmailCompose() {
  const navigate = useNavigate()
  const [emailData, setEmailData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: ''
  })
  const [isSending, setIsSending] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSend = async () => {
    if (!emailData.to || !emailData.subject) {
      toast.error('Faltan campos obligatorios', {
        description: 'Debes completar el destinatario y el asunto'
      })
      return
    }

    setIsSending(true)
    try {
      // TODO: Implementar envío de email
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simular envío
      toast.success('Email enviado correctamente')
      navigate('/emails/sent')
    } catch (error) {
      toast.error('Error al enviar email')
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      // TODO: Implementar guardado de borrador
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular guardado
      toast.success('Borrador guardado')
    } catch (error) {
      toast.error('Error al guardar borrador')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <StandardPageHeader
        title="Redactar Email"
        description="Crear un nuevo mensaje de correo electrónico"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={isSending}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {isSending ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        }
      />

      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle>Nuevo Mensaje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Destinatarios */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Para <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="destinatario@ejemplo.com"
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                className="border-0.5 border-black rounded-[10px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                CC
              </label>
              <Input
                placeholder="copia@ejemplo.com"
                value={emailData.cc}
                onChange={(e) => setEmailData({ ...emailData, cc: e.target.value })}
                className="border-0.5 border-black rounded-[10px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                CCO
              </label>
              <Input
                placeholder="copia-oculta@ejemplo.com"
                value={emailData.bcc}
                onChange={(e) => setEmailData({ ...emailData, bcc: e.target.value })}
                className="border-0.5 border-black rounded-[10px]"
              />
            </div>
          </div>

          {/* Asunto */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Asunto <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Asunto del mensaje"
              value={emailData.subject}
              onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              className="border-0.5 border-black rounded-[10px]"
            />
          </div>

          {/* Adjuntos */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Paperclip className="h-4 w-4" />
              Adjuntar archivo
            </Button>
            {/* TODO: Mostrar lista de adjuntos */}
          </div>

          {/* Cuerpo del mensaje */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Mensaje
            </label>
            <Textarea
              placeholder="Escribe tu mensaje aquí..."
              value={emailData.body}
              onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
              className="min-h-[300px] border-0.5 border-black rounded-[10px]"
            />
          </div>

          {/* Información adicional */}
          <div className="flex gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">
              Enviado desde CRM
            </Badge>
            <Badge variant="outline">
              Rastreo habilitado
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}