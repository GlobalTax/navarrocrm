
import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { X, Upload, Download, CheckCircle, AlertCircle, Loader2, Users } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { toast } from 'sonner'
import { useUserInvitations } from '@/hooks/useUserInvitations'

interface UserBulkUploadProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface ParsedUser {
  email: string
  role: string
  send_email?: boolean
  message?: string
  row: number
}

interface ValidationError {
  row: number
  field: string
  message: string
}

export function UserBulkUpload({ open, onClose, onSuccess }: UserBulkUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedUser[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [processedCount, setProcessedCount] = useState(0)
  const [erroredCount, setErroredCount] = useState(0)

  const { sendInvitation } = useUserInvitations()

  const validateRow = (row: any, index: number): { user: ParsedUser | null; errors: ValidationError[] } => {
    const errors: ValidationError[] = []
    
    // Validar email (requerido)
    if (!row.email || row.email.trim() === '') {
      errors.push({
        row: index + 1,
        field: 'email',
        message: 'El email es requerido'
      })
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push({
        row: index + 1,
        field: 'email',
        message: 'Formato de email inválido'
      })
    }

    // Validar rol (requerido)
    const validRoles = ['partner', 'area_manager', 'senior', 'junior', 'finance']
    if (!row.role || row.role.trim() === '') {
      errors.push({
        row: index + 1,
        field: 'role',
        message: 'El rol es requerido'
      })
    } else if (!validRoles.includes(row.role.trim())) {
      errors.push({
        row: index + 1,
        field: 'role',
        message: `Rol debe ser uno de: ${validRoles.join(', ')}`
      })
    }

    // Validar send_email (opcional, por defecto true)
    let sendEmail = true
    if (row.send_email !== undefined) {
      const sendEmailStr = String(row.send_email).toLowerCase()
      if (!['true', 'false', '1', '0', 'si', 'no', 'sí'].includes(sendEmailStr)) {
        errors.push({
          row: index + 1,
          field: 'send_email',
          message: 'send_email debe ser: true/false, 1/0, si/no'
        })
      } else {
        sendEmail = ['true', '1', 'si', 'sí'].includes(sendEmailStr)
      }
    }

    if (errors.length > 0) {
      return { user: null, errors }
    }

    const user: ParsedUser = {
      email: row.email.trim().toLowerCase(),
      role: row.role.trim(),
      send_email: sendEmail,
      message: row.message?.trim() || undefined,
      row: index + 1
    }

    return { user, errors: [] }
  }

  const processFile = useCallback((file: File) => {
    setIsProcessing(true)
    setUploadStatus('processing')
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validUsers: ParsedUser[] = []
        const allErrors: ValidationError[] = []

        results.data.forEach((row: any, index: number) => {
          const { user, errors } = validateRow(row, index)
          
          if (user) {
            validUsers.push(user)
          }
          
          allErrors.push(...errors)
        })

        setParsedData(validUsers)
        setValidationErrors(allErrors)
        setIsProcessing(false)
        
        if (allErrors.length === 0) {
          toast.success(`Archivo procesado exitosamente. ${validUsers.length} usuarios listos para invitar`)
        } else {
          toast.error(`Errores de validación encontrados: ${allErrors.length} errores que deben corregirse`)
        }
      },
      error: (error) => {
        setIsProcessing(false)
        setUploadStatus('error')
        toast.error(`Error al procesar archivo: ${error.message}`)
      }
    })
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFile(file)
      processFile(file)
    }
  }, [processFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  })

  const handleBulkInvite = async () => {
    if (parsedData.length === 0 || validationErrors.length > 0) return

    setIsProcessing(true)
    setUploadStatus('processing')
    setUploadProgress(0)
    setProcessedCount(0)
    setErroredCount(0)

    try {
      const batchSize = 5 // Procesar de 5 en 5 para evitar sobrecarga
      let successCount = 0
      let errorCount = 0

      for (let i = 0; i < parsedData.length; i += batchSize) {
        const batch = parsedData.slice(i, i + batchSize)
        
        // Procesar batch en paralelo
        const batchPromises = batch.map(async (user) => {
          try {
            await sendInvitation.mutateAsync({
              email: user.email,
              role: user.role,
              message: user.message
            })
            return { success: true, user }
          } catch (error: any) {
            console.error(`Error invitando a ${user.email}:`, error)
            return { success: false, user, error: error.message }
          }
        })

        const batchResults = await Promise.all(batchPromises)
        
        // Contar resultados
        batchResults.forEach(result => {
          if (result.success) {
            successCount++
          } else {
            errorCount++
            toast.error(`Error invitando a ${result.user.email}: ${result.error}`)
          }
        })

        setProcessedCount(successCount)
        setErroredCount(errorCount)
        setUploadProgress(((i + batch.length) / parsedData.length) * 100)

        // Pequeña pausa entre lotes para evitar rate limiting
        if (i + batchSize < parsedData.length) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      setUploadStatus('success')
      
      if (errorCount === 0) {
        toast.success(`¡Proceso completado! ${successCount} usuarios invitados correctamente`)
      } else {
        toast.warning(`Proceso completado con errores: ${successCount} exitosos, ${errorCount} con errores`)
      }
      
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)

    } catch (error) {
      setUploadStatus('error')
      toast.error(`Error en el proceso de invitación masiva: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        email: 'juan.perez@empresa.com',
        role: 'senior',
        send_email: 'true',
        message: 'Bienvenido al equipo'
      },
      {
        email: 'maria.garcia@empresa.com',
        role: 'junior',
        send_email: 'true',
        message: 'Esperamos trabajar contigo'
      },
      {
        email: 'pedro.martinez@empresa.com',
        role: 'area_manager',
        send_email: 'false',
        message: ''
      }
    ]

    const csv = Papa.unparse(template)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla_usuarios.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const resetUpload = () => {
    setFile(null)
    setParsedData([])
    setValidationErrors([])
    setUploadProgress(0)
    setUploadStatus('idle')
    setIsProcessing(false)
    setProcessedCount(0)
    setErroredCount(0)
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      partner: 'Partner',
      area_manager: 'Area Manager',
      senior: 'Senior',
      junior: 'Junior',
      finance: 'Finanzas'
    }
    return labels[role as keyof typeof labels] || role
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto border-0.5 border-black rounded-[10px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invitación Masiva de Usuarios
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-[10px] border-0.5 border-blue-200">
            <div>
              <h3 className="font-medium">Plantilla CSV</h3>
              <p className="text-sm text-muted-foreground">
                Descarga la plantilla con el formato correcto (email, role, send_email, message)
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Roles válidos: partner, area_manager, senior, junior, finance
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate} className="border-0.5 border-black rounded-[10px]">
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          </div>

          <Separator />

          {/* File Upload */}
          {uploadStatus === 'idle' && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-[10px] p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Suelta el archivo aquí...</p>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <p>Arrastra y suelta tu archivo CSV aquí, o haz clic para seleccionar</p>
                  <p className="text-sm text-muted-foreground">
                    Formatos soportados: .csv, .xls, .xlsx
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Processing */}
          {isProcessing && uploadStatus === 'processing' && uploadProgress === 0 && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto animate-spin mb-4" />
              <p>Procesando archivo...</p>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive" className="border-0.5 border-red-300 rounded-[10px]">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Se encontraron {validationErrors.length} errores:</p>
                  <div className="max-h-32 overflow-y-auto">
                    {validationErrors.slice(0, 5).map((error, index) => (
                      <p key={index} className="text-sm">
                        Fila {error.row}, campo {error.field}: {error.message}
                      </p>
                    ))}
                    {validationErrors.length > 5 && (
                      <p className="text-sm">... y {validationErrors.length - 5} errores más</p>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {parsedData.length > 0 && validationErrors.length === 0 && (
            <div className="space-y-4">
              <Alert className="border-0.5 border-green-300 rounded-[10px]">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Archivo procesado correctamente. {parsedData.length} usuarios listos para invitar.
                </AlertDescription>
              </Alert>

              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-[10px] p-4">
                <h4 className="font-medium mb-2">Vista previa:</h4>
                {parsedData.slice(0, 5).map((user, index) => (
                  <div key={index} className="text-sm mb-2 flex items-center justify-between">
                    <div>
                      <strong>{user.email}</strong> - {getRoleLabel(user.role)}
                      {user.message && <span className="text-gray-500 ml-2">"{user.message}"</span>}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.send_email ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.send_email ? 'Enviar email' : 'Sin email'}
                    </span>
                  </div>
                ))}
                {parsedData.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    ... y {parsedData.length - 5} usuarios más
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadStatus === 'processing' && uploadProgress > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Enviando invitaciones...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-600">
                <span>Procesados: {processedCount}</span>
                {erroredCount > 0 && <span className="text-red-600">Errores: {erroredCount}</span>}
              </div>
            </div>
          )}

          {/* Success */}
          {uploadStatus === 'success' && (
            <Alert className="border-0.5 border-green-300 rounded-[10px]">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ¡Proceso de invitación completado! Se han enviado {processedCount} invitaciones correctamente
                {erroredCount > 0 && ` con ${erroredCount} errores`}.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="border-0.5 border-black rounded-[10px]">
            Cancelar
          </Button>
          
          {file && uploadStatus !== 'success' && (
            <Button variant="outline" onClick={resetUpload} className="border-0.5 border-black rounded-[10px]">
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          )}
          
          {parsedData.length > 0 && validationErrors.length === 0 && uploadStatus !== 'success' && (
            <Button 
              onClick={handleBulkInvite} 
              disabled={isProcessing}
              className="border-0.5 border-black rounded-[10px] hover-lift"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Invitando...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Invitar {parsedData.length} usuarios
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
