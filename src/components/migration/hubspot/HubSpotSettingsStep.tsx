import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Settings, Users, RefreshCw, Shield } from 'lucide-react'

export interface MigrationSettings {
  batchSize: number
  duplicateStrategy: 'skip' | 'update' | 'create_new'
  enableValidation: boolean
  mapCompanies: boolean
  importDeals: boolean
  preserveTimestamps: boolean
  assignToUser?: string
  defaultStatus: string
  defaultRelationshipType: string
}

interface HubSpotSettingsStepProps {
  settings: MigrationSettings
  onSettingsChange: (settings: MigrationSettings) => void
  availableUsers?: Array<{ id: string; name: string; email: string }>
}

export function HubSpotSettingsStep({ 
  settings, 
  onSettingsChange,
  availableUsers = []
}: HubSpotSettingsStepProps) {
  const updateSetting = <K extends keyof MigrationSettings>(
    key: K, 
    value: MigrationSettings[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  return (
    <div className="space-y-6">
      {/* Performance Settings */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Configuración de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">
              Tamaño de Lote: {settings.batchSize} registros
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              Número de registros a procesar simultáneamente
            </p>
            <Slider
              value={[settings.batchSize]}
              onValueChange={([value]) => updateSetting('batchSize', value)}
              max={50}
              min={5}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 (Lento)</span>
              <span>25 (Óptimo)</span>
              <span>50 (Rápido)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Validación Estricta</Label>
              <p className="text-xs text-gray-500">
                Aplicar validaciones adicionales durante la importación
              </p>
            </div>
            <Switch
              checked={settings.enableValidation}
              onCheckedChange={(checked) => updateSetting('enableValidation', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Duplicate Handling */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-amber-600" />
            Manejo de Duplicados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Estrategia para Duplicados</Label>
            <p className="text-xs text-gray-500 mb-2">
              Qué hacer cuando se encuentre un contacto existente (mismo email)
            </p>
            <Select
              value={settings.duplicateStrategy}
              onValueChange={(value: 'skip' | 'update' | 'create_new') => 
                updateSetting('duplicateStrategy', value)
              }
            >
              <SelectTrigger className="border-0.5 border-gray-300 rounded-[10px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skip">
                  <div className="flex items-center gap-2">
                    Omitir duplicados
                    <Badge variant="secondary">Recomendado</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="update">
                  Actualizar existentes
                </SelectItem>
                <SelectItem value="create_new">
                  Crear nuevos registros
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Mapping Settings */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Configuración de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Estado por Defecto</Label>
              <Select
                value={settings.defaultStatus}
                onValueChange={(value) => updateSetting('defaultStatus', value)}
              >
                <SelectTrigger className="border-0.5 border-gray-300 rounded-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="prospecto">Prospecto</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Tipo de Relación</Label>
              <Select
                value={settings.defaultRelationshipType}
                onValueChange={(value) => updateSetting('defaultRelationshipType', value)}
              >
                <SelectTrigger className="border-0.5 border-gray-300 rounded-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospecto">Prospecto</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="ex_cliente">Ex Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {availableUsers.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Asignar a Usuario</Label>
              <p className="text-xs text-gray-500 mb-2">
                Usuario responsable de los contactos importados (opcional)
              </p>
              <Select
                value={settings.assignToUser || ''}
                onValueChange={(value) => updateSetting('assignToUser', value || undefined)}
              >
                <SelectTrigger className="border-0.5 border-gray-300 rounded-[10px]">
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin asignar</SelectItem>
                  {availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {user.name} ({user.email})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Mapear Empresas</Label>
                <p className="text-xs text-gray-500">
                  Crear registros de empresas automáticamente
                </p>
              </div>
              <Switch
                checked={settings.mapCompanies}
                onCheckedChange={(checked) => updateSetting('mapCompanies', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Preservar Fechas</Label>
                <p className="text-xs text-gray-500">
                  Mantener fechas originales de HubSpot
                </p>
              </div>
              <Switch
                checked={settings.preserveTimestamps}
                onCheckedChange={(checked) => updateSetting('preserveTimestamps', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}