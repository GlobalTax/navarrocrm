
import { useState } from 'react'
import { useCreateOfficeRoom } from '@/hooks/useOfficeRooms'
import { useCreateEquipment } from '@/hooks/useEquipment'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'

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
      // Get the user's org_id
      const user = await supabase.auth.getUser()
      if (!user.data.user?.user_metadata?.org_id) {
        throw new Error('No organization ID found')
      }

      const createdIds: string[] = []
      
      for (const room of sampleRooms) {
        const roomWithOrgId = {
          ...room,
          org_id: user.data.user.user_metadata.org_id
        }
        
        const result = await new Promise((resolve, reject) => {
          createRoom.mutate(roomWithOrgId, {
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
      // Get the user's org_id
      const user = await supabase.auth.getUser()
      if (!user.data.user?.user_metadata?.org_id) {
        throw new Error('No organization ID found')
      }

      const sampleEquipment = [
        {
          name: 'Proyector Epson',
          category: 'audiovisual',
          status: 'available' as const,
          condition: 'excellent' as const,
          brand: 'Epson',
          model: 'EB-X41',
          org_id: user.data.user.user_metadata.org_id
        },
        {
          name: 'Portátil Dell',
          category: 'informatica',
          status: 'available' as const,
          condition: 'good' as const,
          brand: 'Dell',
          model: 'Latitude 5520',
          org_id: user.data.user.user_metadata.org_id
        }
      ]

      for (const equipment of sampleEquipment) {
        await new Promise((resolve, reject) => {
          createEquipment.mutate(equipment, {
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
