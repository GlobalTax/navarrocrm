import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Download, 
  Send, 
  Edit, 
  Eye, 
  EyeOff, 
  FileText, 
  Clock,
  User,
  MessageSquare
} from 'lucide-react'
import { toast } from 'sonner'
import { useAbortController } from '@/hooks/performance'

interface DocumentPreviewProps {
  content: string
  title: string
  templateName: string
  variables: Record<string, any>
  onEdit: () => void
  onGenerate: () => void
  isGenerating: boolean
  canEdit?: boolean
}

export const DocumentPreview = ({
  content,
  title,
  templateName,
  variables,
  onEdit,
  onGenerate,
  isGenerating,
  canEdit = true
}: DocumentPreviewProps) => {
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted')
  
  const wordCount = content.split(' ').filter(word => word.length > 0).length
  const charCount = content.length
  const estimatedReadTime = Math.ceil(wordCount / 200) // 200 words per minute

  const { getController } = useAbortController()
  
  const handleDownloadPDF = async () => {
    try {
      const controller = getController()
      const response = await fetch('/functions/v1/generate-document-pdf', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          title,
          templateName
        })
      })

      if (!response.ok) {
        throw new Error('Error generando PDF')
      }

      const data = await response.json()
      
      // Create a new window with the HTML content for printing/saving as PDF
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(data.html)
        printWindow.document.close()
        setTimeout(() => {
          printWindow.print()
        }, 100)
      }
      
      toast.success('PDF preparado para descarga')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast.error('Error al generar PDF')
    }
  }

  const handleSendEmail = async () => {
    try {
      const email = prompt('Ingrese el email de destino:')
      if (!email) return

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error('Email inválido')
        return
      }

      const controller = getController()
      const response = await fetch('/functions/v1/send-document-email', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: `📄 ${title}`,
          content,
          title,
          templateName
        })
      })

      if (!response.ok) {
        throw new Error('Error enviando email')
      }

      toast.success(`Documento enviado exitosamente a ${email}`)
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error('Error al enviar email')
    }
  }

  const formatContent = (text: string) => {
    // Simple formatting for better preview
    return text
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^\s*/, '<p>')
      .replace(/\s*$/, '</p>')
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Vista Previa del Documento
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{templateName}</Badge>
              <Separator orientation="vertical" className="h-4" />
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {wordCount} palabras
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{estimatedReadTime} min lectura
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'formatted' ? 'raw' : 'formatted')}
            >
              {viewMode === 'formatted' ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Ver Código
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Formato
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleSendEmail}>
              <Send className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Document Info */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <h3 className="font-medium text-sm">Información del Documento</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Título:</span>
              <p className="font-medium">{title}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Caracteres:</span>
              <p className="font-medium">{charCount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto p-6">
            {viewMode === 'formatted' ? (
              <div 
                className="prose prose-sm max-w-none font-serif leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatContent(content) }}
              />
            ) : (
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">
                {content}
              </pre>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          {canEdit && (
            <Button variant="outline" onClick={onEdit} className="gap-2">
              <Edit className="h-4 w-4" />
              Volver al Formulario
            </Button>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={onGenerate} 
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Generando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generar Documento
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}