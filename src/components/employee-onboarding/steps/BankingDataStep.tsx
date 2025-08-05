import React, { useState, useEffect } from 'react'
import { FormField, FieldFormatters } from '../FormField'
import { useFormValidation, CustomValidators } from '@/hooks/useFormValidation'
import { useAutoSave } from '@/hooks/useAutoSave'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Shield, AlertCircle } from 'lucide-react'

interface BankingDataStepProps {
  data: any
  onDataChange: (data: any) => void
  onValidationChange: (isValid: boolean, errors: string[]) => void
  onSave: (data: any) => Promise<boolean>
}

const validationSchema = {
  bank_name: { required: true, minLength: 2, maxLength: 100 },
  iban: { required: true, custom: CustomValidators.iban },
  account_holder: { required: true, minLength: 2, maxLength: 100 }
}

export function BankingDataStep({ 
  data, 
  onDataChange, 
  onValidationChange,
  onSave 
}: BankingDataStepProps) {
  const [formData, setFormData] = useState({
    bank_name: data?.bank_name || '',
    iban: data?.iban || '',
    account_holder: data?.account_holder || ''
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
      bank_name: 'Nombre del Banco',
      iban: 'IBAN',
      account_holder: 'Titular de la Cuenta'
    }
    return labels[field] || field
  }

  const getBankFromIban = (iban: string): string => {
    const cleanIban = iban.replace(/\s/g, '')
    if (cleanIban.length < 8) return ''
    
    const bankCode = cleanIban.slice(4, 8)
    const bankNames: Record<string, string> = {
      '0049': 'Banco Santander',
      '0182': 'BBVA',
      '0081': 'Banco Sabadell',
      '0030': 'Banco Español de Crédito',
      '2080': 'Abanca',
      '2100': 'CaixaBank',
      '0128': 'Bankinter',
      '0075': 'Banco Popular',
      '3025': 'Cajamar',
      '1465': 'ING Bank'
    }
    
    return bankNames[bankCode] || ''
  }

  // Auto-fill bank name when IBAN changes
  useEffect(() => {
    if (formData.iban && !formData.bank_name) {
      const detectedBank = getBankFromIban(formData.iban)
      if (detectedBank) {
        setFormData(prev => ({ ...prev, bank_name: detectedBank }))
      }
    }
  }, [formData.iban])

  return (
    <div className="space-y-6">
      <Card className="border-0.5 border-gray-200 rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-purple-600" />
            Datos Bancarios
          </CardTitle>
          <p className="text-sm text-gray-600">
            Información bancaria para el pago de tu nómina y otros conceptos laborales.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <FormField
            id="iban"
            label="IBAN (Cuenta Bancaria)"
            value={formData.iban}
            onChange={(value) => handleFieldChange('iban', value)}
            onBlur={() => handleFieldBlur('iban')}
            error={touched.iban ? validation.validateField('iban', formData.iban) : undefined}
            touched={touched.iban}
            required
            placeholder="ES00 0000 0000 0000 0000 0000"
            formatValue={FieldFormatters.iban}
            hint="IBAN completo de tu cuenta bancaria española"
            maxLength={29}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="bank_name"
              label="Nombre del Banco"
              value={formData.bank_name}
              onChange={(value) => handleFieldChange('bank_name', value)}
              onBlur={() => handleFieldBlur('bank_name')}
              error={touched.bank_name ? validation.validateField('bank_name', formData.bank_name) : undefined}
              touched={touched.bank_name}
              required
              placeholder="Banco Santander"
              hint="Se detectará automáticamente desde el IBAN"
              maxLength={100}
            />

            <FormField
              id="account_holder"
              label="Titular de la Cuenta"
              value={formData.account_holder}
              onChange={(value) => handleFieldChange('account_holder', value)}
              onBlur={() => handleFieldBlur('account_holder')}
              error={touched.account_holder ? validation.validateField('account_holder', formData.account_holder) : undefined}
              touched={touched.account_holder}
              required
              placeholder="Nombre completo del titular"
              hint="Debe coincidir con el nombre del propietario de la cuenta"
              maxLength={100}
            />
          </div>
        </CardContent>
      </Card>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Security Notice */}
        <Card className="bg-blue-50 border-blue-200 border-0.5 rounded-[10px]">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">
                  Seguridad de Datos
                </h4>
                <p className="text-sm text-blue-700">
                  Tus datos bancarios se almacenan de forma segura y cifrada. Solo se 
                  utilizarán para el pago de nóminas y conceptos laborales.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="bg-amber-50 border-amber-200 border-0.5 rounded-[10px]">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-800 mb-1">
                  Importante
                </h4>
                <p className="text-sm text-amber-700">
                  La cuenta debe estar a tu nombre. Si hay discrepancias, contacta 
                  con el departamento de recursos humanos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IBAN Validation Helper */}
      {formData.iban && touched.iban && !validation.validateField('iban', formData.iban) && (
        <Card className="bg-green-50 border-green-200 border-0.5 rounded-[10px]">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-800 mb-2">
                  IBAN Válido
                </h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>País:</strong> España</p>
                  <p><strong>Código de Banco:</strong> {formData.iban.replace(/\s/g, '').slice(4, 8)}</p>
                  {getBankFromIban(formData.iban) && (
                    <p><strong>Banco Detectado:</strong> {getBankFromIban(formData.iban)}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}