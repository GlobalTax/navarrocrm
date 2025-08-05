import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  File, 
  X, 
  Check, 
  AlertCircle, 
  FileText, 
  FileImage,
  Download 
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'

interface DocumentUploadProps {
  onboardingId: string
  onFilesUploaded: (files: UploadedFile[]) => void
  maxFiles?: number
  maxSizePerFile?: number // in MB
  acceptedFileTypes?: string[]
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  status: 'uploading' | 'uploaded' | 'error'
  progress: number
  documentType: string
}

const DOCUMENT_TYPES = [
  { value: 'dni', label: 'DNI/NIE', description: 'Documento de identidad' },
  { value: 'cv', label: 'Curriculum Vitae', description: 'CV actualizado' },
  { value: 'certificate', label: 'Certificados', description: 'Títulos y certificaciones' },
  { value: 'contract', label: 'Contrato', description: 'Documentos contractuales' },
  { value: 'other', label: 'Otros', description: 'Otros documentos relevantes' }
]

export function DocumentUpload({
  onboardingId,
  onFilesUploaded,
  maxFiles = 10,
  maxSizePerFile = 10, // 10MB
  acceptedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']
}: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      toast.error(`Máximo ${maxFiles} archivos permitidos`)
      return
    }

    const newFiles: UploadedFile[] = acceptedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading' as const,
      progress: 0,
      documentType: detectDocumentType(file.name)
    }))

    setFiles(prev => [...prev, ...newFiles])
    setUploading(true)

    // Upload files one by one
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i]
      const fileRecord = newFiles[i]
      
      try {
        await uploadFile(file, fileRecord)
      } catch (error) {
        console.error('Upload error:', error)
        updateFileStatus(fileRecord.id, 'error', 0)
      }
    }

    setUploading(false)
  }, [files.length, maxFiles])

  const uploadFile = async (file: File, fileRecord: UploadedFile) => {
    try {
      // Simulate progress updates
      const updateProgress = (progress: number) => {
        setFiles(prev => prev.map(f => 
          f.id === fileRecord.id ? { ...f, progress } : f
        ))
      }

      updateProgress(20)

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${onboardingId}/${Date.now()}-${file.name}`
      
      updateProgress(50)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      updateProgress(80)

      // Save file record to database
      const { data: dbData, error: dbError } = await supabase
        .from('employee_document_uploads')
        .insert({
          onboarding_id: onboardingId,
          org_id: (await supabase.auth.getUser()).data.user?.user_metadata?.org_id,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          document_type: fileRecord.documentType,
          upload_status: 'uploaded',
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

      if (dbError) throw dbError

      updateProgress(100)
      updateFileStatus(fileRecord.id, 'uploaded', 100)

      toast.success(`${file.name} subido correctamente`)

    } catch (error: any) {
      toast.error(`Error subiendo ${file.name}: ${error.message}`)
      updateFileStatus(fileRecord.id, 'error', 0)
    }
  }

  const updateFileStatus = (fileId: string, status: 'uploading' | 'uploaded' | 'error', progress: number) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status, progress } : f
    ))
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const detectDocumentType = (fileName: string): string => {
    const name = fileName.toLowerCase()
    if (name.includes('dni') || name.includes('nie') || name.includes('pasaporte')) return 'dni'
    if (name.includes('cv') || name.includes('curriculum')) return 'cv'
    if (name.includes('certificado') || name.includes('titulo')) return 'certificate'
    if (name.includes('contrato')) return 'contract'
    return 'other'
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
      return <FileImage className="h-5 w-5" />
    }
    return <FileText className="h-5 w-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize: maxSizePerFile * 1024 * 1024,
    disabled: uploading
  })

  return (
    <div className="space-y-6">
      <Card className="border-0.5 border-gray-200 rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Subir Documentos
          </CardTitle>
          <p className="text-sm text-gray-600">
            Sube los documentos necesarios para completar tu incorporación
          </p>
        </CardHeader>
        
        <CardContent>
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-[10px] p-8 text-center cursor-pointer transition-all duration-200
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
              ${uploading ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Suelta los archivos aquí...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Arrastra archivos aquí o <span className="text-blue-600 font-medium">haz clic para seleccionar</span>
                </p>
                <p className="text-sm text-gray-500">
                  Máximo {maxFiles} archivos, {maxSizePerFile}MB por archivo
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Formatos: PDF, JPG, PNG, DOC, DOCX
                </p>
              </div>
            )}
          </div>

          {/* Document Types Guide */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-[10px]">
            <h4 className="text-sm font-medium text-blue-800 mb-3">Tipos de documentos recomendados:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {DOCUMENT_TYPES.map((type) => (
                <div key={type.value} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{type.label}</Badge>
                  <span className="text-blue-700">{type.description}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      {files.length > 0 && (
        <Card className="border-0.5 border-gray-200 rounded-[10px]">
          <CardHeader>
            <CardTitle className="text-base">Archivos ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-[10px]">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.name)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {DOCUMENT_TYPES.find(t => t.value === file.documentType)?.label || 'Otro'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    
                    {file.status === 'uploading' && (
                      <div className="mt-2">
                        <Progress value={file.progress} className="h-1" />
                        <p className="text-xs text-gray-500 mt-1">{file.progress}% subido</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {file.status === 'uploaded' && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    {file.status === 'uploading' && (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}