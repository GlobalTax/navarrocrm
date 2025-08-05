import React, { useState, useEffect } from 'react'
import { DigitalSignaturePad } from '../DigitalSignaturePad'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  PenTool, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'

interface FinalStepProps {
  data: any
  onDataChange: (data: any) => void
  onValidationChange: (isValid: boolean, errors: string[]) => void
  onSave: (data: any) => Promise<boolean>
}

export function FinalStep({ 
  data, 
  onDataChange, 
  onValidationChange,
  onSave 
}: FinalStepProps) {
  const [formData, setFormData] = useState({
    signature: data?.signature || '',
    terms_accepted: data?.terms_accepted || false,
    privacy_accepted: data?.privacy_accepted || false,
    labor_contract_accepted: data?.labor_contract_accepted || false,
    data_verification: data?.data_verification || false
  })

  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  // Validar cuando cambian los datos
  useEffect(() => {
    const errors: string[] = []
    
    if (!formData.signature) {
      errors.push('La firma digital es obligatoria')
    }
    
    if (!formData.terms_accepted) {
      errors.push('Debe aceptar los términos y condiciones')
    }
    
    if (!formData.privacy_accepted) {
      errors.push('Debe aceptar la política de privacidad')
    }
    
    if (!formData.labor_contract_accepted) {
      errors.push('Debe aceptar el contrato laboral')
    }
    
    if (!formData.data_verification) {
      errors.push('Debe verificar que todos los datos son correctos')
    }

    const isValid = errors.length === 0
    onValidationChange(isValid, errors)
    onDataChange(formData)
  }, [formData])

  const handleSignatureChange = (signatureData: string) => {
    setFormData(prev => ({ ...prev, signature: signatureData }))
  }

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }))
  }

  const downloadContract = () => {
    // En una implementación real, esto descargaría el contrato personalizado
    toast.info('Funcionalidad de descarga del contrato en desarrollo')
  }

  const termsAndConditions = `
    TÉRMINOS Y CONDICIONES DE INCORPORACIÓN

    1. ACEPTACIÓN DEL PUESTO
    Al firmar este documento, acepto el puesto ofrecido y las condiciones establecidas en la oferta de trabajo.

    2. PERIODO DE PRUEBA
    Acepto el período de prueba establecido según la legislación vigente y lo acordado en el contrato.

    3. CONFIDENCIALIDAD
    Me comprometo a mantener la confidencialidad de toda la información sensible de la empresa y sus clientes.

    4. CUMPLIMIENTO NORMATIVO
    Me comprometo a cumplir todas las políticas internas, normas de seguridad y protocolos establecidos.

    5. VERIFICACIÓN DE DATOS
    Declaro que toda la información proporcionada es veraz y completa.
  `

  const privacyPolicy = `
    POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS

    1. TRATAMIENTO DE DATOS PERSONALES
    Sus datos personales serán tratados conforme al RGPD y la LOPD vigente.

    2. FINALIDAD DEL TRATAMIENTO
    Los datos se utilizarán exclusivamente para fines laborales, administrativos y de cumplimiento legal.

    3. DERECHOS DEL INTERESADO
    Puede ejercer sus derechos de acceso, rectificación, supresión y portabilidad contactando con RRHH.

    4. CONSERVACIÓN DE DATOS
    Los datos se conservarán durante el tiempo necesario para las finalidades indicadas y conforme a la normativa.

    5. SEGURIDAD
    Implementamos medidas técnicas y organizativas para garantizar la seguridad de sus datos.
  `

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card className="bg-green-50 border-green-200 border-0.5 rounded-[10px]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-800 mb-1">
                ¡Casi terminamos!
              </h4>
              <p className="text-sm text-green-700">
                Has completado todos los pasos. Solo queda firmar digitalmente y aceptar los términos para finalizar tu incorporación.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Digital Signature */}
      <DigitalSignaturePad
        onSignatureChange={handleSignatureChange}
        width={600}
        height={200}
        backgroundColor="#ffffff"
        penColor="#000000"
        penWidth={2}
      />

      {/* Acceptances */}
      <Card className="border-0.5 border-gray-200 rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-blue-600" />
            Aceptación de Términos y Condiciones
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Data Verification */}
          <div className="p-4 border border-gray-200 rounded-[10px] bg-blue-50">
            <div className="flex items-start gap-3">
              <Checkbox
                id="data_verification"
                checked={formData.data_verification}
                onCheckedChange={(checked) => handleCheckboxChange('data_verification', checked as boolean)}
                className="mt-1"
              />
              <div className="space-y-1">
                <label 
                  htmlFor="data_verification" 
                  className="text-sm font-medium text-blue-800 cursor-pointer"
                >
                  Verificación de Datos *
                </label>
                <p className="text-sm text-blue-700">
                  Confirmo que toda la información proporcionada durante este proceso es veraz, 
                  completa y actualizada. Me comprometo a notificar cualquier cambio relevante.
                </p>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="p-4 border border-gray-200 rounded-[10px]">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms_accepted"
                checked={formData.terms_accepted}
                onCheckedChange={(checked) => handleCheckboxChange('terms_accepted', checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1 space-y-2">
                <label 
                  htmlFor="terms_accepted" 
                  className="text-sm font-medium cursor-pointer block"
                >
                  Términos y Condiciones de Incorporación *
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTerms(!showTerms)}
                    className="text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {showTerms ? 'Ocultar' : 'Ver'} Términos
                  </Button>
                </div>
                {showTerms && (
                  <div className="mt-3 p-3 bg-gray-50 border rounded-md text-xs text-gray-700 max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans">{termsAndConditions}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className="p-4 border border-gray-200 rounded-[10px]">
            <div className="flex items-start gap-3">
              <Checkbox
                id="privacy_accepted"
                checked={formData.privacy_accepted}
                onCheckedChange={(checked) => handleCheckboxChange('privacy_accepted', checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1 space-y-2">
                <label 
                  htmlFor="privacy_accepted" 
                  className="text-sm font-medium cursor-pointer block"
                >
                  Política de Privacidad y Protección de Datos *
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPrivacy(!showPrivacy)}
                    className="text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {showPrivacy ? 'Ocultar' : 'Ver'} Política
                  </Button>
                </div>
                {showPrivacy && (
                  <div className="mt-3 p-3 bg-gray-50 border rounded-md text-xs text-gray-700 max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans">{privacyPolicy}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Labor Contract */}
          <div className="p-4 border border-gray-200 rounded-[10px]">
            <div className="flex items-start gap-3">
              <Checkbox
                id="labor_contract_accepted"
                checked={formData.labor_contract_accepted}
                onCheckedChange={(checked) => handleCheckboxChange('labor_contract_accepted', checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1 space-y-2">
                <label 
                  htmlFor="labor_contract_accepted" 
                  className="text-sm font-medium cursor-pointer block"
                >
                  Contrato de Trabajo *
                </label>
                <p className="text-sm text-gray-600">
                  Acepto las condiciones laborales especificadas en el contrato de trabajo que recibiré tras completar este proceso.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadContract}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Descargar Contrato (Borrador)
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-0.5 border-gray-200 rounded-[10px]">
        <CardHeader>
          <CardTitle className="text-base">Resumen de Aceptaciones</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {formData.signature ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Firma digital</span>
              <Badge variant={formData.signature ? "default" : "destructive"} className="text-xs">
                {formData.signature ? "Completado" : "Pendiente"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {formData.data_verification ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Verificación de datos</span>
              <Badge variant={formData.data_verification ? "default" : "destructive"} className="text-xs">
                {formData.data_verification ? "Aceptado" : "Pendiente"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {formData.terms_accepted ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Términos y condiciones</span>
              <Badge variant={formData.terms_accepted ? "default" : "destructive"} className="text-xs">
                {formData.terms_accepted ? "Aceptado" : "Pendiente"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {formData.privacy_accepted ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Política de privacidad</span>
              <Badge variant={formData.privacy_accepted ? "default" : "destructive"} className="text-xs">
                {formData.privacy_accepted ? "Aceptado" : "Pendiente"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {formData.labor_contract_accepted ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Contrato laboral</span>
              <Badge variant={formData.labor_contract_accepted ? "default" : "destructive"} className="text-xs">
                {formData.labor_contract_accepted ? "Aceptado" : "Pendiente"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Notice */}
      <Card className="bg-purple-50 border-purple-200 border-0.5 rounded-[10px]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <PenTool className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-purple-800 mb-1">
                Paso Final
              </h4>
              <p className="text-sm text-purple-700">
                Una vez que firmes y aceptes todos los términos, el proceso de incorporación 
                estará completo. Recibirás un email de confirmación con los siguientes pasos y 
                la información necesaria para tu primer día de trabajo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}