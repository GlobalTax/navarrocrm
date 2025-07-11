import { useState, useCallback, ReactNode } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { X, Upload, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'

export interface BulkUploadConfig {
  dataType: string
  title: string
  tableName: string
  batchSize?: number
  templateData: any[]
  validator: (row: any, index: number) => { data: any | null; errors: ValidationError[] }
  processor: (validatedData: any[], orgId: string) => Promise<number>
}

export interface ValidationError {
  row: number
  field: string
  message: string
  suggestion?: string
}

export interface BulkUploadState {
  file: File | null
  rawData: any[]
  columns: string[]
  parsedData: any[]
  validationErrors: ValidationError[]
  isProcessing: boolean
  uploadProgress: number
  uploadStatus: 'idle' | 'processing' | 'success' | 'error'
}

interface BaseBulkUploadDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  config: BulkUploadConfig
  children?: ReactNode
  customValidationDisplay?: (errors: ValidationError[]) => ReactNode
  customPreviewDisplay?: (data: any[]) => ReactNode
}

export function BaseBulkUploadDialog({
  open,
  onClose,
  onSuccess,
  config,
  children,
  customValidationDisplay,
  customPreviewDisplay
}: BaseBulkUploadDialogProps) {
  const [state, setState] = useState<BulkUploadState>({
    file: null,
    rawData: [],
    columns: [],
    parsedData: [],
    validationErrors: [],
    isProcessing: false,
    uploadProgress: 0,
    uploadStatus: 'idle'
  })

  const updateState = (updates: Partial<BulkUploadState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const processFile = useCallback((file: File) => {
    updateState({ isProcessing: true, uploadStatus: 'processing' })
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as any[]
          const detectedColumns = Object.keys(data[0] || {})
          
          const validatedData: any[] = []
          const allErrors: ValidationError[] = []

          data.forEach((row: any, index: number) => {
            const { data: validRow, errors } = config.validator(row, index)
            
            if (validRow) {
              validatedData.push(validRow)
            }
            
            allErrors.push(...errors)
          })

          updateState({
            rawData: data,
            columns: detectedColumns,
            parsedData: validatedData,
            validationErrors: allErrors,
            isProcessing: false
          })
          
          if (allErrors.length === 0) {
            toast.success(`Archivo procesado exitosamente. ${validatedData.length} registros listos para importar`)
          } else {
            toast.error(`Errores de validación encontrados: ${allErrors.length} errores que deben corregirse`)
          }

        } catch (error) {
          console.error('Error procesando archivo:', error)
          updateState({ uploadStatus: 'error', isProcessing: false })
          toast.error('Error al procesar archivo. Revisa la consola para más detalles.')
        }
      },
      error: (error) => {
        updateState({ isProcessing: false, uploadStatus: 'error' })
        toast.error(`Error al procesar archivo: ${error.message}`)
      }
    })
  }, [config.validator])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      updateState({ file })
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
    if (state.parsedData.length === 0 || state.validationErrors.length > 0) return

    updateState({ isProcessing: true, uploadStatus: 'processing', uploadProgress: 0 })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

      if (!userData?.org_id) throw new Error('Usuario sin organización')

      const successCount = await config.processor(state.parsedData, userData.org_id)

      updateState({ uploadStatus: 'success' })
      toast.success(`🎉 Importación exitosa: ${successCount} ${config.dataType} procesados`)
      
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)

    } catch (error) {
      updateState({ uploadStatus: 'error' })
      toast.error(`Error en la importación: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      updateState({ isProcessing: false })
    }
  }

  const resetUpload = () => {
    setState({
      file: null,
      rawData: [],
      columns: [],
      parsedData: [],
      validationErrors: [],
      uploadProgress: 0,
      uploadStatus: 'idle',
      isProcessing: false
    })
  }

  const downloadTemplate = () => {
    const csv = Papa.unparse(config.templateData)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `plantilla_${config.dataType}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto border-0.5 border-black rounded-[10px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-[10px] border-0.5 border-blue-200">
            <div>
              <h3 className="font-medium">Plantilla CSV</h3>
              <p className="text-sm text-muted-foreground">
                Descarga la plantilla para ver el formato correcto
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate} className="border-0.5 border-black rounded-[10px]">
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          </div>

          <Separator />

          {/* Custom content area */}
          {children}

          {/* File Upload */}
          {state.uploadStatus === 'idle' && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-[10px] p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
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
          {state.isProcessing && state.uploadStatus === 'processing' && state.uploadProgress === 0 && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto animate-spin mb-4" />
              <p>Procesando archivo...</p>
            </div>
          )}

          {/* Validation Errors */}
          {state.validationErrors.length > 0 && (
            customValidationDisplay ? customValidationDisplay(state.validationErrors) : (
              <Alert variant="destructive" className="border-0.5 border-red-300 rounded-[10px]">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Se encontraron {state.validationErrors.length} errores:</p>
                    <div className="max-h-32 overflow-y-auto">
                      {state.validationErrors.slice(0, 5).map((error, index) => (
                        <p key={index} className="text-sm">
                          Fila {error.row}, campo {error.field}: {error.message}
                        </p>
                      ))}
                      {state.validationErrors.length > 5 && (
                        <p className="text-sm">... y {state.validationErrors.length - 5} errores más</p>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )
          )}

          {/* Preview */}
          {state.parsedData.length > 0 && state.validationErrors.length === 0 && (
            customPreviewDisplay ? customPreviewDisplay(state.parsedData) : (
              <div className="space-y-4">
                <Alert className="border-0.5 border-green-300 rounded-[10px]">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Archivo procesado correctamente. {state.parsedData.length} registros listos para importar.
                  </AlertDescription>
                </Alert>

                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-[10px] p-4">
                  <h4 className="font-medium mb-2">Vista previa:</h4>
                  {state.parsedData.slice(0, 3).map((item, index) => (
                    <div key={index} className="text-sm mb-2">
                      <strong>{JSON.stringify(item).substring(0, 100)}...</strong>
                    </div>
                  ))}
                  {state.parsedData.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                      ... y {state.parsedData.length - 3} registros más
                    </p>
                  )}
                </div>
              </div>
            )
          )}

          {/* Upload Progress */}
          {state.uploadStatus === 'processing' && state.uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importando datos...</span>
                <span>{Math.round(state.uploadProgress)}%</span>
              </div>
              <Progress value={state.uploadProgress} className="h-2" />
            </div>
          )}

          {/* Success */}
          {state.uploadStatus === 'success' && (
            <Alert className="border-0.5 border-green-300 rounded-[10px]">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ¡Importación completada exitosamente! Los datos han sido procesados y agregados.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="border-0.5 border-black rounded-[10px]">
            Cancelar
          </Button>
          
          {state.file && state.uploadStatus !== 'success' && (
            <Button variant="outline" onClick={resetUpload} className="border-0.5 border-black rounded-[10px]">
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          )}
          
          {state.parsedData.length > 0 && state.validationErrors.length === 0 && state.uploadStatus !== 'success' && (
            <Button onClick={handleUpload} disabled={state.isProcessing} className="border-0.5 border-black rounded-[10px] hover-lift">
              {state.isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar {state.parsedData.length} registros
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}