import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, User, Building, Mail, Phone, MapPin, Scale, Calendar } from 'lucide-react'

interface SummaryStepProps {
  stepData: any
  clientData: any
  onUpdate: (data: any) => void
}

const legalServices = {
  'civil': 'Derecho Civil',
  'family': 'Derecho de Familia',
  'real_estate': 'Derecho Inmobiliario',
  'traffic': 'Accidentes de Tráfico',
  'inheritance': 'Herencias y Sucesiones',
  'commercial': 'Derecho Mercantil',
  'labor': 'Derecho Laboral',
  'criminal': 'Derecho Penal',
  'administrative': 'Derecho Administrativo',
  'tax': 'Derecho Tributario'
}

export function SummaryStep({ stepData, clientData }: SummaryStepProps) {
  const clientType = stepData['client-type-step']?.clientType
  const basicInfo = stepData['basic-info-step']
  const businessInfo = stepData['business-info-step']
  const services = stepData['services-step']
  const preferences = stepData['preferences-step']

  const selectedServices = services?.selectedServices || []
  const selectedServiceNames = selectedServices.map((id: string) => legalServices[id as keyof typeof legalServices]).filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        
        <h3 className="text-2xl font-semibold text-gray-900">
          ¡Proceso Completado!
        </h3>
        
        <p className="text-gray-600 max-w-md mx-auto">
          Hemos recopilado toda su información. A continuación puede revisar los datos 
          antes de finalizar el proceso.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información Personal/Empresarial */}
        <Card className="border-0.5 border-gray-200 rounded-[10px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {clientType === 'empresa' ? <Building className="h-5 w-5" /> : <User className="h-5 w-5" />}
              {clientType === 'empresa' ? 'Información de la Empresa' : 'Información Personal'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="font-medium text-gray-900">
                {clientType === 'empresa' ? businessInfo?.business_name : basicInfo?.name}
              </p>
              
              {basicInfo?.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {basicInfo.email}
                </div>
              )}
              
              {basicInfo?.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {basicInfo.phone}
                </div>
              )}
              
              {(businessInfo?.address_street || basicInfo?.address) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {businessInfo?.address_street || basicInfo?.address}
                  {(businessInfo?.address_city || basicInfo?.city) && 
                    `, ${businessInfo?.address_city || basicInfo?.city}`}
                </div>
              )}
            </div>

            {clientType === 'empresa' && (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                {businessInfo?.tax_id && (
                  <div className="text-sm">
                    <span className="font-medium">NIF/CIF:</span> {businessInfo.tax_id}
                  </div>
                )}
                {businessInfo?.business_sector && (
                  <div className="text-sm">
                    <span className="font-medium">Sector:</span> {businessInfo.business_sector}
                  </div>
                )}
                {businessInfo?.legal_form && (
                  <div className="text-sm">
                    <span className="font-medium">Forma jurídica:</span> {businessInfo.legal_form}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Servicios Seleccionados */}
        <Card className="border-0.5 border-gray-200 rounded-[10px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scale className="h-5 w-5" />
              Servicios de Interés
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedServiceNames.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Ha seleccionado {selectedServiceNames.length} área(s) de interés:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedServiceNames.map((serviceName, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {serviceName}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No se han seleccionado servicios específicos
              </p>
            )}
          </CardContent>
        </Card>

        {/* Preferencias de Comunicación */}
        {preferences && (
          <Card className="border-0.5 border-gray-200 rounded-[10px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5" />
                Preferencias de Comunicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {preferences.contact_preference && (
                <div className="text-sm">
                  <span className="font-medium">Preferencia de contacto:</span>{' '}
                  {preferences.contact_preference}
                </div>
              )}
              {preferences.preferred_time && (
                <div className="text-sm">
                  <span className="font-medium">Horario preferido:</span>{' '}
                  {preferences.preferred_time}
                </div>
              )}
              {preferences.communication_frequency && (
                <div className="text-sm">
                  <span className="font-medium">Frecuencia de comunicación:</span>{' '}
                  {preferences.communication_frequency}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Próximos Pasos */}
        <Card className="border-0.5 border-gray-200 rounded-[10px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Próximos Pasos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Confirmación por email</p>
                  <p className="text-gray-600">Recibirá un email de confirmación en los próximos minutos</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Asignación de abogado</p>
                  <p className="text-gray-600">Le asignaremos un abogado especializado en 24-48 horas</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Primera consulta</p>
                  <p className="text-gray-600">Programaremos una consulta inicial gratuita</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-[10px] p-6 text-center">
        <h4 className="font-medium text-green-900 mb-2">
          ¡Gracias por confiar en nosotros!
        </h4>
        <p className="text-sm text-green-800">
          Su información ha sido registrada correctamente. Nuestro equipo se pondrá en contacto 
          con usted en breve para comenzar a trabajar en su caso.
        </p>
      </div>
    </div>
  )
}