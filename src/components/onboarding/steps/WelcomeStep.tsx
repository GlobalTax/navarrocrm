import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, CheckCircle, Clock, Users } from 'lucide-react'

interface WelcomeStepProps {
  stepData: any
  clientData: any
  onUpdate: (data: any) => void
}

export function WelcomeStep({ onUpdate }: WelcomeStepProps) {
  React.useEffect(() => {
    // Marcar como completado automáticamente después de 2 segundos
    const timeout = setTimeout(() => {
      onUpdate({ welcomeViewed: true, timestamp: new Date().toISOString() })
    }, 2000)

    return () => clearTimeout(timeout)
  }, [onUpdate])

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <UserPlus className="h-8 w-8 text-primary" />
        </div>
        
        <h3 className="text-2xl font-semibold text-gray-900">
          ¡Bienvenido a nuestro despacho!
        </h3>
        
        <p className="text-gray-600 max-w-md mx-auto">
          Nos complace que haya elegido nuestros servicios. A continuación, le guiaremos 
          a través de un proceso sencillo para conocerle mejor y poder ofrecerle el mejor servicio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0.5 border-gray-200 rounded-[10px]">
          <CardHeader className="text-center pb-2">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
            <CardTitle className="text-sm font-medium">Proceso Sencillo</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xs text-gray-600">
              Solo unos minutos para completar su información
            </p>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-gray-200 rounded-[10px]">
          <CardHeader className="text-center pb-2">
            <Clock className="h-8 w-8 text-blue-600 mx-auto" />
            <CardTitle className="text-sm font-medium">Tiempo Estimado</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xs text-gray-600">
              Entre 5-10 minutos dependiendo del caso
            </p>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-gray-200 rounded-[10px]">
          <CardHeader className="text-center pb-2">
            <Users className="h-8 w-8 text-purple-600 mx-auto" />
            <CardTitle className="text-sm font-medium">Equipo Experto</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xs text-gray-600">
              Nuestro equipo le acompañará en todo momento
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-[10px] p-4">
        <h4 className="font-medium text-blue-900 mb-2">¿Qué información necesitaremos?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Sus datos de contacto principales</li>
          <li>• Tipo de cliente (particular o empresa)</li>
          <li>• Áreas legales de su interés</li>
          <li>• Preferencias de comunicación</li>
        </ul>
      </div>
    </div>
  )
}