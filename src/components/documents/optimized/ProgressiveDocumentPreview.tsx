
import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Download, 
  Send, 
  Edit, 
  Eye, 
  EyeOff, 
  FileText, 
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useProgressiveSanitization } from '@/hooks/documents/useProgressiveSanitization'
import { useDocumentMemory } from '@/hooks/documents/useDocumentMemory'
import { useIntersectionObserver } from '@/hooks/performance/useIntersectionObserver'
import { toast } from 'sonner'

interface ProgressiveDocumentPreviewProps {
  content: string
  title: string
  templateName: string
  variables: Record<string, any>
  onEdit: () => void
  onGenerate: () => void
  isGenerating: boolean
  canEdit?: boolean
  maxPreviewSize?: number
}

export const ProgressiveDocumentPreview = ({
  content,
  title,
  templateName,
  variables,
  onEdit,
  onGenerate,
  isGenerating,
  canEdit = true,
  maxPreviewSize = 100000 // 100KB preview limit
}: ProgressiveDocumentPreviewProps) => {
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted')
  const [showFullContent, setShowFullContent] = useState(false)
  const [previewContent, setPreviewContent] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)
  
  const { sanitizeProgressively, isProcessing: isSanitizing, progress: sanitizationProgress } = useProgressiveSanitization({
    chunkSize: 25000,
    maxProcessingTime: 3000,
    preserveFormatting: true
  })

  const { trackMemoryUsage, cleanup } = useDocumentMemory({
    maxMemoryMB: 50,
    cleanupThreshold: 40
  })

  // Intersection Observer para lazy loading del contenido completo
  const { isIntersecting } = useIntersectionObserver(previewRef, {
    threshold: 0.1,
    rootMargin: '100px'
  })

  // Métricas del documento
  const documentMetrics = useMemo(() => {
    const wordCount = content.split(' ').filter(word => word.length > 0).length
    const charCount = content.length
    const estimatedReadTime = Math.ceil(wordCount / 200)
    const isLargeDocument = charCount > maxPreviewSize
    
    return {
      wordCount,
      charCount,
      estimatedReadTime,
      isLargeDocument,
      truncatedContent: isLargeDocument ? content.substring(0, maxPreviewSize) + '...' : content
    }
  }, [content, maxPreviewSize])

  // Procesamiento progresivo del contenido
  useEffect(() => {
    const processContent = async () => {
      const contentToProcess = showFullContent ? content : documentMetrics.truncatedContent

      try {
        trackMemoryUsage('preview-processing')
        
        if (contentToProcess.length > 50000) {
          // Usar sanitización progresiva para documentos grandes
          const result = await sanitizeProgressively(contentToProcess)
          setPreviewContent(result.sanitizedContent)
          
          if (result.warnings.length > 0) {
            toast.warning(`Documento procesado con ${result.warnings.length} advertencias`)
          }
        } else {
          // Procesamiento simple para documentos pequeños
          const simpleFormatted = contentToProcess
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^\s*/, '<p>')
            .replace(/\s*$/, '</p>')
          
          setPreviewContent(simpleFormatted)
        }
      } catch (error) {
        console.error('Error procesando contenido:', error)
        setPreviewContent(contentToProcess)
        toast.error('Error procesando el documento')
      }
    }

    if (isIntersecting || showFullContent) {
      processContent()
    }
  }, [content, showFullContent, documentMetrics.truncatedContent, isIntersecting, sanitizeProgressively, trackMemoryUsage])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  const handleToggleFullContent = useCallback(() => {
    setShowFullContent(prev => !prev)
    trackMemoryUsage('toggle-full-content')
  }, [trackMemoryUsage])

  const handleDownloadPDF = useCallback(async () => {
    try {
      trackMemoryUsage('pdf-generation')
      
      // Simular generación de PDF
      toast.success('Generando PDF...')
      
      // En implementación real, enviarías a endpoint de PDF
      setTimeout(() => {
        toast.success('PDF listo para descarga')
      }, 2000)
      
    } catch (error) {
      console.error('Error generando PDF:', error)
      toast.error('Error al generar PDF')
    }
  }, [trackMemoryUsage])

  const handleSendEmail = useCallback(async () => {
    try {
      const email = prompt('Ingrese el email de destino:')
      if (!email) return

      trackMemoryUsage('email-sending')
      toast.success(`Enviando documento a ${email}...`)
      
      // En implementación real, enviarías email
      setTimeout(() => {
        toast.success('Documento enviado exitosamente')
      }, 1500)
      
    } catch (error) {
      console.error('Error enviando email:', error)
      toast.error('Error al enviar email')
    }
  }, [trackMemoryUsage])

  return (
    <Card className="h-full border-0.5 border-black rounded-[10px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Vista Previa del Documento
              {documentMetrics.isLargeDocument && (
                <Badge variant="outline" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Documento grande
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{templateName}</Badge>
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {documentMetrics.wordCount.toLocaleString()} palabras
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{documentMetrics.estimatedReadTime} min lectura
              </span>
              {documentMetrics.isLargeDocument && (
                <span className="text-orange-600 text-xs">
                  ({(documentMetrics.charCount / 1024).toFixed(1)}KB)
                </span>
              )}
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
          <h3 className="font-medium text-sm flex items-center gap-2">
            Información del Documento
            {isSanitizing && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
                Procesando...
              </div>
            )}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Título:</span>
              <p className="font-medium">{title}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Caracteres:</span>
              <p className="font-medium">{documentMetrics.charCount.toLocaleString()}</p>
            </div>
          </div>
          
          {/* Progress bar para sanitización */}
          {isSanitizing && sanitizationProgress && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Procesando contenido...</span>
                <span>{sanitizationProgress.percentage}%</span>
              </div>
              <Progress value={sanitizationProgress.percentage} className="h-1" />
            </div>
          )}
        </div>

        {/* Large Document Warning */}
        {documentMetrics.isLargeDocument && !showFullContent && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800">
                  Este documento es muy grande. Se muestra una vista previa de {(maxPreviewSize / 1024).toFixed(0)}KB.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 text-xs"
                  onClick={handleToggleFullContent}
                >
                  Ver documento completo
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Content */}
        <div ref={previewRef} className="bg-white border rounded-lg overflow-hidden border-0.5 border-black">
          <ScrollArea className="max-h-96">
            <div className="p-6">
              {viewMode === 'formatted' ? (
                <div 
                  className="prose prose-sm max-w-none font-serif leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">
                  {showFullContent ? content : documentMetrics.truncatedContent}
                </pre>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Show Full Content Toggle */}
        {documentMetrics.isLargeDocument && showFullContent && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleFullContent}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Mostrar vista previa resumida
            </Button>
          </div>
        )}
        
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
              disabled={isGenerating || isSanitizing}
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
