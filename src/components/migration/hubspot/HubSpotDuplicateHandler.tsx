import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Users2, RefreshCw, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { HubSpotValidationData } from '@/components/bulk-upload/hooks/useBulkUploadValidators'

interface DuplicateMatch {
  hubspotRecord: HubSpotValidationData
  existingRecord: {
    id: string
    name: string
    email: string
    phone?: string
    company?: string
    created_at: string
  }
  similarityScore: number
  matchingFields: string[]
  conflictingFields: Array<{
    field: string
    hubspotValue: any
    existingValue: any
  }>
}

interface DuplicateResolution {
  duplicateId: string
  action: 'skip' | 'update' | 'create_new' | 'merge'
  fieldsToUpdate?: string[]
}

interface HubSpotDuplicateHandlerProps {
  duplicates: DuplicateMatch[]
  onResolutionsChange: (resolutions: DuplicateResolution[]) => void
  defaultStrategy: 'skip' | 'update' | 'create_new'
}

export function HubSpotDuplicateHandler({
  duplicates,
  onResolutionsChange,
  defaultStrategy
}: HubSpotDuplicateHandlerProps) {
  const [resolutions, setResolutions] = useState<DuplicateResolution[]>([])
  const [bulkAction, setBulkAction] = useState<'skip' | 'update' | 'create_new'>(defaultStrategy)
  const [selectedDuplicates, setSelectedDuplicates] = useState<string[]>([])

  useEffect(() => {
    // Inicializar resoluciones con la estrategia por defecto
    const initialResolutions = duplicates.map(duplicate => ({
      duplicateId: duplicate.hubspotRecord.email!,
      action: defaultStrategy,
      fieldsToUpdate: duplicate.conflictingFields.map(f => f.field)
    }))
    setResolutions(initialResolutions)
    onResolutionsChange(initialResolutions)
  }, [duplicates, defaultStrategy, onResolutionsChange])

  const updateResolution = (duplicateId: string, action: DuplicateResolution['action'], fieldsToUpdate?: string[]) => {
    const updatedResolutions = resolutions.map(resolution => 
      resolution.duplicateId === duplicateId 
        ? { ...resolution, action, fieldsToUpdate }
        : resolution
    )
    setResolutions(updatedResolutions)
    onResolutionsChange(updatedResolutions)
  }

  const applyBulkAction = () => {
    const updatedResolutions = resolutions.map(resolution => 
      selectedDuplicates.includes(resolution.duplicateId)
        ? { ...resolution, action: bulkAction }
        : resolution
    )
    setResolutions(updatedResolutions)
    onResolutionsChange(updatedResolutions)
    setSelectedDuplicates([])
  }

  const getActionBadge = (action: DuplicateResolution['action']) => {
    const variants = {
      skip: { variant: 'secondary' as const, label: 'Omitir', icon: X },
      update: { variant: 'default' as const, label: 'Actualizar', icon: RefreshCw },
      create_new: { variant: 'outline' as const, label: 'Crear nuevo', icon: Users2 },
      merge: { variant: 'default' as const, label: 'Combinar', icon: CheckCircle }
    }
    const config = variants[action]
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getSimilarityColor = (score: number) => {
    if (score >= 90) return 'text-red-600 bg-red-50'
    if (score >= 70) return 'text-amber-600 bg-amber-50'
    return 'text-blue-600 bg-blue-50'
  }

  const getActionStats = () => {
    const stats = resolutions.reduce((acc, resolution) => {
      acc[resolution.action] = (acc[resolution.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return stats
  }

  if (duplicates.length === 0) {
    return (
      <Alert className="border-0.5 border-green-300 bg-green-50 rounded-[10px]">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          ✅ No se encontraron duplicados en los datos. Todos los contactos son únicos.
        </AlertDescription>
      </Alert>
    )
  }

  const actionStats = getActionStats()

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Alert className="border-0.5 border-amber-300 bg-amber-50 rounded-[10px]">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">
              Se encontraron {duplicates.length} posibles duplicados
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(actionStats).map(([action, count]) => (
                <span key={action} className="text-sm">
                  {getActionBadge(action as any)} {count}
                </span>
              ))}
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Bulk Actions */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Acciones en Lote
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedDuplicates.length === duplicates.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedDuplicates(duplicates.map(d => d.hubspotRecord.email!))
                  } else {
                    setSelectedDuplicates([])
                  }
                }}
              />
              <span className="text-sm">Seleccionar todos ({selectedDuplicates.length} seleccionados)</span>
            </div>
            
            <Select value={bulkAction} onValueChange={(value: any) => setBulkAction(value)}>
              <SelectTrigger className="w-40 border-0.5 border-gray-300 rounded-[10px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skip">Omitir</SelectItem>
                <SelectItem value="update">Actualizar</SelectItem>
                <SelectItem value="create_new">Crear nuevo</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={applyBulkAction}
              disabled={selectedDuplicates.length === 0}
              variant="outline"
              className="border-0.5 border-black rounded-[10px]"
            >
              Aplicar a {selectedDuplicates.length} seleccionados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Duplicates List */}
      <div className="space-y-4">
        {duplicates.map((duplicate, index) => {
          const resolution = resolutions.find(r => r.duplicateId === duplicate.hubspotRecord.email!)
          
          return (
            <Card key={index} className="border-0.5 border-black rounded-[10px]">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedDuplicates.includes(duplicate.hubspotRecord.email!)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDuplicates(prev => [...prev, duplicate.hubspotRecord.email!])
                        } else {
                          setSelectedDuplicates(prev => prev.filter(id => id !== duplicate.hubspotRecord.email!))
                        }
                      }}
                    />
                    <div>
                      <h4 className="font-medium">{duplicate.hubspotRecord.name}</h4>
                      <p className="text-sm text-muted-foreground">{duplicate.hubspotRecord.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`${getSimilarityColor(duplicate.similarityScore)} border-0`}>
                      {duplicate.similarityScore}% similar
                    </Badge>
                    {resolution && getActionBadge(resolution.action)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-blue-600">📥 Desde HubSpot</h5>
                    <div className="p-3 bg-blue-50 rounded-[10px] border border-blue-200">
                      <p className="text-sm"><strong>Nombre:</strong> {duplicate.hubspotRecord.name}</p>
                      <p className="text-sm"><strong>Email:</strong> {duplicate.hubspotRecord.email}</p>
                      {duplicate.hubspotRecord.phone && (
                        <p className="text-sm"><strong>Teléfono:</strong> {duplicate.hubspotRecord.phone}</p>
                      )}
                      {duplicate.hubspotRecord.company && (
                        <p className="text-sm"><strong>Empresa:</strong> {duplicate.hubspotRecord.company}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-green-600">💾 En el CRM</h5>
                    <div className="p-3 bg-green-50 rounded-[10px] border border-green-200">
                      <p className="text-sm"><strong>Nombre:</strong> {duplicate.existingRecord.name}</p>
                      <p className="text-sm"><strong>Email:</strong> {duplicate.existingRecord.email}</p>
                      {duplicate.existingRecord.phone && (
                        <p className="text-sm"><strong>Teléfono:</strong> {duplicate.existingRecord.phone}</p>
                      )}
                      {duplicate.existingRecord.company && (
                        <p className="text-sm"><strong>Empresa:</strong> {duplicate.existingRecord.company}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Creado: {new Date(duplicate.existingRecord.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Conflicting Fields */}
                {duplicate.conflictingFields.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">⚠️ Campos en conflicto:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {duplicate.conflictingFields.map((conflict, idx) => (
                        <div key={idx} className="p-2 bg-amber-50 rounded border border-amber-200">
                          <p className="text-xs font-medium">{conflict.field}</p>
                          <p className="text-xs text-amber-700">
                            HubSpot: {conflict.hubspotValue} → CRM: {conflict.existingValue}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Selection */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm font-medium">Acción:</span>
                  <Select
                    value={resolution?.action || 'skip'}
                    onValueChange={(value: any) => updateResolution(
                      duplicate.hubspotRecord.email!,
                      value,
                      duplicate.conflictingFields.map(f => f.field)
                    )}
                  >
                    <SelectTrigger className="w-40 border-0.5 border-gray-300 rounded-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">Omitir registro</SelectItem>
                      <SelectItem value="update">Actualizar existente</SelectItem>
                      <SelectItem value="create_new">Crear nuevo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}