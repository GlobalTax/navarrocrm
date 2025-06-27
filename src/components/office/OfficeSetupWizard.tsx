
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Building2, 
  Monitor, 
  CheckCircle
} from 'lucide-react'
import { useOfficeSetupWizard } from '@/hooks/office/useOfficeSetupWizard'
import { WizardStepNavigation } from './wizard/WizardStepNavigation'
import { CreateRoomsStep } from './wizard/CreateRoomsStep'
import { CreateEquipmentStep } from './wizard/CreateEquipmentStep'
import { CompletedStep } from './wizard/CompletedStep'

interface OfficeSetupWizardProps {
  onComplete: () => void
}

export const OfficeSetupWizard = ({ onComplete }: OfficeSetupWizardProps) => {
  const {
    currentStep,
    sampleRooms,
    handleCreateSampleRooms,
    handleCreateSampleEquipment,
    handleComplete,
    isCreatingRooms,
    isCreatingEquipment
  } = useOfficeSetupWizard(onComplete)

  const steps = [
    {
      title: 'Crear Salas',
      description: 'Configurar las primeras salas de la oficina',
      icon: Building2,
      action: handleCreateSampleRooms,
      loading: isCreatingRooms
    },
    {
      title: 'Registrar Equipos',
      description: 'Añadir algunos equipos básicos',
      icon: Monitor,
      action: handleCreateSampleEquipment,
      loading: isCreatingEquipment
    },
    {
      title: 'Finalizar',
      description: 'Configuración inicial completada',
      icon: CheckCircle,
      action: handleComplete,
      loading: false
    }
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <CreateRoomsStep sampleRooms={sampleRooms} />
      case 1:
        return <CreateEquipmentStep />
      case 2:
        return <CompletedStep />
      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Configuración Inicial de Oficina</h2>
        <p className="text-gray-600">
          Te ayudamos a configurar tu sistema de gestión de oficina con algunos datos de ejemplo
        </p>
      </div>

      <WizardStepNavigation steps={steps} currentStep={currentStep} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <steps[currentStep].icon className="h-5 w-5" />
            {steps[currentStep].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">{steps[currentStep].description}</p>
          
          {renderStepContent()}

          <Button 
            onClick={steps[currentStep].action}
            disabled={steps[currentStep].loading}
            className="w-full"
          >
            {steps[currentStep].loading ? 'Procesando...' : 
             currentStep === 2 ? 'Comenzar a usar el sistema' : 'Continuar'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
