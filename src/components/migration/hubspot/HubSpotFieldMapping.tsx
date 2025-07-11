import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, MapPin } from 'lucide-react'

interface FieldMapping {
  hubspotField: string
  crmField: string
  isRequired: boolean
  dataType: string
}

interface HubSpotFieldMappingProps {
  detectedColumns: string[]
  onMappingChange: (mappings: FieldMapping[]) => void
}

const CRM_FIELDS = [
  { key: 'name', label: 'Nombre Completo', required: true, type: 'text' },
  { key: 'email', label: 'Email', required: false, type: 'email' },
  { key: 'phone', label: 'Teléfono', required: false, type: 'phone' },
  { key: 'company', label: 'Empresa', required: false, type: 'text' },
  { key: 'website', label: 'Sitio Web', required: false, type: 'url' },
  { key: 'industry', label: 'Industria', required: false, type: 'text' },
  { key: 'lifecycle_stage', label: 'Etapa del Ciclo', required: false, type: 'select' },
  { key: 'lead_status', label: 'Estado del Lead', required: false, type: 'select' },
  { key: 'address_street', label: 'Dirección', required: false, type: 'text' },
  { key: 'address_city', label: 'Ciudad', required: false, type: 'text' },
  { key: 'notes', label: 'Notas', required: false, type: 'textarea' }
]

const AUTO_MAPPING_PATTERNS = {
  'firstname': 'name',
  'first_name': 'name',
  'lastname': 'name',
  'last_name': 'name',
  'email': 'email',
  'phone': 'phone',
  'mobilephone': 'phone',
  'company': 'company',
  'website': 'website',
  'industry': 'industry',
  'lifecyclestage': 'lifecycle_stage',
  'hs_lead_status': 'lead_status',
  'address': 'address_street',
  'city': 'address_city',
  'notes': 'notes',
  'description': 'notes'
}

export function HubSpotFieldMapping({ detectedColumns, onMappingChange }: HubSpotFieldMappingProps) {
  const [mappings, setMappings] = useState<FieldMapping[]>([])
  const [autoMappedCount, setAutoMappedCount] = useState(0)

  useEffect(() => {
    // Crear mapeo automático inicial
    const initialMappings: FieldMapping[] = detectedColumns.map(hubspotField => {
      const normalizedField = hubspotField.toLowerCase().replace(/[^a-z0-9_]/g, '_')
      const suggestedCrmField = AUTO_MAPPING_PATTERNS[normalizedField as keyof typeof AUTO_MAPPING_PATTERNS]
      
      return {
        hubspotField,
        crmField: suggestedCrmField || '',
        isRequired: false,
        dataType: 'text'
      }
    })

    setMappings(initialMappings)
    setAutoMappedCount(initialMappings.filter(m => m.crmField).length)
    onMappingChange(initialMappings)
  }, [detectedColumns, onMappingChange])

  const updateMapping = (index: number, crmField: string) => {
    const updatedMappings = [...mappings]
    updatedMappings[index].crmField = crmField
    
    // Actualizar propiedades basadas en el campo CRM seleccionado
    const crmFieldInfo = CRM_FIELDS.find(f => f.key === crmField)
    if (crmFieldInfo) {
      updatedMappings[index].isRequired = crmFieldInfo.required
      updatedMappings[index].dataType = crmFieldInfo.type
    }
    
    setMappings(updatedMappings)
    onMappingChange(updatedMappings)
  }

  const getMappedFields = () => mappings.filter(m => m.crmField).length
  const getRequiredMapped = () => mappings.filter(m => m.crmField && m.isRequired).length
  const getTotalRequired = () => CRM_FIELDS.filter(f => f.required).length

  return (
    <Card className="border-0.5 border-black rounded-[10px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Mapeo de Campos
          <Badge variant="outline" className="ml-2">
            {getMappedFields()}/{detectedColumns.length} campos mapeados
          </Badge>
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>{autoMappedCount} auto-detectados</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span>{getRequiredMapped()}/{getTotalRequired()} requeridos</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {mappings.map((mapping, index) => (
            <div key={index} className="flex items-center gap-4 p-3 border border-gray-200 rounded-[10px]">
              <div className="flex-1">
                <p className="font-medium text-sm">{mapping.hubspotField}</p>
                <p className="text-xs text-gray-500">Campo de HubSpot</p>
              </div>
              
              <ArrowRight className="h-4 w-4 text-gray-400" />
              
              <div className="flex-1">
                <Select
                  value={mapping.crmField}
                  onValueChange={(value) => updateMapping(index, value)}
                >
                  <SelectTrigger className="w-full border-0.5 border-gray-300 rounded-[10px]">
                    <SelectValue placeholder="Seleccionar campo CRM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin mapear</SelectItem>
                    {CRM_FIELDS.map(field => (
                      <SelectItem key={field.key} value={field.key}>
                        <div className="flex items-center gap-2">
                          {field.label}
                          {field.required && (
                            <Badge variant="secondary" className="text-xs">Requerido</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {mapping.crmField && (
                <div className="flex gap-1">
                  {mapping.isRequired && (
                    <Badge variant="destructive" className="text-xs">Req</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {mapping.dataType}
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>

        {getTotalRequired() > getRequiredMapped() && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-[10px]">
            <p className="text-sm text-amber-700">
              ⚠️ Faltan campos requeridos por mapear. Asegúrate de mapear al menos los campos obligatorios.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}