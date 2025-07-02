import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Building, CheckCircle } from 'lucide-react'

interface ClientTypeStepProps {
  stepData: any
  clientData: any
  onUpdate: (data: any) => void
}

export function ClientTypeStep({ stepData, onUpdate }: ClientTypeStepProps) {
  const [selectedType, setSelectedType] = useState<'particular' | 'empresa' | null>(
    stepData?.clientType || null
  )

  const handleTypeSelect = (type: 'particular' | 'empresa') => {
    setSelectedType(type)
    onUpdate({ 
      clientType: type,
      timestamp: new Date().toISOString()
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">
          Tipo de Cliente
        </h3>
        <p className="text-gray-600">
          Seleccione el tipo de cliente para personalizar el proceso según sus necesidades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className={`border-0.5 rounded-[10px] cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedType === 'particular' 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleTypeSelect('particular')}
        >
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              Persona Física
              {selectedType === 'particular' && (
                <CheckCircle className="h-5 w-5 text-primary" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Soy un particular que necesita asesoramiento jurídico personal
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Derecho civil</p>
              <p>• Derecho de familia</p>
              <p>• Herencias y sucesiones</p>
              <p>• Accidentes de tráfico</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`border-0.5 rounded-[10px] cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedType === 'empresa' 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleTypeSelect('empresa')}
        >
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <Building className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              Empresa
              {selectedType === 'empresa' && (
                <CheckCircle className="h-5 w-5 text-primary" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Represento una empresa que necesita servicios jurídicos empresariales
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Derecho mercantil</p>
              <p>• Derecho laboral</p>
              <p>• Compliance</p>
              <p>• Contratos comerciales</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedType && (
        <div className="bg-green-50 border border-green-200 rounded-[10px] p-4 text-center">
          <p className="text-sm text-green-800">
            ✓ Perfecto, hemos configurado el proceso para {selectedType === 'particular' ? 'persona física' : 'empresa'}
          </p>
        </div>
      )}
    </div>
  )
}