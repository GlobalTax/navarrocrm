
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { UserPlus, Building, User } from 'lucide-react'

interface ProspectData {
  name: string
  email: string
  phone: string
  client_type: 'particular' | 'empresa'
  dni_nif: string
  business_sector?: string
  how_found_us?: string
  internal_notes?: string
}

interface ProspectToClientFormProps {
  prospectData: ProspectData
  onProspectDataChange: (data: ProspectData) => void
  onCreateClient: () => void
  isCreating: boolean
}

export const ProspectToClientForm: React.FC<ProspectToClientFormProps> = ({
  prospectData,
  onProspectDataChange,
  onCreateClient,
  isCreating
}) => {
  const updateField = (field: keyof ProspectData, value: string) => {
    onProspectDataChange({ ...prospectData, [field]: value })
  }

  return (
    <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-blue-800 flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Crear Cliente desde Prospecto
        </CardTitle>
        <p className="text-sm text-blue-600">
          Complete los datos del prospecto para convertirlo en cliente
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="prospect-name">Nombre/Razón Social *</Label>
            <Input
              id="prospect-name"
              value={prospectData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Nombre del prospecto"
            />
          </div>

          <div>
            <Label htmlFor="prospect-type">Tipo de Cliente *</Label>
            <Select
              value={prospectData.client_type}
              onValueChange={(value: 'particular' | 'empresa') => updateField('client_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="particular">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Particular
                  </div>
                </SelectItem>
                <SelectItem value="empresa">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Empresa
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="prospect-email">Email *</Label>
            <Input
              id="prospect-email"
              type="email"
              value={prospectData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="email@ejemplo.com"
            />
          </div>

          <div>
            <Label htmlFor="prospect-phone">Teléfono</Label>
            <Input
              id="prospect-phone"
              value={prospectData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+34 600 000 000"
            />
          </div>

          <div>
            <Label htmlFor="prospect-nif">
              {prospectData.client_type === 'empresa' ? 'CIF' : 'DNI/NIE'}
            </Label>
            <Input
              id="prospect-nif"
              value={prospectData.dni_nif}
              onChange={(e) => updateField('dni_nif', e.target.value)}
              placeholder={prospectData.client_type === 'empresa' ? 'A12345678' : '12345678X'}
            />
          </div>

          {prospectData.client_type === 'empresa' && (
            <div>
              <Label htmlFor="prospect-sector">Sector de Actividad</Label>
              <Input
                id="prospect-sector"
                value={prospectData.business_sector || ''}
                onChange={(e) => updateField('business_sector', e.target.value)}
                placeholder="Ej: Tecnología, Construcción..."
              />
            </div>
          )}

          <div>
            <Label htmlFor="prospect-source">¿Cómo nos conoció?</Label>
            <Select
              value={prospectData.how_found_us || ''}
              onValueChange={(value) => updateField('how_found_us', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="referencia">Referencia</SelectItem>
                <SelectItem value="web">Página web</SelectItem>
                <SelectItem value="redes_sociales">Redes sociales</SelectItem>
                <SelectItem value="publicidad">Publicidad</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="prospect-notes">Notas Internas</Label>
          <Textarea
            id="prospect-notes"
            value={prospectData.internal_notes || ''}
            onChange={(e) => updateField('internal_notes', e.target.value)}
            placeholder="Información adicional sobre el prospecto..."
            rows={3}
          />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button 
            onClick={onCreateClient}
            disabled={!prospectData.name || !prospectData.email || isCreating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isCreating ? 'Creando Cliente...' : 'Crear Cliente y Continuar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
