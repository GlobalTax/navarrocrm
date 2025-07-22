
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Download, AlertCircle } from 'lucide-react'
import { useProgressiveSanitization } from '@/hooks/documents/useProgressiveSanitization'
import { useIntersectionObserver } from '@/hooks/performance/useIntersectionObserver'
import { useLogger } from '@/hooks/useLogger'

interface ProgressiveDocumentPreviewProps {
  documentId: string
  title: string
  content: string
  size?: number
  type?: string
  onFullView?: () => void
  onDownload?: () => void
  className?: string
}

export const ProgressiveDocumentPreview = ({
  documentId,
  title,
  content,
  size = 0,
  type = 'text',
  onFullView,
  onDownload,
  className = ''
}: ProgressiveDocumentPreviewProps) => {
  const logger = useLogger('ProgressiveDocumentPreview')
  const [showFullContent, setShowFullContent] = useState(false)
  const [loadingState, setLoadingState] = useState<'preview' | 'loading' | 'full'>('preview')
  
  // Configuración adaptativa basada en el tamaño del documento
  const chunkSize = size > 1024 * 1024 ? 500 : 1000 // Chunks más pequeños para docs grandes
  const previewLength = size > 1024 * 1024 ? 200 : 500
  
  const [previewContent, setPreviewContent] = useState('')
  const [fullContent, setFullContent] = useState('')
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [fullError, setFullError] = useState<string | null>(null)

  const {
    sanitizeProgressively: sanitizePreview,
    isProcessing: previewProcessing,
    progress: previewProgress
  } = useProgressiveSanitization({
    chunkSize,
    strictMode: true,
    preserveFormatting: false
  })

  const {
    sanitizeProgressively: sanitizeFull,
    isProcessing: fullProcessing,
    progress: sanitizationProgress
  } = useProgressiveSanitization({
    chunkSize,
    strictMode: false,
    preserveFormatting: true
  })

  // Sanitize preview content on mount
  useEffect(() => {
    const sanitizePreviewContent = async () => {
      try {
        const result = await sanitizePreview(content.substring(0, previewLength))
        setPreviewContent(result.sanitizedContent)
        setPreviewError(null)
      } catch (error) {
        setPreviewError('Error al procesar vista previa')
        logger.error('Error sanitizing preview', { error })
      }
    }
    
    if (content) {
      sanitizePreviewContent()
    }
  }, [content, previewLength, sanitizePreview, logger])

  // Intersection Observer para lazy loading del contenido completo
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  })

  // Cargar contenido completo cuando el componente sea visible
  useEffect(() => {
    if (isIntersecting && !showFullContent && !fullProcessing) {
      logger.info('🔄 Activando carga progresiva', { 
        documentId, 
        sizeKB: (size / 1024).toFixed(1)
      })
      setLoadingState('loading')
      setShowFullContent(true)
    }
  }, [isIntersecting, showFullContent, fullProcessing, documentId, size, logger])

  // Sanitizar contenido completo cuando se active
  useEffect(() => {
    const sanitizeFullContent = async () => {
      try {
        const result = await sanitizeFull(content)
        setFullContent(result.sanitizedContent)
        setFullError(null)
        setLoadingState('full')
        logger.info('✅ Contenido completo cargado', { 
          documentId,
          contentLength: result.sanitizedContent.length 
        })
      } catch (error) {
        setFullError('Error al procesar contenido completo')
        logger.error('Error sanitizing full content', { error })
      }
    }
    
    if (showFullContent && content) {
      sanitizeFullContent()
    }
  }, [showFullContent, content, sanitizeFull, documentId, logger])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const handleExpandClick = () => {
    if (!showFullContent) {
      setShowFullContent(true)
      setLoadingState('loading')
    } else if (onFullView) {
      onFullView()
    }
  }

  const renderContent = () => {
    if (previewError || fullError) {
      return (
        <div className="flex items-center gap-2 text-red-600 p-4">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Error al procesar el documento</span>
        </div>
      )
    }

    if (loadingState === 'preview' || previewProcessing) {
      return (
        <div className="space-y-2">
          <div dangerouslySetInnerHTML={{ __html: previewContent }} />
          {previewProcessing && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400" />
              <span className="text-xs">Procesando vista previa...</span>
            </div>
          )}
        </div>
      )
    }

    if (loadingState === 'loading') {
      return (
        <div className="space-y-3">
          <div dangerouslySetInnerHTML={{ __html: previewContent }} />
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400" />
              <span className="text-xs text-gray-600">
                Cargando contenido completo... {Math.round(sanitizationProgress.percentage)}%
              </span>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div dangerouslySetInnerHTML={{ __html: fullContent || previewContent }} />
    )
  }

  return (
    <Card 
      ref={targetRef}
      className={`transition-all duration-200 hover:shadow-md ${className}`}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm truncate flex-1">{title}</h4>
            {size > 0 && (
              <Badge variant="outline" className="text-xs">
                {formatFileSize(size)}
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpandClick}
              className="h-6 w-6 p-0"
            >
              <Eye className="h-3 w-3" />
            </Button>
            {onDownload && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDownload}
                className="h-6 w-6 p-0"
              >
                <Download className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none text-xs leading-relaxed max-h-32 overflow-hidden">
          {renderContent()}
        </div>

        {/* Fade effect for preview */}
        {loadingState === 'preview' && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}

        {/* Status indicator */}
        {loadingState !== 'preview' && (
          <div className="mt-3 pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {loadingState === 'loading' ? 'Cargando...' : 'Contenido completo'}
              </span>
              {loadingState === 'full' && onFullView && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={onFullView}
                  className="h-auto p-0 text-xs"
                >
                  Ver completo
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
