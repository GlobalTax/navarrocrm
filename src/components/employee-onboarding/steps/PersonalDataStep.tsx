import React, { useState, useEffect } from 'react'
import { FormField, FieldFormatters } from '../FormField'
import { useFormValidation, ValidationPatterns, CustomValidators } from '@/hooks/useFormValidation'
import { useAutoSave } from '@/hooks/useAutoSave'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Shield } from 'lucide-react'

interface PersonalDataStepProps {
  data: any
  onDataChange: (data: any) => void
  onValidationChange: (isValid: boolean, errors: string[]) => void
  onSave: (data: any) => Promise<boolean>
}

const validationSchema = {
  first_name: { required: true, minLength: 2, maxLength: 50 },
  last_name: { required: true, minLength: 2, maxLength: 50 },
  dni: { required: true, custom: CustomValidators.dniNie },
  birth_date: { required: true },
  nationality: { maxLength: 50 },
  social_security: { pattern: /^[0-9]{2}[0-9]{8}[0-9]{2}$/ }
}

export function PersonalDataStep({ 
  data, 
  onDataChange, 
  onValidationChange,
  onSave 
}: PersonalDataStepProps) {
  const [formData, setFormData] = useState({
    first_name: data?.first_name || '',
    last_name: data?.last_name || '',
    dni: data?.dni || '',
    birth_date: data?.birth_date || '',
    nationality: data?.nationality || 'Española',
    social_security: data?.social_security || ''
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
    delay: 30000, // 30 segundos
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
      first_name: 'Nombre',
      last_name: 'Apellidos',
      dni: 'DNI/NIE',
      birth_date: 'Fecha de Nacimiento',
      nationality: 'Nacionalidad',
      social_security: 'Número Seguridad Social'
    }
    return labels[field] || field
  }

  const calculateAge = (birthDate: string): number | null => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    const age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1
    }
    return age
  }

  const age = calculateAge(formData.birth_date)

  return (
    <div className="space-y-6">
      <Card className="border-0.5 border-gray-200 rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-blue-600" />
            Información Personal
          </CardTitle>
          <p className="text-sm text-gray-600">
            Introduce tus datos personales básicos. Esta información es necesaria para tu contrato.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="first_name"
              label="Nombre"
              value={formData.first_name}
              onChange={(value) => handleFieldChange('first_name', value)}
              onBlur={() => handleFieldBlur('first_name')}
              error={touched.first_name ? validation.validateField('first_name', formData.first_name) : undefined}
              touched={touched.first_name}
              required
              placeholder="Tu nombre"
              autoComplete="given-name"
              maxLength={50}
            />

            <FormField
              id="last_name"
              label="Apellidos"
              value={formData.last_name}
              onChange={(value) => handleFieldChange('last_name', value)}
              onBlur={() => handleFieldBlur('last_name')}
              error={touched.last_name ? validation.validateField('last_name', formData.last_name) : undefined}
              touched={touched.last_name}
              required
              placeholder="Tus apellidos"
              autoComplete="family-name"
              maxLength={50}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="dni"
              label="DNI/NIE"
              value={formData.dni}
              onChange={(value) => handleFieldChange('dni', value)}
              onBlur={() => handleFieldBlur('dni')}
              error={touched.dni ? validation.validateField('dni', formData.dni) : undefined}
              touched={touched.dni}
              required
              placeholder="12345678X o X1234567X"
              formatValue={FieldFormatters.dni}
              hint="Introduce tu DNI o NIE (incluye la letra)"
              maxLength={10}
            />

            <FormField
              id="birth_date"
              label="Fecha de Nacimiento"
              type="date"
              value={formData.birth_date}
              onChange={(value) => handleFieldChange('birth_date', value)}
              onBlur={() => handleFieldBlur('birth_date')}
              error={touched.birth_date ? validation.validateField('birth_date', formData.birth_date) : undefined}
              touched={touched.birth_date}
              required
              hint={age ? `Edad: ${age} años` : undefined}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="nationality"
              label="Nacionalidad"
              value={formData.nationality}
              onChange={(value) => handleFieldChange('nationality', value)}
              onBlur={() => handleFieldBlur('nationality')}
              error={touched.nationality ? validation.validateField('nationality', formData.nationality) : undefined}
              touched={touched.nationality}
              placeholder="Española"
              maxLength={50}
            />

            <FormField
              id="social_security"
              label="Número Seguridad Social"
              value={formData.social_security}
              onChange={(value) => handleFieldChange('social_security', value)}
              onBlur={() => handleFieldBlur('social_security')}
              error={touched.social_security ? validation.validateField('social_security', formData.social_security) : undefined}
              touched={touched.social_security}
              placeholder="281234567892"
              hint="12 dígitos del número de la Seguridad Social"
              maxLength={12}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="bg-blue-50 border-blue-200 border-0.5 rounded-[10px]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">
                Protección de Datos Personales
              </h4>
              <p className="text-sm text-blue-700">
                Tus datos serán tratados conforme al RGPD y la LOPD. Solo se utilizarán para 
                fines laborales y administrativos. Puedes ejercer tus derechos contactando con 
                el departamento de recursos humanos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}