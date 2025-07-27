import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOutgoingSubscriptionDocuments } from '@/hooks/useOutgoingSubscriptionDocuments'
import { OutgoingSubscriptionDocumentUpload } from './OutgoingSubscriptionDocumentUpload'
import { FileText, Download, Trash2, Plus, Calendar, User, FileIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { DOCUMENT_TYPES } from '@/types/outgoing-subscription-documents'

interface OutgoingSubscriptionDocumentsProps {
  subscriptionId: string
  subscriptionName: string
}

export const OutgoingSubscriptionDocuments = ({ subscriptionId, subscriptionName }: OutgoingSubscriptionDocumentsProps) => {
  const [showUpload, setShowUpload] = useState(false)
  const { documents, isLoading, deleteDocument, downloadFile, isDeleting } = useOutgoingSubscriptionDocuments(subscriptionId)

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(dt => dt.value === type)?.label || type
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'invoice': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'contract': return 'bg-green-100 text-green-800 border-green-200'
      case 'receipt': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Desconocido'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (fileType?: string) => {
    if (fileType?.includes('pdf')) return '📄'
    if (fileType?.includes('image')) return '🖼️'
    if (fileType?.includes('word')) return '📝'
    if (fileType?.includes('excel') || fileType?.includes('spreadsheet')) return '📊'
    return '📎'
  }

  if (isLoading) {
    return (
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos y Adjuntos
              </CardTitle>
              <CardDescription>
                Facturas, contratos y otros documentos de "{subscriptionName}"
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowUpload(true)}
              size="sm"
              className="border-0.5 border-black rounded-[8px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Subir Documento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground mb-4">
                No hay documentos adjuntos para esta suscripción
              </p>
              <Button
                onClick={() => setShowUpload(true)}
                variant="outline"
                className="border-0.5 border-black rounded-[8px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Subir primer documento
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-[8px] hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl">
                      {getFileIcon(document.file_type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate max-w-[200px]">
                          {document.file_name}
                        </h4>
                        <Badge className={`text-xs rounded-[6px] border-0.5 ${getDocumentTypeColor(document.document_type)}`}>
                          {getDocumentTypeLabel(document.document_type)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(document.upload_date), { addSuffix: true, locale: es })}
                        </span>
                        <span>{formatFileSize(document.file_size)}</span>
                        {document.description && (
                          <span className="truncate max-w-[150px]">
                            "{document.description}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadFile(document.file_path, document.file_name)}
                      className="h-8 w-8 p-0 rounded-[6px]"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-[6px] text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-0.5 border-black rounded-[10px]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. El documento "{document.file_name}" 
                            será eliminado permanentemente del sistema.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-0.5 border-black rounded-[8px]">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteDocument.mutate(document.id)}
                            className="bg-red-600 hover:bg-red-700 rounded-[8px]"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showUpload && (
        <OutgoingSubscriptionDocumentUpload
          subscriptionId={subscriptionId}
          onClose={() => setShowUpload(false)}
          onSuccess={() => setShowUpload(false)}
        />
      )}
    </div>
  )
}