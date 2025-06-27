
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Monitor, 
  Calendar,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { useCreateOfficeRoom } from '@/hooks/useOfficeRooms'
import { useCreateEquipment } from '@/hooks/useEquipment'
import { useCreateReservation } from '@/hooks/useRoomReservations'
import { toast } from 'sonner'

interface OfficeSetupWizardProps {
  onComplete: () => void
}

export const OfficeSetupWizard = ({ onComplete }: OfficeSetupWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [createdRooms, setCreatedRooms] = useState<string[]>([])
  
  const createRoom = useCreateOfficeRoom()
  const createEquipment = useCreateEquipment()
  const createReservation = useCreateReservation()

  const sampleRooms = [
    {
      name: 'Sala de Reuniones Principal',
      description: 'Sala principal para reuniones con clientes',
      capacity: 8,
      room_type: 'meeting_room',
      location: 'Planta 1',
      equipment_available: ['Proyector', 'Pizarra', 'Videoconferencia'],
      hourly_rate: 25,
      is_bookable: true,
      is_active: true,
      amenities: { wifi: true, air_conditioning: true }
    },
    {
      name: 'Despacho del Socio',
      description: 'Despacho privado para reuniones confidenciales',
      capacity: 4,
      room_type: 'office',
      location: 'Planta 2',
      equipment_available: ['Mesa de reuniones', 'Teléfono'],
      hourly_rate: 50,
      is_bookable: true,
      is_active: true,
      amenities: { wifi: true, privacy: true }
    },
    {
      name: 'Sala de Conferencias',
      description: 'Sala grande para presentaciones y formaciones',
      capacity: 20,
      room_type: 'conference_room',
      location: 'Planta 1',
      equipment_available: ['Proyector HD', 'Sistema de sonido', 'Micrófono'],
      hourly_rate: 40,
      is_bookable: true,
      is_active: true,
      amenities: { wifi: true, presentation_equipment: true }
    }
  ]

  const handleCreateSampleRooms = async () => {
    try {
      const createdIds: string[] = []
      
      for (const room of sampleRooms) {
        const result = await new Promise((resolve, reject) => {
          createRoom.mutate(room, {
            onSuccess: (data) => resolve(data),
            onError: (error) => reject(error)
          })
        })
        
        createdIds.push((result as any).id)
      }
      
      setCreatedRooms(createdIds)
      setCurrentStep(1)
      toast.success('Salas creadas correctamente')
    } catch (error) {
      console.error('Error creating sample rooms:', error)
      toast.error('Error al crear las salas')
    }
  }

  const handleCreateSampleEquipment = async () => {
    try {
      const sampleEquipment = [
        {
          name: 'Proyector Epson',
          category: 'audiovisual',
          status: 'available',
          condition: 'excellent',
          brand: 'Epson',
          model: 'EB-X41'
        },
        {
          name: 'Portátil Dell',
          category: 'informatica',
          status: 'available',
          condition: 'good',
          brand: 'Dell',
          model: 'Latitude 5520'
        }
      ]

      for (const equipment of sampleEquipment) {
        await new Promise((resolve, reject) => {
          createEquipment.mutate(equipment as any, {
            onSuccess: (data) => resolve(data),
            onError: (error) => reject(error)
          })
        })
      }
      
      setCurrentStep(2)
      toast.success('Equipos registrados correctamente')
    } catch (error) {
      console.error('Error creating sample equipment:', error)
      toast.error('Error al registrar los equipos')
    }
  }

  const handleComplete = () => {
    toast.success('Configuración inicial completada')
    onComplete()
  }

  const steps = [
    {
      title: 'Crear Salas',
      description: 'Configurar las primeras salas de la oficina',
      icon: Building2,
      action: handleCreateSampleRooms,
      loading: createRoom.isPending
    },
    {
      title: 'Registrar Equipos',
      description: 'Añadir algunos equipos básicos',
      icon: Monitor,
      action: handleCreateSampleEquipment,
      loading: createEquipment.isPending
    },
    {
      title: 'Finalizar',
      description: 'Configuración inicial completada',
      icon: CheckCircle,
      action: handleComplete,
      loading: false
    }
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Configuración Inicial de Oficina</h2>
        <p className="text-gray-600">
          Te ayudamos a configurar tu sistema de gestión de oficina con algunos datos de ejemplo
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${index <= currentStep 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-400'
                }
              `}>
                {index < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <steps[currentStep].icon className="h-5 w-5" />
            {steps[currentStep].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">{steps[currentStep].description}</p>
          
          {currentStep === 0 && (
            <div className="space-y-2">
              <p className="font-medium">Se crearán las siguientes salas:</p>
              {sampleRooms.map((room, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{room.name}</span>
                  <Badge variant="outline">{room.capacity} personas</Badge>
                </div>
              ))}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-2">
              <p className="font-medium">Se registrarán algunos equipos básicos:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-gray-50 rounded text-center">
                  <Monitor className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-sm">Proyector</span>
                </div>
                <div className="p-2 bg-gray-50 rounded text-center">
                  <Monitor className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-sm">Portátil</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center space-y-3">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <p>¡Perfecto! Tu sistema de gestión de oficina está listo para usar.</p>
              <p className="text-sm text-gray-600">
                Ahora puedes empezar a crear reservas, gestionar equipos y administrar tu oficina.
              </p>
            </div>
          )}

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
