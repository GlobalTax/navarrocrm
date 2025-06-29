
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export const useCreateTestContacts = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const createTestContacts = useMutation({
    mutationFn: async () => {
      if (!user?.org_id) {
        throw new Error('No hay organización disponible')
      }

      const testContacts = [
        {
          name: 'María García López',
          email: 'maria.garcia@ejemplo.com',
          phone: '+34 612 345 678',
          dni_nif: '12345678A',
          client_type: 'particular',
          relationship_type: 'cliente',
          status: 'activo',
          business_sector: 'Consultoría',
          address_street: 'Calle Mayor 123',
          address_city: 'Madrid',
          address_postal_code: '28013',
          org_id: user.org_id
        },
        {
          name: 'Juan Martínez Pérez',
          email: 'juan.martinez@ejemplo.com',
          phone: '+34 623 456 789',
          dni_nif: '87654321B',
          client_type: 'particular',
          relationship_type: 'cliente',
          status: 'activo',
          business_sector: 'Tecnología',
          address_street: 'Avenida Libertad 45',
          address_city: 'Barcelona',
          address_postal_code: '08001',
          org_id: user.org_id
        },
        {
          name: 'Innovación Tecnológica SL',
          email: 'contacto@innovaciontech.com',
          phone: '+34 634 567 890',
          dni_nif: 'B12345678',
          client_type: 'empresa',
          relationship_type: 'cliente',
          status: 'activo',
          business_sector: 'Desarrollo Software',
          address_street: 'Polígono Industrial Norte, Nave 7',
          address_city: 'Valencia',
          address_postal_code: '46015',
          org_id: user.org_id
        },
        {
          name: 'Ana Rodríguez Silva',
          email: 'ana.rodriguez@ejemplo.com',
          phone: '+34 645 678 901',
          dni_nif: '11223344C',
          client_type: 'particular',
          relationship_type: 'cliente',
          status: 'activo',
          business_sector: 'Marketing',
          address_street: 'Plaza España 8, 2º A',
          address_city: 'Sevilla',
          address_postal_code: '41013',
          org_id: user.org_id
        },
        {
          name: 'Servicios Profesionales Andalucía SA',
          email: 'info@servprofand.es',
          phone: '+34 656 789 012',
          dni_nif: 'A87654321',
          client_type: 'empresa',
          relationship_type: 'cliente',
          status: 'activo',
          business_sector: 'Servicios Profesionales',
          address_street: 'Calle Comercio 156',
          address_city: 'Málaga',
          address_postal_code: '29006',
          org_id: user.org_id
        },
        {
          name: 'Pedro Fernández Costa',
          relationship_type: 'prospecto',
          status: 'activo',
          client_type: 'particular',
          phone: '+34 667 890 123',
          business_sector: 'Retail',
          address_street: 'Calle Nueva 89',
          address_city: 'Bilbao',
          address_postal_code: '48001',
          org_id: user.org_id
        }
      ]

      const { data, error } = await supabase
        .from('contacts')
        .insert(testContacts)
        .select()

      if (error) {
        console.error('Error creating test contacts:', error)
        throw error
      }

      return data
    },
    onSuccess: (data) => {
      const clientsCount = data?.filter(c => c.relationship_type === 'cliente').length || 0
      const prospectsCount = data?.filter(c => c.relationship_type === 'prospecto').length || 0
      
      toast.success(`Contactos de prueba creados exitosamente: ${clientsCount} clientes y ${prospectsCount} prospectos`)
      
      // Invalidar las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
    onError: (error) => {
      console.error('Error creating test contacts:', error)
      toast.error('Error al crear contactos de prueba: ' + error.message)
    }
  })

  return {
    createTestContacts: createTestContacts.mutate,
    isCreating: createTestContacts.isPending
  }
}
