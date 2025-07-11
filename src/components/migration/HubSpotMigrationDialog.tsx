import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  X, Upload, Download, CheckCircle, AlertCircle, Loader2, Bot, 
  Lightbulb, AlertTriangle, Users, FileText, Settings, Database,
  HelpCircle, ArrowRight, Eye
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface HubSpotMigrationDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface HubSpotValidationResult {
  validatedData: any[]
  errors: Array<{
    row: number
    field: string
    message: string
    suggestion?: string
  }>
  suggestions: Array<{
    type: 'duplicate' | 'enhancement' | 'mapping' | 'hubspot'
    message: string
    data?: any
  }>
  duplicates: Array<{
    row: number
    existingContact: any
    matchType: 'email' | 'phone' | 'name'
    confidence: number
  }>
  hubspotMetadata: {
    originalCount: number
    companiesDetected: number
    contactsDetected: number
    dateRange?: { from: string, to: string }
  }
}

interface MigrationSettings {
  batchSize: number
  duplicateStrategy: 'skip' | 'merge' | 'create_new'
  preserveDates: boolean
  importNotes: boolean
  mapLifecycleStage: boolean
  addHubspotTag: boolean
  migrationType: 'contacts_only' | 'companies_only' | 'both'
}

const HUBSPOT_FIELD_MAPPING = {
  // Campos básicos de contacto
  'First Name': 'name',
  'firstname': 'name', 
  'Last Name': 'last_name',
  'lastname': 'last_name',
  'Email': 'email',
  'email': 'email',
  'Phone Number': 'phone',
  'phone': 'phone',
  'mobilephone': 'phone',
  
  // Campos de empresa
  'Company Name': 'name',
  'company': 'name',
  'Company': 'name',
  'Website': 'website',
  'website': 'website',
  
  // Dirección
  'Address': 'address_street',
  'address': 'address_street',
  'City': 'address_city',
  'city': 'address_city',
  'State/Region': 'address_state',
  'state': 'address_state',
  'Postal Code': 'address_postal_code',
  'zip': 'address_postal_code',
  'Country': 'address_country',
  'country': 'address_country',
  
  // Campos específicos de HubSpot
  'Lifecycle Stage': 'relationship_type',
  'lifecyclestage': 'relationship_type',
  'Lead Status': 'status',
  'leadstatus': 'status',
  'Create Date': 'created_at',
  'createdate': 'created_at',
  'Last Modified Date': 'updated_at',
  'lastmodifieddate': 'updated_at',
  'Last Activity Date': 'last_contact_date',
  'notes_last_contacted': 'last_contact_date',
  
  // Campos adicionales
  'Job Title': 'job_title',
  'jobtitle': 'job_title',
  'Industry': 'business_sector',
  'industry': 'business_sector',
  'Annual Revenue': 'annual_revenue',
  'annualrevenue': 'annual_revenue'
}

const LIFECYCLE_STAGE_MAPPING = {
  'subscriber': 'prospecto',
  'lead': 'prospecto', 
  'marketingqualifiedlead': 'prospecto',
  'salesqualifiedlead': 'cliente',
  'opportunity': 'cliente',
  'customer': 'cliente',
  'evangelist': 'cliente',
  'other': 'prospecto'
}

export function HubSpotMigrationDialog({ open, onClose, onSuccess }: HubSpotMigrationDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [rawData, setRawData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [validation, setValidation] = useState<HubSpotValidationResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'preview' | 'uploading' | 'success' | 'error'>('idle')
  const [activeTab, setActiveTab] = useState('upload')
  
  // Configuración de migración
  const [settings, setSettings] = useState<MigrationSettings>({
    batchSize: 25,
    duplicateStrategy: 'skip',
    preserveDates: true,
    importNotes: false,
    mapLifecycleStage: true,
    addHubspotTag: true,
    migrationType: 'both'
  })

  const [previewData, setPreviewData] = useState<any[]>([])

  const processHubSpotFile = useCallback(async (file: File) => {
    setIsProcessing(true)
    setUploadStatus('processing')
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data as any[]
          const detectedColumns = Object.keys(data[0] || {})
          
          setRawData(data)
          setColumns(detectedColumns)

          // Procesar datos específicamente para HubSpot
          const processedData = data.map((row, index) => {
            const mappedRow: any = { 
              _original_row: index + 1,
              _source: 'hubspot',
              org_id: null // Se asignará durante la importación
            }
            
            // Mapear campos usando el diccionario de HubSpot
            Object.entries(row).forEach(([key, value]) => {
              const mappedField = HUBSPOT_FIELD_MAPPING[key] || HUBSPOT_FIELD_MAPPING[key.toLowerCase()]
              if (mappedField && value && value !== '') {
                if (mappedField === 'name' && mappedRow.name) {
                  // Si ya hay un nombre, combinar con apellido
                  mappedRow.name = `${mappedRow.name} ${value}`.trim()
                } else if (mappedField === 'relationship_type' && settings.mapLifecycleStage) {
                  // Mapear lifecycle stage de HubSpot
                  const valueStr = typeof value === 'string' ? value : String(value)
                  mappedRow[mappedField] = LIFECYCLE_STAGE_MAPPING[valueStr.toLowerCase()] || 'prospecto'
                } else {
                  mappedRow[mappedField] = value
                }
              }
              
              // Preservar campos originales para referencia
              mappedRow[`_hubspot_${key.toLowerCase()}`] = value
            })

            // Agregar etiqueta de HubSpot si está configurado
            if (settings.addHubspotTag) {
              mappedRow.tags = ['migrado_hubspot', `hubspot_${new Date().toISOString().split('T')[0]}`]
            }

            // Determinar tipo de entidad
            if (row['Company Name'] || row['company']) {
              mappedRow.client_type = 'empresa'
            } else {
              mappedRow.client_type = 'particular'
            }

            // Valores por defecto
            mappedRow.status = mappedRow.status || 'activo'
            mappedRow.relationship_type = mappedRow.relationship_type || 'prospecto'
            mappedRow.contact_preference = 'email'
            mappedRow.preferred_language = 'es'
            mappedRow.address_country = mappedRow.address_country || 'España'

            return mappedRow
          })

          // Análisis de duplicados y validación
          const { data: existingContacts } = await supabase
            .from('contacts')
            .select('id, name, email, phone')

          const duplicates: any[] = []
          const errors: any[] = []
          const validatedData: any[] = []

          processedData.forEach((row, index) => {
            // Validaciones básicas
            if (!row.name && !row.email) {
              errors.push({
                row: index + 1,
                field: 'name/email',
                message: 'Debe tener al menos nombre o email',
                suggestion: 'Verifica que los campos de nombre o email estén mapeados correctamente'
              })
              return
            }

            // Detección de duplicados
            if (existingContacts) {
              const duplicate = existingContacts.find(existing => 
                (existing.email && row.email && existing.email.toLowerCase() === row.email.toLowerCase()) ||
                (existing.phone && row.phone && existing.phone === row.phone) ||
                (existing.name && row.name && existing.name.toLowerCase() === row.name.toLowerCase())
              )

              if (duplicate) {
                const matchType = 
                  duplicate.email === row.email ? 'email' :
                  duplicate.phone === row.phone ? 'phone' : 'name'
                
                duplicates.push({
                  row: index + 1,
                  existingContact: duplicate,
                  matchType,
                  confidence: matchType === 'email' ? 0.95 : matchType === 'phone' ? 0.85 : 0.70
                })

                if (settings.duplicateStrategy === 'skip') {
                  return // No agregar a validatedData
                }
              }
            }

            validatedData.push(row)
          })

          // Crear metadata de HubSpot
          const hubspotMetadata = {
            originalCount: data.length,
            companiesDetected: processedData.filter(row => row.client_type === 'empresa').length,
            contactsDetected: processedData.filter(row => row.client_type === 'particular').length,
            dateRange: undefined // Podríamos calcular esto si hay fechas
          }

          const suggestions: Array<{
            type: 'duplicate' | 'enhancement' | 'mapping' | 'hubspot'
            message: string
            data?: any
          }> = [
            {
              type: 'hubspot',
              message: `Se detectaron ${hubspotMetadata.companiesDetected} empresas y ${hubspotMetadata.contactsDetected} contactos`
            }
          ]

          if (duplicates.length > 0) {
            suggestions.push({
              type: 'duplicate',
              message: `Se encontraron ${duplicates.length} posibles duplicados. Revisa la estrategia de duplicados.`
            })
          }

          const validationResult: HubSpotValidationResult = {
            validatedData,
            errors,
            suggestions,
            duplicates,
            hubspotMetadata
          }

          setValidation(validationResult)
          setPreviewData(validatedData.slice(0, 10)) // Mostrar primeros 10 para preview
          setUploadStatus('preview')
          
          if (errors.length === 0) {
            toast.success(`🎯 HubSpot: ${validatedData.length} registros listos para migrar`)
          } else {
            toast.warning(`⚠️ Se encontraron ${errors.length} errores. Revisa antes de continuar.`)
          }

        } catch (error) {
          console.error('Error procesando archivo de HubSpot:', error)
          setUploadStatus('error')
          toast.error('Error al procesar archivo de HubSpot')
        } finally {
          setIsProcessing(false)
        }
      },
      error: (error) => {
        setIsProcessing(false)
        setUploadStatus('error')
        toast.error(`Error al leer archivo: ${error.message}`)
      }
    })
  }, [settings])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFile(file)
      processHubSpotFile(file)
    }
  }, [processHubSpotFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  })

  const handleMigration = async () => {
    if (!validation?.validatedData || validation.errors.length > 0) return

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

      const totalItems = validation.validatedData.length
      let processedCount = 0

      // Procesar en lotes
      for (let i = 0; i < totalItems; i += settings.batchSize) {
        const batch = validation.validatedData.slice(i, i + settings.batchSize)
        
        const itemsToInsert = batch.map(item => {
          const cleanItem = { ...item }
          
          // Remover campos internos
          Object.keys(cleanItem).forEach(key => {
            if (key.startsWith('_')) {
              delete cleanItem[key]
            }
          })
          
          return {
            ...cleanItem,
            org_id: userData.org_id
          }
        })

        const { error } = await supabase
          .from('contacts')
          .insert(itemsToInsert)

        if (error) throw error

        processedCount += batch.length
        setUploadProgress((processedCount / totalItems) * 100)

        // Pequeña pausa entre lotes para no sobrecargar
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      setUploadStatus('success')
      toast.success(`🎉 Migración HubSpot completada: ${processedCount} contactos importados`)
      
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)

    } catch (error) {
      setUploadStatus('error')
      toast.error(`Error en migración: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsUploading(false)
    }
  }

  const resetMigration = () => {
    setFile(null)
    setRawData([])
    setColumns([])
    setValidation(null)
    setPreviewData([])
    setUploadProgress(0)
    setUploadStatus('idle')
    setIsProcessing(false)
    setIsUploading(false)
    setActiveTab('upload')
  }

  const downloadHubSpotTemplate = () => {
    const template = [
      {
        'First Name': 'Juan',
        'Last Name': 'Pérez',
        'Email': 'juan.perez@ejemplo.com',
        'Phone Number': '+34 123 456 789',
        'Company Name': 'Empresa Ejemplo S.L.',
        'Job Title': 'Director General',
        'Lifecycle Stage': 'customer',
        'Address': 'Calle Mayor 123',
        'City': 'Madrid',
        'Postal Code': '28001',
        'Country': 'Spain',
        'Industry': 'Tecnología',
        'Create Date': '2024-01-15',
        'Last Activity Date': '2024-01-20'
      }
    ]

    const csv = Papa.unparse(template)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla_hubspot_migracion.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-orange-600" />
            Migración desde HubSpot
            <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700 border-orange-200">
              Especializado
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">📁 Subir Datos</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Configuración</TabsTrigger>
            <TabsTrigger value="preview">👁️ Vista Previa</TabsTrigger>
            <TabsTrigger value="migrate">🚀 Migrar</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {/* Template Download */}
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border-0.5 border-orange-200">
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Plantilla HubSpot
                </h3>
                <p className="text-sm text-muted-foreground">
                  Formato optimizado para datos exportados desde HubSpot
                </p>
              </div>
              <Button variant="outline" onClick={downloadHubSpotTemplate} className="border-0.5 border-orange-300 text-orange-700 rounded-[10px]">
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
                  isDragActive ? 'border-orange-400 bg-orange-50' : 'border-gray-300'
                }`}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Suelta tu exportación de HubSpot aquí...</p>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p>Arrastra tu archivo CSV de HubSpot aquí</p>
                    <p className="text-sm text-muted-foreground">
                      Sistema especializado para migración desde HubSpot
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Processing */}
            {isProcessing && (
              <Card className="border-0.5 border-orange-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Database className="h-6 w-6 text-orange-600 animate-pulse" />
                    <div className="flex-1">
                      <p className="font-medium">Procesando datos de HubSpot...</p>
                      <p className="text-sm text-muted-foreground">
                        Mapeando campos, detectando duplicados y validando datos
                      </p>
                    </div>
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración de Migración
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tamaño de lote</Label>
                    <Select value={settings.batchSize.toString()} onValueChange={(value) => 
                      setSettings(prev => ({ ...prev, batchSize: parseInt(value) }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 registros</SelectItem>
                        <SelectItem value="25">25 registros (recomendado)</SelectItem>
                        <SelectItem value="50">50 registros</SelectItem>
                        <SelectItem value="100">100 registros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Estrategia para duplicados</Label>
                    <Select value={settings.duplicateStrategy} onValueChange={(value: any) => 
                      setSettings(prev => ({ ...prev, duplicateStrategy: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skip">Omitir duplicados</SelectItem>
                        <SelectItem value="create_new">Crear como nuevo</SelectItem>
                        <SelectItem value="merge">Fusionar (próximamente)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="preserveDates" 
                      checked={settings.preserveDates}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, preserveDates: !!checked }))
                      }
                    />
                    <Label htmlFor="preserveDates">Preservar fechas originales de HubSpot</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mapLifecycle" 
                      checked={settings.mapLifecycleStage}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, mapLifecycleStage: !!checked }))
                      }
                    />
                    <Label htmlFor="mapLifecycle">Mapear Lifecycle Stage a tipo de relación</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="addTag" 
                      checked={settings.addHubspotTag}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, addHubspotTag: !!checked }))
                      }
                    />
                    <Label htmlFor="addTag">Agregar etiqueta "migrado_hubspot"</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {validation && (
              <>
                {/* Summary */}
                <Card className="border-0.5 border-orange-200 bg-orange-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                      Resumen de Migración HubSpot
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-orange-600">{validation.hubspotMetadata.contactsDetected}</p>
                        <p className="text-sm text-muted-foreground">Contactos</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-orange-600">{validation.hubspotMetadata.companiesDetected}</p>
                        <p className="text-sm text-muted-foreground">Empresas</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">{validation.duplicates.length}</p>
                        <p className="text-sm text-muted-foreground">Duplicados</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{validation.validatedData.length}</p>
                        <p className="text-sm text-muted-foreground">Listos para migrar</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Preview Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Vista previa (primeros 10 registros)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Nombre</th>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Teléfono</th>
                            <th className="text-left p-2">Tipo</th>
                            <th className="text-left p-2">Relación</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((row, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{row.name || '-'}</td>
                              <td className="p-2">{row.email || '-'}</td>
                              <td className="p-2">{row.phone || '-'}</td>
                              <td className="p-2">
                                <Badge variant="outline">
                                  {row.client_type === 'empresa' ? 'Empresa' : 'Particular'}
                                </Badge>
                              </td>
                              <td className="p-2">{row.relationship_type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Duplicates */}
                {validation.duplicates.length > 0 && (
                  <Card className="border-0.5 border-amber-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-700">
                        <AlertTriangle className="h-5 w-5" />
                        Duplicados Detectados ({validation.duplicates.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {validation.duplicates.slice(0, 5).map((duplicate, index) => (
                          <div key={index} className="text-sm p-2 bg-amber-50 rounded border-0.5 border-amber-200">
                            <p className="font-medium">
                              Fila {duplicate.row}: Coincidencia por {duplicate.matchType} 
                              <Badge variant="outline" className="ml-2">
                                {Math.round(duplicate.confidence * 100)}% confianza
                              </Badge>
                            </p>
                            <p className="text-amber-700">
                              Contacto existente: {duplicate.existingContact.name || duplicate.existingContact.email}
                            </p>
                          </div>
                        ))}
                        {validation.duplicates.length > 5 && (
                          <p className="text-sm text-muted-foreground">
                            ... y {validation.duplicates.length - 5} duplicados más
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="migrate" className="space-y-6">
            {validation && (
              <>
                {/* Final Review */}
                <Card className="border-0.5 border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowRight className="h-5 w-5 text-green-600" />
                      Confirmar Migración
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p>Se migrarán <strong>{validation.validatedData.length} registros</strong> desde HubSpot:</p>
                      <ul className="text-sm space-y-1">
                        <li>• {validation.hubspotMetadata.contactsDetected} contactos</li>
                        <li>• {validation.hubspotMetadata.companiesDetected} empresas</li>
                        <li>• Lotes de {settings.batchSize} registros</li>
                        <li>• Estrategia duplicados: {settings.duplicateStrategy}</li>
                        {settings.addHubspotTag && <li>• Se agregará etiqueta "migrado_hubspot"</li>}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Upload Progress */}
                {uploadStatus === 'uploading' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Migrando desde HubSpot...</span>
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
                      ¡Migración desde HubSpot completada exitosamente! Los contactos han sido importados.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-between">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="border-0.5 border-black rounded-[10px]">
              Cancelar
            </Button>
            
            {file && uploadStatus !== 'success' && (
              <Button variant="outline" onClick={resetMigration} className="border-0.5 border-black rounded-[10px]">
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            {activeTab === 'upload' && validation && (
              <Button onClick={() => setActiveTab('settings')} className="border-0.5 border-black rounded-[10px]">
                Siguiente: Configuración
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {activeTab === 'settings' && validation && (
              <Button onClick={() => setActiveTab('preview')} className="border-0.5 border-black rounded-[10px]">
                Siguiente: Vista Previa
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {activeTab === 'preview' && validation && (
              <Button onClick={() => setActiveTab('migrate')} className="border-0.5 border-black rounded-[10px]">
                Siguiente: Migrar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {activeTab === 'migrate' && validation && validation.validatedData.length > 0 && validation.errors.length === 0 && uploadStatus !== 'success' && (
              <Button onClick={handleMigration} disabled={isUploading} className="border-0.5 border-black rounded-[10px] hover-lift bg-orange-600 text-white hover:bg-orange-700">
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Migrando...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Migrar {validation.validatedData.length} registros
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}