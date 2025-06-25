
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, Image, CheckCircle, AlertCircle } from 'lucide-react'

interface SharedFile {
  name: string
  type: string
  size: number
  data: string | ArrayBuffer
}

interface FileUploadHandlerProps {
  files?: File[]
  title?: string
  text?: string
  url?: string
  onSave?: (data: any) => void
  onCancel?: () => void
}

export const FileUploadHandler: React.FC<FileUploadHandlerProps> = ({
  files = [],
  title = '',
  text = '',
  url = '',
  onSave,
  onCancel
}) => {
  const [processedFiles, setProcessedFiles] = useState<SharedFile[]>([])
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (files.length > 0) {
      processFiles()
    }
  }, [files])

  const processFiles = async () => {
    setProcessing(true)
    setError(null)

    try {
      const processed = await Promise.all(
        files.map(async (file) => {
          return new Promise<SharedFile>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
              resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                data: reader.result!
              })
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
        })
      )
      
      setProcessedFiles(processed)
    } catch (err) {
      setError('Error al procesar los archivos')
      console.error('Error processing files:', err)
    } finally {
      setProcessing(false)
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSave = () => {
    const data = {
      files: processedFiles,
      metadata: {
        title,
        text,
        url,
        timestamp: new Date().toISOString()
      }
    }
    
    onSave?.(data)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Archivos Compartidos
          </CardTitle>
          <CardDescription>
            Los siguientes archivos han sido compartidos con CRM Asesoría
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {title && (
            <div>
              <label className="text-sm font-medium text-gray-700">Título:</label>
              <p className="text-sm text-gray-900">{title}</p>
            </div>
          )}
          
          {text && (
            <div>
              <label className="text-sm font-medium text-gray-700">Descripción:</label>
              <p className="text-sm text-gray-900">{text}</p>
            </div>
          )}
          
          {url && (
            <div>
              <label className="text-sm font-medium text-gray-700">URL:</label>
              <p className="text-sm text-blue-600 underline">{url}</p>
            </div>
          )}

          {processing && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Procesando archivos...
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {processedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Archivos procesados:</h4>
              {processedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Listo
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={processing || processedFiles.length === 0}
            >
              Guardar Archivos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
