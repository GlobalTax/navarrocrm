
import { memo, useCallback, useMemo, useRef } from 'react'
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  FileText, 
  Download, 
  Eye, 
  Edit, 
  Calendar,
  User,
  Building,
  MoreHorizontal 
} from 'lucide-react'
import { useVirtualizationCleanup } from '@/hooks/performance/useVirtualizationCleanup'
import { useLogger } from '@/hooks/useLogger'

interface Document {
  id: string
  title: string
  document_type: 'contract' | 'communication' | 'procedural'
  file_size: number
  created_at: string
  created_by_name?: string
  client_name?: string
  status: 'draft' | 'final' | 'archived'
  url?: string
  thumbnail?: string
}

interface VirtualizedDocumentListProps {
  documents: Document[]
  onViewDocument: (document: Document) => void
  onEditDocument: (document: Document) => void
  onDownloadDocument: (document: Document) => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
  height?: number
}

interface DocumentRowProps {
  index: number
  style: React.CSSProperties
  data: {
    documents: Document[]
    onViewDocument: (document: Document) => void
    onEditDocument: (document: Document) => void
    onDownloadDocument: (document: Document) => void
  }
}

const DocumentRow = memo<DocumentRowProps>(({ index, style, data }) => {
  const { documents, onViewDocument, onEditDocument, onDownloadDocument } = data
  const document = documents[index]

  if (!document) {
    return <div style={style} className="flex items-center justify-center text-muted-foreground">Cargando...</div>
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'contract': return 'Contrato'
      case 'communication': return 'Comunicación'
      case 'procedural': return 'Procesal'
      default: return type
    }
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'contract': return 'bg-primary/10 text-primary border-primary/20'
      case 'communication': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'procedural': return 'bg-purple-50 text-purple-700 border-purple-200'
      default: return 'bg-muted text-muted-foreground border-muted'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final': return 'bg-green-50 text-green-700 border-green-200'
      case 'draft': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'archived': return 'bg-gray-50 text-gray-700 border-gray-200'
      default: return 'bg-muted text-muted-foreground border-muted'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'final': return 'Final'
      case 'draft': return 'Borrador'
      case 'archived': return 'Archivado'
      default: return status
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div style={style} className="px-4">
      <Card className="group hover:shadow-md transition-all duration-200 border-0.5 border-black rounded-[10px]">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Document Icon/Thumbnail */}
            <div className="flex-shrink-0">
              {document.thumbnail ? (
                <Avatar className="h-12 w-12 rounded-lg">
                  <img src={document.thumbnail} alt={document.title} className="object-cover" />
                  <AvatarFallback className="rounded-lg bg-gray-50">
                    <FileText className="h-6 w-6 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-12 w-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* Document Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {document.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getDocumentTypeColor(document.document_type)}>
                      {getDocumentTypeLabel(document.document_type)}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(document.status)}>
                      {getStatusLabel(document.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(document.created_at)}</span>
                </div>
                
                {document.created_by_name && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="truncate max-w-32">{document.created_by_name}</span>
                  </div>
                )}
                
                {document.client_name && (
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    <span className="truncate max-w-32">{document.client_name}</span>
                  </div>
                )}
                
                <div className="text-xs">
                  {formatFileSize(document.file_size)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDocument(document)
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onEditDocument(document)
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onDownloadDocument(document)
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

DocumentRow.displayName = 'DocumentRow'

export const VirtualizedDocumentList = memo<VirtualizedDocumentListProps>(({
  documents,
  onViewDocument,
  onEditDocument,
  onDownloadDocument,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  height = 600
}) => {
  const logger = useLogger('VirtualizedDocumentList')
  const listRef = useRef<List>(null)
  const ITEM_HEIGHT = 120
  const preloadThreshold = 10

  // Limpieza automática de memoria
  const { forceCleanup } = useVirtualizationCleanup({
    itemCount: documents.length,
    componentName: 'VirtualizedDocumentList',
    cleanupThreshold: 200,
    memoryCheckInterval: 30000
  })

  const itemCount = useMemo(() => 
    hasNextPage ? documents.length + 1 : documents.length, 
    [hasNextPage, documents.length]
  )

  const isItemLoaded = useCallback((index: number) => !!documents[index], [documents])

  const itemData = useMemo(() => ({
    documents,
    onViewDocument,
    onEditDocument,
    onDownloadDocument
  }), [documents, onViewDocument, onEditDocument, onDownloadDocument])

  const loadMoreItems = useCallback(async (startIndex: number, stopIndex: number) => {
    if (!fetchNextPage || isFetchingNextPage) return

    if (stopIndex >= documents.length - preloadThreshold) {
      logger.info('🔄 Precargando más documentos', {
        stopIndex,
        totalLoaded: documents.length,
        preloadThreshold
      })

      try {
        await fetchNextPage()
      } catch (error) {
        logger.error('❌ Error cargando más documentos:', error)
        forceCleanup()
      }
    }
  }, [fetchNextPage, isFetchingNextPage, documents.length, preloadThreshold, logger, forceCleanup])

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No hay documentos disponibles
          </h3>
          <p className="text-muted-foreground">
            Los documentos aparecerán aquí cuando se generen
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMoreItems}
        threshold={preloadThreshold}
        minimumBatchSize={20}
      >
        {({ onItemsRendered, ref: loaderRef }) => (
          <List
            ref={(list) => {
              listRef.current = list
              loaderRef(list)
            }}
            height={height}
            width="100%"
            itemCount={itemCount}
            itemSize={ITEM_HEIGHT}
            itemData={itemData}
            onItemsRendered={onItemsRendered}
            overscanCount={5}
            useIsScrolling={true}
          >
            {DocumentRow}
          </List>
        )}
      </InfiniteLoader>

      {isFetchingNextPage && (
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-0.5 border-black border-t-transparent"></div>
            <span className="text-sm text-muted-foreground">Cargando más documentos...</span>
          </div>
        </div>
      )}

      {documents.length > 100 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Mostrando {documents.length.toLocaleString()} documentos
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={forceCleanup}
            className="text-xs"
          >
            🧹 Optimizar memoria
          </Button>
        </div>
      )}
    </div>
  )
})

VirtualizedDocumentList.displayName = 'VirtualizedDocumentList'
