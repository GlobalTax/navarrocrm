import React, { useState, useEffect } from 'react'
import { DocumentUpload } from '../DocumentUpload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface DocumentsStepProps {
  data: any
  onDataChange: (data: any) => void
  onValidationChange: (isValid: boolean, errors: string[]) => void
  onSave: (data: any) => Promise<boolean>
}

interface UploadedDocument {
  id: string
  file_name: string
  file_size: number
  document_type: string
  upload_status: string
  created_at: string
}

export function DocumentsStep({ 
  data, 
  onDataChange, 
  onValidationChange,
  onSave 
}: DocumentsStepProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Obtener los archivos ya subidos cuando el componente se monta
  useEffect(() => {
    if (data?.onboarding_id) {
      loadUploadedFiles()
    }
  }, [data?.onboarding_id])

  // Validar cuando cambian los archivos
  useEffect(() => {
    const errors: string[] = []
    
    // Al menos un documento debe estar subido
    if (uploadedFiles.length === 0) {
      errors.push('Debe subir al menos un documento')
    }

    // Verificar que al menos haya un DNI/NIE
    const hasDNI = uploadedFiles.some(file => file.document_type === 'dni')
    if (uploadedFiles.length > 0 && !hasDNI) {
      errors.push('Es recomendable subir una copia del DNI/NIE')
    }

    const isValid = uploadedFiles.length > 0
    onValidationChange(isValid, errors)
    
    // Actualizar datos
    onDataChange({
      uploaded_documents: uploadedFiles,
      documents_completed: isValid
    })
  }, [uploadedFiles])

  const loadUploadedFiles = async () => {
    if (!data?.onboarding_id) return
    
    setIsLoading(true)
    try {
      const { data: files, error } = await supabase
        .from('employee_document_uploads')
        .select('*')
        .eq('onboarding_id', data.onboarding_id)
        .eq('upload_status', 'uploaded')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setUploadedFiles(files || [])
    } catch (error: any) {
      console.error('Error loading files:', error)
      toast.error('Error cargando documentos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilesUploaded = (files: any[]) => {
    // Recargar la lista de archivos subidos
    loadUploadedFiles()
    toast.success(`${files.length} archivo(s) subido(s) correctamente`)
  }

  const downloadFile = async (file: UploadedDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('employee-documents')
        .download(file.file_name)

      if (error) throw error

      // Crear URL de descarga
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = file.file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Archivo descargado')
    } catch (error: any) {
      toast.error('Error descargando archivo')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      dni: 'DNI/NIE',
      cv: 'CV',
      certificate: 'Certificado',
      contract: 'Contrato',
      other: 'Otro'
    }
    return types[type] || type
  }

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      dni: 'bg-blue-100 text-blue-800 border-blue-200',
      cv: 'bg-green-100 text-green-800 border-green-200',
      certificate: 'bg-purple-100 text-purple-800 border-purple-200',
      contract: 'bg-orange-100 text-orange-800 border-orange-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[type] || colors.other
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Cargando documentos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-blue-50 border-blue-200 border-0.5 rounded-[10px]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">
                Documentación Requerida
              </h4>
              <p className="text-sm text-blue-700">
                Sube los documentos necesarios para completar tu proceso de incorporación. 
                Los documentos se almacenan de forma segura y solo el equipo de RRHH tendrá acceso.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload */}
      <DocumentUpload
        onboardingId={data?.onboarding_id || ''}
        onFilesUploaded={handleFilesUploaded}
        maxFiles={10}
        maxSizePerFile={10}
        acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']}
      />

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card className="border-0.5 border-gray-200 rounded-[10px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Documentos Subidos ({uploadedFiles.length})
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div 
                  key={file.id} 
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors"
                >
                  <FileText className="h-5 w-5 text-gray-600" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{file.file_name}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getDocumentTypeColor(file.document_type)}`}
                      >
                        {getDocumentTypeLabel(file.document_type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>Subido: {new Date(file.created_at).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Subido
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(file)}
                      className="text-xs"
                    >
                      Descargar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requirements Guide */}
      <Card className="border-0.5 border-gray-200 rounded-[10px]">
        <CardHeader>
          <CardTitle className="text-base">Documentos Recomendados</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-800">Obligatorios:</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>DNI/NIE vigente (ambas caras)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Curriculum Vitae actualizado</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-800">Opcionales:</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span>Títulos académicos</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span>Certificados profesionales</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span>Cartas de recomendación</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length === 0 && (
        <Card className="bg-yellow-50 border-yellow-200 border-0.5 rounded-[10px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                <strong>Paso pendiente:</strong> Sube al menos un documento para continuar con el proceso.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}