
import { useState } from 'react'
import { useCreateOfficeRoom } from '@/hooks/useOfficeRooms'
import { useCreateEquipment } from '@/hooks/useEquipment'
import { toast } from 'sonner'

export const useOfficeSetupWizard = (onComplete: () => void) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [createdRooms, setCreatedRooms] = useState<string[]>([])
  
  const createRoom = useCreateOfficeRoom()
  const createEquipment = useCreateEquipment()

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
      toast.success('Equipos registrados correctly')
    } catch (error) {
      console.error('Error creating sample equipment:', error)
      toast.error('Error al registrar los equipos')
    }
  }

  const handleComplete = () => {
    toast.success('Configuración inicial completada')
    onComplete()
  }

  return {
    currentStep,
    createdRooms,
    sampleRooms,
    handleCreateSampleRooms,
    handleCreateSampleEquipment,
    handleComplete,
    isCreatingRooms: createRoom.isPending,
    isCreatingEquipment: createEquipment.isPending
  }
}
