import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { X, Upload, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { validateAndSanitizeEmail } from '@/lib/security'

interface ClientBulkUploadProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface ParsedClient {
  name: string
  email?: string
  phone?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  address_country?: string
  client_type?: string
  status?: string
  relationship_type?: string
  row: number
}

interface ValidationError {
  row: number
  field: string
  message: string
}

export function ClientBulkUpload({ open, onClose, onSuccess }: ClientBulkUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedClient[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')

  const validateRow = (row: any, index: number): { client: ParsedClient | null; errors: ValidationError[] } => {
    const errors: ValidationError[] = []
    
    // Validar nombre (requerido)
    if (!row.name || row.name.trim() === '') {
      errors.push({
        row: index + 1,
        field: 'name',
        message: 'El nombre es requerido'
      })
    }

    // Validar email (formato si está presente)
    if (row.email) {
      const emailValidation = validateAndSanitizeEmail(row.email)
      if (!emailValidation.isValid) {
        errors.push({
          row: index + 1,
          field: 'email',
          message: emailValidation.error || 'Formato de email inválido'
        })
      }
    }

    // Validar tipo de cliente
    const validClientTypes = ['particular', 'empresa', 'autonomo']
    if (row.client_type && !validClientTypes.includes(row.client_type)) {
      errors.push({
        row: index + 1,
        field: 'client_type',
        message: `Tipo de cliente debe ser: ${validClientTypes.join(', ')}`
      })
    }

    // Validar estado
    const validStatuses = ['activo', 'inactivo', 'prospecto', 'bloqueado']
    if (row.status && !validStatuses.includes(row.status)) {
      errors.push({
        row: index + 1,
        field: 'status',
        message: `Estado debe ser: ${validStatuses.join(', ')}`
      })
    }

    // Validar tipo de relación
    const validRelationshipTypes = ['prospecto', 'cliente', 'ex_cliente']
    if (row.relationship_type && !validRelationshipTypes.includes(row.relationship_type)) {
      errors.push({
        row: index + 1,
        field: 'relationship_type',
        message: `Tipo de relación debe ser: ${validRelationshipTypes.join(', ')}`
      })
    }

    if (errors.length > 0) {
      return { client: null, errors }
    }

    const client: ParsedClient = {
      name: row.name.trim(),
      email: row.email?.trim() || undefined,
      phone: row.phone?.trim() || undefined,
      address_street: row.address_street?.trim() || undefined,
      address_city: row.address_city?.trim() || undefined,
      address_postal_code: row.address_postal_code?.trim() || undefined,
      address_country: row.address_country?.trim() || 'España',
      client_type: row.client_type?.trim() || 'particular',
      status: row.status?.trim() || 'activo',
      relationship_type: row.relationship_type?.trim() || 'prospecto',
      row: index + 1
    }

    return { client, errors: [] }
  }

  const processFile = useCallback((file: File) => {
    setIsProcessing(true)
    setUploadStatus('processing')
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validClients: ParsedClient[] = []
        const allErrors: ValidationError[] = []

        results.data.forEach((row: any, index: number) => {
          const { client, errors } = validateRow(row, index)
          
          if (client) {
            validClients.push(client)
          }
          
          allErrors.push(...errors)
        })

        setParsedData(validClients)
        setValidationErrors(allErrors)
        setIsProcessing(false)
        
        if (allErrors.length === 0) {
          toast.success(`Archivo procesado exitosamente. ${validClients.length} contactos listos para importar`)
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

  const handleUpload = async () => {
    if (parsedData.length === 0 || validationErrors.length > 0) return

    setIsProcessing(true)
    setUploadStatus('processing')
    setUploadProgress(0)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

      if (!userData?.org_id) throw new Error('Usuario sin organización')

      const batchSize = 10
      let successCount = 0

      for (let i = 0; i < parsedData.length; i += batchSize) {
        const batch = parsedData.slice(i, i + batchSize)
        
        const contactsToInsert = batch.map(client => ({
          name: client.name,
          email: client.email,
          phone: client.phone,
          address_street: client.address_street,
          address_city: client.address_city,
          address_postal_code: client.address_postal_code,
          address_country: client.address_country,
          client_type: client.client_type,
          status: client.status,
          relationship_type: client.relationship_type,
          org_id: userData.org_id
        }))

        const { error } = await supabase
          .from('contacts')
          .insert(contactsToInsert)

        if (error) throw error

        successCount += batch.length
        setUploadProgress((successCount / parsedData.length) * 100)
      }

      setUploadStatus('success')
      toast.success(`Importación exitosa: ${successCount} contactos importados correctamente`)
      
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)

    } catch (error) {
      setUploadStatus('error')
      toast.error(`Error en la importación: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '+34 123 456 789',
        address_street: 'Calle Mayor 123',
        address_city: 'Madrid',
        address_postal_code: '28001',
        address_country: 'España',
        client_type: 'particular',
        status: 'activo',
        relationship_type: 'prospecto'
      },
      {
        name: 'Empresa SL',
        email: 'contacto@empresa.com',
        phone: '+34 987 654 321',
        address_street: 'Avenida Principal 456',
        address_city: 'Barcelona',
        address_postal_code: '08001',
        address_country: 'España',
        client_type: 'empresa',
        status: 'activo',
        relationship_type: 'cliente'
      }
    ]

    const csv = Papa.unparse(template)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla_contactos.csv'
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
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importación Masiva de Contactos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h3 className="font-medium">Plantilla CSV</h3>
              <p className="text-sm text-muted-foreground">
                Descarga la plantilla para ver el formato correcto
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          </div>

          <Separator />

          {/* File Upload */}
          {uploadStatus === 'idle' && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
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
          {isProcessing && uploadStatus === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto animate-spin mb-4" />
              <p>Procesando archivo...</p>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
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
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Archivo procesado correctamente. {parsedData.length} contactos listos para importar.
                </AlertDescription>
              </Alert>

              <div className="max-h-48 overflow-y-auto border rounded p-4">
                <h4 className="font-medium mb-2">Vista previa:</h4>
                {parsedData.slice(0, 3).map((client, index) => (
                  <div key={index} className="text-sm mb-2">
                    <strong>{client.name}</strong> - {client.email} - {client.relationship_type}
                  </div>
                ))}
                {parsedData.length > 3 && (
                  <p className="text-sm text-muted-foreground">
                    ... y {parsedData.length - 3} contactos más
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadStatus === 'processing' && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importando contactos...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Success */}
          {uploadStatus === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ¡Importación completada exitosamente! Los contactos han sido agregados a tu lista.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          
          {file && uploadStatus !== 'success' && (
            <Button variant="outline" onClick={resetUpload}>
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          )}
          
          {parsedData.length > 0 && validationErrors.length === 0 && uploadStatus !== 'success' && (
            <Button onClick={handleUpload} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar {parsedData.length} contactos
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
