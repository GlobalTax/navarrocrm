import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import Papa from 'papaparse'

interface BulkUploadData {
  name: string
  email?: string
  phone?: string
  dni_nif?: string
  client_type?: string
  status?: string
  business_sector?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  address_country?: string
}

interface ValidationError {
  row: number
  field: string
  message: string
}

interface ClientBulkUploadProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const COLUMN_MAPPINGS = {
  name: 'Nombre *',
  email: 'Email',
  phone: 'Teléfono',
  dni_nif: 'DNI/NIF/CIF',
  client_type: 'Tipo (particular/empresa/autonomo)',
  status: 'Estado (activo/inactivo/prospecto/bloqueado)',
  business_sector: 'Sector',
  address_street: 'Dirección',
  address_city: 'Ciudad',
  address_postal_code: 'Código Postal',
  address_country: 'País'
}

export const ClientBulkUpload = ({ open, onClose, onSuccess }: ClientBulkUploadProps) => {
  const { user } = useApp()
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<BulkUploadData[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [step, setStep] = useState<'upload' | 'mapping' | 'validation' | 'processing'>('upload')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFile(file)
      parseFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  })

  const parseFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setParsedData(results.data as BulkUploadData[])
        setStep('mapping')
        
        // Auto-map columns if possible
        const headers = Object.keys(results.data[0] || {})
        const autoMapping: Record<string, string> = {}
        
        headers.forEach(header => {
          const normalizedHeader = header.toLowerCase().trim()
          if (normalizedHeader.includes('nombre') || normalizedHeader.includes('name')) {
            autoMapping[header] = 'name'
          } else if (normalizedHeader.includes('email') || normalizedHeader.includes('correo')) {
            autoMapping[header] = 'email'
          } else if (normalizedHeader.includes('telefono') || normalizedHeader.includes('phone')) {
            autoMapping[header] = 'phone'
          } else if (normalizedHeader.includes('dni') || normalizedHeader.includes('nif') || normalizedHeader.includes('cif')) {
            autoMapping[header] = 'dni_nif'
          }
        })
        
        setColumnMapping(autoMapping)
      },
      error: (error) => {
        toast.error('Error al leer el archivo: ' + error.message)
      }
    })
  }

  const validateData = () => {
    const errors: ValidationError[] = []
    const mappedData: BulkUploadData[] = []

    parsedData.forEach((row, index) => {
      const mappedRow: BulkUploadData = { name: '' }
      
      Object.entries(columnMapping).forEach(([csvColumn, dbColumn]) => {
        if (dbColumn && row[csvColumn as keyof typeof row]) {
          mappedRow[dbColumn as keyof BulkUploadData] = row[csvColumn as keyof typeof row] as string
        }
      })

      // Validaciones obligatorias
      if (!mappedRow.name || mappedRow.name.trim() === '') {
        errors.push({
          row: index + 1,
          field: 'name',
          message: 'El nombre es obligatorio'
        })
      }

      // Validación de email
      if (mappedRow.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mappedRow.email)) {
        errors.push({
          row: index + 1,
          field: 'email',
          message: 'Email inválido'
        })
      }

      // Validación de tipo de cliente
      if (mappedRow.client_type && !['particular', 'empresa', 'autonomo'].includes(mappedRow.client_type)) {
        errors.push({
          row: index + 1,
          field: 'client_type',
          message: 'Tipo de cliente debe ser: particular, empresa o autonomo'
        })
      }

      // Validación de estado
      if (mappedRow.status && !['activo', 'inactivo', 'prospecto', 'bloqueado'].includes(mappedRow.status)) {
        errors.push({
          row: index + 1,
          field: 'status',
          message: 'Estado debe ser: activo, inactivo, prospecto o bloqueado'
        })
      }

      mappedData.push(mappedRow)
    })

    setValidationErrors(errors)
    setParsedData(mappedData)
    setStep('validation')
  }

  const processUpload = async () => {
    if (!user?.org_id) {
      toast.error('Error: No se pudo identificar la organización')
      return
    }

    setIsProcessing(true)
    setStep('processing')
    setUploadProgress(0)

    try {
      const validData = parsedData.filter((_, index) => 
        !validationErrors.some(error => error.row === index + 1)
      )

      const batchSize = 10
      const batches = []
      
      for (let i = 0; i < validData.length; i += batchSize) {
        batches.push(validData.slice(i, i + batchSize))
      }

      let processedCount = 0
      const totalCount = validData.length

      for (const batch of batches) {
        const clientData = batch.map(row => ({
          name: row.name,
          email: row.email || null,
          phone: row.phone || null,
          dni_nif: row.dni_nif || null,
          client_type: row.client_type || 'particular',
          status: row.status || 'prospecto',
          business_sector: row.business_sector || null,
          address_street: row.address_street || null,
          address_city: row.address_city || null,
          address_postal_code: row.address_postal_code || null,
          address_country: row.address_country || 'España',
          org_id: user.org_id,
          contact_preference: 'email',
          preferred_language: 'es',
          payment_method: 'transferencia',
          last_contact_date: new Date().toISOString()
        }))

        const { error } = await supabase
          .from('clients')
          .insert(clientData)

        if (error) {
          console.error('Error inserting batch:', error)
          toast.error(`Error al procesar lote: ${error.message}`)
          continue
        }

        processedCount += batch.length
        setUploadProgress((processedCount / totalCount) * 100)
      }

      toast.success(`Se han importado ${processedCount} clientes exitosamente`)
      onSuccess()
      handleClose()

    } catch (error) {
      console.error('Error during bulk upload:', error)
      toast.error('Error durante la importación masiva')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setParsedData([])
    setColumnMapping({})
    setValidationErrors([])
    setUploadProgress(0)
    setStep('upload')
    setIsProcessing(false)
    onClose()
  }

  const downloadTemplate = () => {
    const csvContent = Object.values(COLUMN_MAPPINGS).join(',') + '\n' +
      'Juan Pérez,juan@email.com,666123456,12345678A,particular,activo,Tecnología,Calle Mayor 1,Madrid,28001,España'
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = 'plantilla_clientes.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importación Masiva de Clientes</DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Sube un archivo CSV o Excel con los datos de tus clientes
              </p>
              <Button variant="outline" onClick={downloadTemplate}>
                <FileText className="h-4 w-4 mr-2" />
                Descargar Plantilla
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  {isDragActive ? (
                    <p className="text-lg">Suelta el archivo aquí...</p>
                  ) : (
                    <div>
                      <p className="text-lg mb-2">
                        Arrastra y suelta tu archivo aquí, o haz clic para seleccionar
                      </p>
                      <p className="text-sm text-gray-500">
                        Formatos soportados: CSV, XLS, XLSX
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Mapeo de Columnas</h3>
              <p className="text-gray-600">
                Asocia las columnas de tu archivo con los campos de la base de datos
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.keys(parsedData[0] || {}).map((csvColumn) => (
                <div key={csvColumn} className="space-y-2">
                  <label className="text-sm font-medium">{csvColumn}</label>
                  <Select
                    value={columnMapping[csvColumn] || ''}
                    onValueChange={(value) =>
                      setColumnMapping(prev => ({ ...prev, [csvColumn]: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar campo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No mapear</SelectItem>
                      {Object.entries(COLUMN_MAPPINGS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Volver
              </Button>
              <Button onClick={validateData}>
                Validar Datos
              </Button>
            </div>
          </div>
        )}

        {step === 'validation' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Validación de Datos</h3>
                <p className="text-gray-600">
                  {validationErrors.length === 0
                    ? `${parsedData.length} registros listos para importar`
                    : `${validationErrors.length} errores encontrados`
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant={validationErrors.length === 0 ? "default" : "destructive"}>
                  {validationErrors.length === 0 ? (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-1" />
                  )}
                  {validationErrors.length === 0 ? 'Válido' : 'Con errores'}
                </Badge>
              </div>
            </div>

            {validationErrors.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Se encontraron errores en los datos. Los registros con errores no se importarán.
                </AlertDescription>
              </Alert>
            )}

            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fila</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Errores</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 20).map((row, index) => {
                    const rowErrors = validationErrors.filter(error => error.row === index + 1)
                    return (
                      <TableRow key={index} className={rowErrors.length > 0 ? 'bg-red-50' : ''}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.email || '-'}</TableCell>
                        <TableCell>
                          {rowErrors.length === 0 ? (
                            <Badge className="bg-green-100 text-green-800">Válido</Badge>
                          ) : (
                            <Badge variant="destructive">Error</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {rowErrors.length > 0 && (
                            <div className="space-y-1">
                              {rowErrors.map((error, i) => (
                                <div key={i} className="text-xs text-red-600">
                                  {error.field}: {error.message}
                                </div>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStep('mapping')}>
                Volver
              </Button>
              <Button 
                onClick={processUpload}
                disabled={parsedData.length === 0}
              >
                Importar Clientes ({parsedData.length - validationErrors.length})
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="space-y-6 text-center">
            <div>
              <h3 className="text-lg font-medium mb-2">Procesando Importación</h3>
              <p className="text-gray-600">Por favor espera mientras importamos los clientes...</p>
            </div>

            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-500">{Math.round(uploadProgress)}% completado</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
