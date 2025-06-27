import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useBulkTaskOperations } from '@/hooks/tasks/useBulkTaskOperations'
import { TaskInsert } from '@/hooks/tasks/types'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  X
} from 'lucide-react'

interface CSVRow {
  titulo: string
  descripcion?: string
  prioridad?: string
  estado?: string
  horas_estimadas?: string
  [key: string]: any
}

export const CSVTaskImporter = () => {
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [importProgress, setImportProgress] = useState(0)
  
  const { createBulkTasks } = useBulkTaskOperations()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFile(file)
      parseCSV(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1
  })

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as CSVRow[]
        setCsvData(data)
        validateData(data)
      },
      error: (error) => {
        console.error('Error parsing CSV:', error)
        setValidationErrors([`Error al leer el archivo: ${error.message}`])
      }
    })
  }

  const validateData = (data: CSVRow[]) => {
    const errors: string[] = []
    
    if (data.length === 0) {
      errors.push('El archivo está vacío')
      setValidationErrors(errors)
      return
    }

    // Validar columnas requeridas
    const requiredColumns = ['titulo']
    const firstRow = data[0]
    const columns = Object.keys(firstRow)
    
    requiredColumns.forEach(col => {
      if (!columns.includes(col)) {
        errors.push(`Columna requerida faltante: ${col}`)
      }
    })

    // Validar datos
    data.forEach((row, index) => {
      if (!row.titulo?.trim()) {
        errors.push(`Fila ${index + 2}: El título es obligatorio`)
      }
      
      if (row.prioridad && !['low', 'medium', 'high', 'urgent', 'baja', 'media', 'alta', 'urgente'].includes(row.prioridad.toLowerCase())) {
        errors.push(`Fila ${index + 2}: Prioridad inválida (debe ser: baja, media, alta, urgente)`)
      }
      
      if (row.estado && !['pending', 'in_progress', 'completed', 'pendiente', 'en_progreso', 'completada'].includes(row.estado.toLowerCase())) {
        errors.push(`Fila ${index + 2}: Estado inválido (debe ser: pendiente, en_progreso, completada)`)
      }
      
      if (row.horas_estimadas && isNaN(parseFloat(row.horas_estimadas))) {
        errors.push(`Fila ${index + 2}: Horas estimadas debe ser un número`)
      }
    })

    setValidationErrors(errors)
  }

  const mapPriority = (priority?: string): 'low' | 'medium' | 'high' | 'urgent' => {
    if (!priority) return 'medium'
    
    const p = priority.toLowerCase()
    switch (p) {
      case 'baja': case 'low': return 'low'
      case 'alta': case 'high': return 'high'
      case 'urgente': case 'urgent': return 'urgent'
      default: return 'medium'
    }
  }

  const mapStatus = (status?: string): 'pending' | 'in_progress' | 'completed' => {
    if (!status) return 'pending'
    
    const s = status.toLowerCase()
    switch (s) {
      case 'en_progreso': case 'in_progress': return 'in_progress'
      case 'completada': case 'completed': return 'completed'
      default: return 'pending'
    }
  }

  const handleImport = async () => {
    if (validationErrors.length > 0) return
    
    try {
      setImportProgress(0)
      
      const tasks: TaskInsert[] = csvData.map((row, index) => {
        setImportProgress((index / csvData.length) * 50) // 50% for mapping
        
        return {
          title: row.titulo.trim(),
          description: row.descripcion?.trim() || null,
          priority: mapPriority(row.prioridad),
          status: mapStatus(row.estado),
          estimated_hours: row.horas_estimadas ? parseFloat(row.horas_estimadas) : 1,
          case_id: null,
          contact_id: null,
          due_date: null,
          created_by: '', // Se asignará en el hook
          org_id: '' // Se asignará en el hook
        }
      })
      
      setImportProgress(50)
      
      await createBulkTasks.mutateAsync({
        tasks,
        operation_name: `Importación CSV: ${file?.name}`
      })
      
      setImportProgress(100)
      
      // Reset
      setTimeout(() => {
        setFile(null)
        setCsvData([])
        setValidationErrors([])
        setImportProgress(0)
      }, 2000)
      
    } catch (error) {
      console.error('Error importing tasks:', error)
      setImportProgress(0)
    }
  }

  const downloadTemplate = () => {
    const template = `titulo,descripcion,prioridad,estado,horas_estimadas
Revisar documento legal,Revisar contrato de arrendamiento,alta,pendiente,2
Llamar cliente,Seguimiento del caso ABC,media,pendiente,0.5
Preparar informe,Informe mensual de actividades,media,pendiente,4`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla-tareas.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Importar Tareas desde CSV</h3>
          <p className="text-sm text-gray-600">
            Sube un archivo CSV con tus tareas para importarlas masivamente
          </p>
        </div>
        
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Descargar Plantilla
        </Button>
      </div>

      {/* File Upload */}
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <input {...getInputProps()} />
            
            <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            
            {isDragActive ? (
              <p className="text-blue-600">Suelta el archivo aquí...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Arrastra tu archivo CSV aquí, o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-500">
                  Formatos soportados: .csv (máximo 1000 filas)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Info & Validation */}
      {file && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Archivo Seleccionado</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null)
                  setCsvData([])
                  setValidationErrors([])
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-600">
                {csvData.length} filas detectadas
              </p>
            </div>

            {validationErrors.length > 0 ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Errores de validación:</p>
                    <ul className="list-disc list-inside text-sm">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            ) : csvData.length > 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Archivo válido. {csvData.length} tareas listas para importar.
                </AlertDescription>
              </Alert>
            ) : null}

            {importProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Importando...</span>
                  <span className="text-sm">{importProgress}%</span>
                </div>
                <Progress value={importProgress} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {csvData.length > 0 && validationErrors.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vista Previa</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {csvData.slice(0, 10).map((row, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{row.titulo}</h4>
                      {row.descripcion && (
                        <p className="text-sm text-gray-600">{row.descripcion}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {mapPriority(row.prioridad)}
                      </Badge>
                      <Badge variant="outline">
                        {mapStatus(row.estado)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              
              {csvData.length > 10 && (
                <p className="text-center text-sm text-gray-500 py-2">
                  ... y {csvData.length - 10} tareas más
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-4 mt-6">
              <Button
                onClick={handleImport}
                disabled={validationErrors.length > 0 || createBulkTasks.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                {createBulkTasks.isPending ? 'Importando...' : `Importar ${csvData.length} Tareas`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Formato del CSV</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Columnas obligatorias:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code>titulo</code> - Título de la tarea (obligatorio)</li>
            </ul>
            
            <p><strong>Columnas opcionales:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code>descripcion</code> - Descripción detallada</li>
              <li><code>prioridad</code> - baja, media, alta, urgente</li>
              <li><code>estado</code> - pendiente, en_progreso, completada</li>
              <li><code>horas_estimadas</code> - Número decimal (ej: 2.5)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
