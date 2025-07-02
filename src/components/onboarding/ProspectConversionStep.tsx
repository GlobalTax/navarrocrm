import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, User, Building, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ProspectConversionStepProps {
  selectedProspect: any
  onBack: () => void
  onConvert: (updatedData: any) => void
  isConverting: boolean
}

export const ProspectConversionStep: React.FC<ProspectConversionStepProps> = ({
  selectedProspect,
  onBack,
  onConvert,
  isConverting
}) => {
  const [formData, setFormData] = useState(selectedProspect)
  const [missingFields, setMissingFields] = useState<string[]>([])

  useEffect(() => {
    // Identificar campos faltantes importantes
    const required = []
    if (!formData.email) required.push('Email')
    if (!formData.phone) required.push('Teléfono')
    if (!formData.address_street) required.push('Dirección')
    if (formData.client_type === 'empresa' && !formData.dni_nif) required.push('CIF')
    if (formData.client_type === 'particular' && !formData.dni_nif) required.push('DNI/NIE')
    
    setMissingFields(required)
  }, [formData])

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleConvert = () => {
    onConvert(formData)
  }

  return (
    <div className="space-y-6">
      {/* Header con información del prospecto */}
      <Card className="border-2 border-primary/20 bg-primary/5 rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {selectedProspect.client_type === 'empresa' ? (
              <Building className="h-6 w-6 text-primary" />
            ) : (
              <User className="h-6 w-6 text-primary" />
            )}
            <div>
              <div className="text-lg">Convertir Prospecto a Cliente</div>
              <div className="text-sm font-normal text-gray-600">
                {selectedProspect.name}
              </div>
            </div>
            <Badge variant="outline" className="ml-auto border-0.5 border-primary rounded-[10px]">
              {selectedProspect.client_type === 'empresa' ? 'Empresa' : 'Particular'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Revisa y completa la información antes de convertir
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onBack}
              className="border-0.5 border-black rounded-[10px]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cambiar Prospecto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alertas sobre campos faltantes */}
      {missingFields.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Campos recomendados faltantes:</strong> {missingFields.join(', ')}. 
            Puedes completarlos ahora o hacerlo más tarde.
          </AlertDescription>
        </Alert>
      )}

      {/* Formulario de datos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información básica */}
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre/Razón Social *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="border-0.5 border-black rounded-[10px]"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                className="border-0.5 border-black rounded-[10px]"
                placeholder="email@ejemplo.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
                className="border-0.5 border-black rounded-[10px]"
                placeholder="+34 600 000 000"
              />
            </div>

            <div>
              <Label htmlFor="dni_nif">
                {formData.client_type === 'empresa' ? 'CIF' : 'DNI/NIE'}
              </Label>
              <Input
                id="dni_nif"
                value={formData.dni_nif || ''}
                onChange={(e) => updateField('dni_nif', e.target.value)}
                className="border-0.5 border-black rounded-[10px]"
                placeholder={formData.client_type === 'empresa' ? 'A12345678' : '12345678X'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {missingFields.length > 0 ? (
                <AlertCircle className="h-5 w-5 text-amber-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              Información Adicional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address_street || ''}
                onChange={(e) => updateField('address_street', e.target.value)}
                className="border-0.5 border-black rounded-[10px]"
                placeholder="Calle, número, puerta..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={formData.address_city || ''}
                  onChange={(e) => updateField('address_city', e.target.value)}
                  className="border-0.5 border-black rounded-[10px]"
                />
              </div>
              <div>
                <Label htmlFor="postal">Código Postal</Label>
                <Input
                  id="postal"
                  value={formData.address_postal_code || ''}
                  onChange={(e) => updateField('address_postal_code', e.target.value)}
                  className="border-0.5 border-black rounded-[10px]"
                />
              </div>
            </div>

            {formData.client_type === 'empresa' && (
              <div>
                <Label htmlFor="sector">Sector de Actividad</Label>
                <Input
                  id="sector"
                  value={formData.business_sector || ''}
                  onChange={(e) => updateField('business_sector', e.target.value)}
                  className="border-0.5 border-black rounded-[10px]"
                  placeholder="Ej: Tecnología, Construcción..."
                />
              </div>
            )}

            <div>
              <Label htmlFor="contact_preference">Preferencia de Contacto</Label>
              <Select
                value={formData.contact_preference || 'email'}
                onValueChange={(value) => updateField('contact_preference', value)}
              >
                <SelectTrigger className="border-0.5 border-black rounded-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Teléfono</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notas internas */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="text-base">Notas Internas</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.internal_notes || ''}
            onChange={(e) => updateField('internal_notes', e.target.value)}
            placeholder="Información adicional sobre el cliente..."
            rows={3}
            className="border-0.5 border-black rounded-[10px]"
          />
        </CardContent>
      </Card>

      {/* Botón de conversión */}
      <div className="flex justify-end pt-4 border-t">
        <Button 
          onClick={handleConvert}
          disabled={!formData.name || isConverting}
          className="bg-primary hover:bg-primary/90 text-white border-0.5 border-black rounded-[10px]"
          size="lg"
        >
          {isConverting ? 'Convirtiendo...' : 'Convertir a Cliente'}
          {!isConverting && <CheckCircle className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  )
}