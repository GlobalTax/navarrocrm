import { useState, useCallback } from 'react'
import { useAbortController } from '@/hooks/performance/useAbortController'
import { usePerformanceMonitor } from '@/hooks/performance/usePerformanceMonitor'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Upload, Download, CheckCircle, AlertCircle, Loader2, Bot, Lightbulb, AlertTriangle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface AIEnhancedBulkUploadProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  dataType: 'contacts' | 'users' | 'cases' | 'proposals'
  title: string
}

interface AIValidationResult {
  validatedData: any[]
  errors: Array<{
    row: number
    field: string
    message: string
    suggestion?: string
  }>
  suggestions: Array<{
    type: 'duplicate' | 'enhancement' | 'mapping'
    message: string
    data?: any
  }>
}

export function AIEnhancedBulkUpload({ 
  open, 
  onClose, 
  onSuccess, 
  dataType, 
  title 
}: AIEnhancedBulkUploadProps) {
  const { getSignal, abort } = useAbortController()
  const { metrics } = usePerformanceMonitor('AIEnhancedBulkUpload')
  const [file, setFile] = useState<File | null>(null)
  const [rawData, setRawData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [aiValidation, setAiValidation] = useState<AIValidationResult | null>(null)
  const [isAIProcessing, setIsAIProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'ai-processing' | 'ready' | 'uploading' | 'success' | 'error'>('idle')

  const processFileWithAI = useCallback(async (file: File) => {
    setIsAIProcessing(true)
    setUploadStatus('ai-processing')
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data as any[]
          const detectedColumns = Object.keys(data[0] || {})
          
          setRawData(data)
          setColumns(detectedColumns)

          // Llamar a la IA para validación con timeout manual
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 30000)
          })

          const aiPromise = supabase.functions.invoke('ai-bulk-validate', {
            body: {
              data: data,
              dataType: dataType,
              columns: detectedColumns
            }
          })

          const { data: aiResult, error } = await Promise.race([aiPromise, timeoutPromise]) as any

          if (error) throw error

          setAiValidation(aiResult)
          setUploadStatus('ready')
          
          const errorCount = aiResult.errors?.length || 0
          const suggestionCount = aiResult.suggestions?.length || 0
          
          if (errorCount === 0) {
            toast.success(`🤖 IA procesó ${data.length} registros sin errores. ${suggestionCount} sugerencias disponibles.`)
          } else {
            toast.warning(`🤖 IA encontró ${errorCount} errores en ${data.length} registros. Revisa y corrige antes de continuar.`)
          }

        } catch (error) {
          console.error('Error en validación con IA:', error)
          setUploadStatus('error')
          toast.error('Error al procesar con IA. Revisa la consola para más detalles.')
        } finally {
          setIsAIProcessing(false)
        }
      },
      error: (error) => {
        setIsAIProcessing(false)
        setUploadStatus('error')
        toast.error(`Error al procesar archivo: ${error.message}`)
      }
    })
  }, [dataType])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFile(file)
      processFileWithAI(file)
    }
  }, [processFileWithAI])

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
    if (!aiValidation?.validatedData || aiValidation.errors.length > 0) return

    setIsUploading(true)
    setUploadStatus('uploading')
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

      for (let i = 0; i < aiValidation.validatedData.length; i += batchSize) {
        const batch = aiValidation.validatedData.slice(i, i + batchSize)
        
        const itemsToInsert = batch.map(item => ({
          ...item,
          org_id: userData.org_id
        }))

        const tableName = dataType === 'users' ? 'user_invitations' : dataType
        const { error } = await supabase
          .from(tableName)
          .insert(itemsToInsert)

        if (error) throw error

        successCount += batch.length
        setUploadProgress((successCount / aiValidation.validatedData.length) * 100)
      }

      setUploadStatus('success')
      toast.success(`🎉 Importación exitosa: ${successCount} ${dataType} procesados con IA`)
      
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)

    } catch (error) {
      setUploadStatus('error')
      toast.error(`Error en la importación: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsUploading(false)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setRawData([])
    setColumns([])
    setAiValidation(null)
    setUploadProgress(0)
    setUploadStatus('idle')
    setIsAIProcessing(false)
    setIsUploading(false)
  }

  const downloadTemplate = () => {
    const templates = {
      contacts: [
        {
          name: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '+34 123 456 789',
          address_street: 'Calle Mayor 123',
          address_city: 'Madrid',
          client_type: 'particular',
          status: 'activo',
          relationship_type: 'prospecto'
        }
      ],
      users: [
        {
          email: 'usuario@example.com',
          role: 'junior',
          send_email: 'true',
          message: 'Bienvenido al equipo'
        }
      ]
    }

    const template = templates[dataType] || templates.contacts
    const csv = Papa.unparse(template)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `plantilla_${dataType}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            {title} con IA
            <Badge variant="outline" className="ml-2">
              Potenciado por IA
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-0.5 border-blue-200">
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

          {/* File Upload */}
          {uploadStatus === 'idle' && (
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
                    La IA analizará y optimizará tus datos automáticamente
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AI Processing */}
          {isAIProcessing && (
            <Card className="border-0.5 border-primary">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Bot className="h-6 w-6 text-primary animate-pulse" />
                  <div className="flex-1">
                    <p className="font-medium">Analizando con IA...</p>
                    <p className="text-sm text-muted-foreground">
                      Validando datos, detectando errores y generando sugerencias
                    </p>
                  </div>
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Results */}
          {aiValidation && (
            <div className="space-y-4">
              {/* Summary */}
              <Card className="border-0.5 border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Análisis Completado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{aiValidation.validatedData.length}</p>
                      <p className="text-sm text-muted-foreground">Registros válidos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{aiValidation.errors.length}</p>
                      <p className="text-sm text-muted-foreground">Errores detectados</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-600">{aiValidation.suggestions.length}</p>
                      <p className="text-sm text-muted-foreground">Sugerencias de IA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Errors */}
              {aiValidation.errors.length > 0 && (
                <Card className="border-0.5 border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-5 w-5" />
                      Errores Detectados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-32 overflow-y-auto space-y-2">
                      {aiValidation.errors.slice(0, 5).map((error, index) => (
                        <div key={index} className="text-sm p-2 bg-red-50 rounded border-0.5 border-red-200">
                          <p className="font-medium text-red-700">
                            Fila {error.row}, campo {error.field}: {error.message}
                          </p>
                          {error.suggestion && (
                            <p className="text-red-600 mt-1">💡 {error.suggestion}</p>
                          )}
                        </div>
                      ))}
                      {aiValidation.errors.length > 5 && (
                        <p className="text-sm text-muted-foreground">
                          ... y {aiValidation.errors.length - 5} errores más
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Suggestions */}
              {aiValidation.suggestions.length > 0 && (
                <Card className="border-0.5 border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                      <Lightbulb className="h-5 w-5" />
                      Sugerencias de IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {aiValidation.suggestions.map((suggestion, index) => (
                        <div key={index} className="text-sm p-2 bg-amber-50 rounded border-0.5 border-amber-200 flex items-start gap-2">
                          {suggestion.type === 'duplicate' && <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />}
                          {suggestion.type === 'enhancement' && <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5" />}
                          {suggestion.type === 'mapping' && <Bot className="h-4 w-4 text-amber-600 mt-0.5" />}
                          <p className="text-amber-700">{suggestion.message}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {uploadStatus === 'uploading' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importando datos...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Success */}
          {uploadStatus === 'success' && (
            <Alert className="border-0.5 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ¡Importación completada exitosamente con IA! Los datos han sido procesados y agregados.
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
          
          {aiValidation && aiValidation.validatedData.length > 0 && aiValidation.errors.length === 0 && uploadStatus !== 'success' && (
            <Button onClick={handleUpload} disabled={isUploading} className="border-0.5 border-black rounded-[10px] hover-lift">
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Importando...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  Importar {aiValidation.validatedData.length} registros
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}