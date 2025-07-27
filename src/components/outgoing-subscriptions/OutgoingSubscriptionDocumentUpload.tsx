import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useOutgoingSubscriptionDocuments } from '@/hooks/useOutgoingSubscriptionDocuments'
import { useDropzone } from 'react-dropzone'
import { Upload, X, File, AlertCircle } from 'lucide-react'
import { DOCUMENT_TYPES } from '@/types/outgoing-subscription-documents'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface OutgoingSubscriptionDocumentUploadProps {
  subscriptionId: string
  onClose: () => void
  onSuccess: () => void
}

export const OutgoingSubscriptionDocumentUpload = ({ 
  subscriptionId, 
  onClose, 
  onSuccess 
}: OutgoingSubscriptionDocumentUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>('invoice')
  const [description, setDescription] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { createDocument, uploadFile, isCreating, isUploading } = useOutgoingSubscriptionDocuments()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadError(null)
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      
      // Validar tamaño de archivo (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('El archivo no puede ser mayor a 10MB')
        return
      }

      // Validar tipos de archivo permitidos
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]

      if (!allowedTypes.includes(file.type)) {
        setUploadError('Tipo de archivo no permitido. Solo se permiten PDF, imágenes, Word y Excel.')
        return
      }

      setSelectedFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setUploadError('Por favor selecciona un archivo')
      return
    }

    try {
      setUploadError(null)
      
      // Generar nombre único para el archivo
      const timestamp = Date.now()
      const sanitizedFileName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `${subscriptionId}/${timestamp}_${sanitizedFileName}`

      // Subir archivo al storage
      await uploadFile.mutateAsync({ file: selectedFile, filePath })

      // Crear registro en la base de datos
      await createDocument.mutateAsync({
        subscription_id: subscriptionId,
        file_name: selectedFile.name,
        file_path: filePath,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        document_type: documentType as any,
        description: description.trim() || undefined
      })

      onSuccess()
    } catch (error) {
      console.error('Error uploading document:', error)
      setUploadError('Error al subir el documento. Por favor inténtalo de nuevo.')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const isLoading = isCreating || isUploading

  return (
    <Card className="border-0.5 border-black rounded-[10px] shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">Subir Documento</CardTitle>
            <CardDescription>
              Agrega facturas, contratos u otros documentos relacionados con esta suscripción
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-[6px]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Zona de arrastrar y soltar */}
          <div className="space-y-2">
            <Label>Archivo</Label>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-[8px] p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : selectedFile 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <input {...getInputProps()} />
              
              {selectedFile ? (
                <div className="space-y-2">
                  <File className="h-8 w-8 mx-auto text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">{selectedFile.name}</p>
                    <p className="text-sm text-green-600">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                    }}
                    className="border-0.5 border-black rounded-[6px]"
                  >
                    Cambiar archivo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <div>
                    <p className="text-gray-600">
                      {isDragActive 
                        ? 'Suelta el archivo aquí...' 
                        : 'Arrastra un archivo aquí o haz clic para seleccionar'
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, imágenes, Word, Excel (máx. 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tipo de documento */}
          <div className="space-y-2">
            <Label htmlFor="document-type">Tipo de Documento</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger className="border-0.5 border-black rounded-[8px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-0.5 border-black rounded-[8px]">
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Añade una descripción o notas sobre este documento..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-0.5 border-black rounded-[8px]"
              rows={3}
            />
          </div>

          {/* Error */}
          {uploadError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                {uploadError}
              </AlertDescription>
            </Alert>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-0.5 border-black rounded-[8px]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || isLoading}
              className="rounded-[8px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Subiendo...
                </div>
              ) : (
                'Subir Documento'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}