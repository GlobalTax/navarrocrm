import React, { useState, useEffect } from 'react'
import { FormField, FieldFormatters } from '../FormField'
import { useFormValidation, CustomValidators } from '@/hooks/useFormValidation'
import { useAutoSave } from '@/hooks/useAutoSave'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Phone, AlertTriangle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface ContactDataStepProps {
  data: any
  onDataChange: (data: any) => void
  onValidationChange: (isValid: boolean, errors: string[]) => void
  onSave: (data: any) => Promise<boolean>
}

const validationSchema = {
  phone: { required: true, custom: CustomValidators.phone },
  address: { required: true, minLength: 10, maxLength: 200 },
  city: { required: true, minLength: 2, maxLength: 50 },
  postal_code: { required: true, pattern: /^[0-9]{5}$/ },
  emergency_contact_name: { minLength: 2, maxLength: 100 },
  emergency_contact_phone: { custom: CustomValidators.phone }
}

export function ContactDataStep({ 
  data, 
  onDataChange, 
  onValidationChange,
  onSave 
}: ContactDataStepProps) {
  const [formData, setFormData] = useState({
    phone: data?.phone || '',
    address: data?.address || '',
    city: data?.city || '',
    postal_code: data?.postal_code || '',
    emergency_contact_name: data?.emergency_contact_name || '',
    emergency_contact_phone: data?.emergency_contact_phone || ''
  })

  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validation = useFormValidation(validationSchema, formData)

  // Auto-save hook
  const { saveNow, isSaving } = useAutoSave({
    data: formData,
    onSave: async (data) => {
      onDataChange(data)
      return await onSave(data)
    },
    delay: 30000,
    enableToasts: true
  })

  // Update parent when validation changes
  useEffect(() => {
    const errors: string[] = []
    Object.keys(validationSchema).forEach(field => {
      const error = validation.validateField(field, formData[field])
      if (error && touched[field]) {
        errors.push(`${getFieldLabel(field)}: ${error}`)
      }
    })
    
    onValidationChange(validation.isValid, errors)
  }, [validation.isValid, touched, formData])

  // Update parent when data changes
  useEffect(() => {
    onDataChange(formData)
  }, [formData])

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validation.touchField(field)
  }

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      phone: 'Teléfono',
      address: 'Dirección',
      city: 'Ciudad',
      postal_code: 'Código Postal',
      emergency_contact_name: 'Nombre Contacto Emergencia',
      emergency_contact_phone: 'Teléfono Contacto Emergencia'
    }
    return labels[field] || field
  }

  return (
    <div className="space-y-6">
      {/* Datos de Contacto Principal */}
      <Card className="border-0.5 border-gray-200 rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-green-600" />
            Datos de Contacto
          </CardTitle>
          <p className="text-sm text-gray-600">
            Información de contacto para comunicaciones laborales y envío de documentación.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="phone"
              label="Teléfono"
              type="tel"
              value={formData.phone}
              onChange={(value) => handleFieldChange('phone', value)}
              onBlur={() => handleFieldBlur('phone')}
              error={touched.phone ? validation.validateField('phone', formData.phone) : undefined}
              touched={touched.phone}
              required
              placeholder="+34 600 000 000"
              formatValue={FieldFormatters.phone}
              hint="Número de teléfono móvil o fijo"
              autoComplete="tel"
            />

            <FormField
              id="postal_code"
              label="Código Postal"
              value={formData.postal_code}
              onChange={(value) => handleFieldChange('postal_code', value.replace(/\D/g, ''))}
              onBlur={() => handleFieldBlur('postal_code')}
              error={touched.postal_code ? validation.validateField('postal_code', formData.postal_code) : undefined}
              touched={touched.postal_code}
              required
              placeholder="28001"
              hint="5 dígitos del código postal"
              maxLength={5}
            />
          </div>

          <FormField
            id="address"
            label="Dirección Completa"
            value={formData.address}
            onChange={(value) => handleFieldChange('address', value)}
            onBlur={() => handleFieldBlur('address')}
            error={touched.address ? validation.validateField('address', formData.address) : undefined}
            touched={touched.address}
            required
            placeholder="Calle, número, piso, puerta"
            hint="Dirección completa para envío de documentación"
            autoComplete="street-address"
            maxLength={200}
          />

          <FormField
            id="city"
            label="Ciudad"
            value={formData.city}
            onChange={(value) => handleFieldChange('city', value)}
            onBlur={() => handleFieldBlur('city')}
            error={touched.city ? validation.validateField('city', formData.city) : undefined}
            touched={touched.city}
            required
            placeholder="Madrid"
            autoComplete="address-level2"
            maxLength={50}
          />
        </CardContent>
      </Card>

      {/* Contacto de Emergencia */}
      <Card className="border-0.5 border-gray-200 rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Contacto de Emergencia
          </CardTitle>
          <p className="text-sm text-gray-600">
            Persona a contactar en caso de emergencia laboral (opcional pero recomendado).
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="emergency_contact_name"
              label="Nombre del Contacto"
              value={formData.emergency_contact_name}
              onChange={(value) => handleFieldChange('emergency_contact_name', value)}
              onBlur={() => handleFieldBlur('emergency_contact_name')}
              error={touched.emergency_contact_name ? validation.validateField('emergency_contact_name', formData.emergency_contact_name) : undefined}
              touched={touched.emergency_contact_name}
              placeholder="Nombre y apellidos"
              hint="Familiar o persona de confianza"
              maxLength={100}
            />

            <FormField
              id="emergency_contact_phone"
              label="Teléfono del Contacto"
              type="tel"
              value={formData.emergency_contact_phone}
              onChange={(value) => handleFieldChange('emergency_contact_phone', value)}
              onBlur={() => handleFieldBlur('emergency_contact_phone')}
              error={touched.emergency_contact_phone ? validation.validateField('emergency_contact_phone', formData.emergency_contact_phone) : undefined}
              touched={touched.emergency_contact_phone}
              placeholder="+34 600 000 000"
              formatValue={FieldFormatters.phone}
              hint="Teléfono del contacto de emergencia"
            />
          </div>

          {(!formData.emergency_contact_name || !formData.emergency_contact_phone) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-[10px] p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  <strong>Recomendación:</strong> Es aconsejable proporcionar un contacto de emergencia 
                  para situaciones imprevistas en el trabajo.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}