
import { supabase } from '@/integrations/supabase/client'
import type { SeedClient } from './types'

export const createClients = async (orgId: string) => {
  const clients: SeedClient[] = [
    {
      name: 'Constructora Mediterráneo S.L.',
      email: 'contacto@construcciones-med.com',
      phone: '+34 965 123 456',
      dni_nif: 'B12345678',
      client_type: 'empresa',
      address_street: 'Av. de la Construcción, 45',
      address_city: 'Valencia',
      address_postal_code: '46001',
      business_sector: 'Construcción',
      status: 'activo',
      hourly_rate: 180,
      org_id: orgId
    },
    {
      name: 'María Carmen López Ruiz',
      email: 'mcarmen.lopez@email.com',
      phone: '+34 678 901 234',
      dni_nif: '12345678A',
      client_type: 'particular',
      address_street: 'Calle Mayor, 123, 3º B',
      address_city: 'Madrid',
      address_postal_code: '28001',
      status: 'activo',
      hourly_rate: 120,
      org_id: orgId
    },
    {
      name: 'Restaurantes Gourmet Group S.A.',
      email: 'legal@gourmetgroup.es',
      phone: '+34 913 456 789',
      dni_nif: 'A87654321',
      client_type: 'empresa',
      address_street: 'Paseo de la Castellana, 200',
      address_city: 'Madrid',
      address_postal_code: '28046',
      business_sector: 'Hostelería',
      status: 'activo',
      hourly_rate: 200,
      org_id: orgId
    },
    {
      name: 'José Antonio Fernández García',
      email: 'ja.fernandez@email.com',
      phone: '+34 654 321 098',
      dni_nif: '87654321B',
      client_type: 'particular',
      address_street: 'Plaza del Carmen, 8, 2º A',
      address_city: 'Sevilla',
      address_postal_code: '41001',
      status: 'activo',
      hourly_rate: 140,
      org_id: orgId
    },
    {
      name: 'TechStart Solutions S.L.',
      email: 'legal@techstart.com',
      phone: '+34 932 567 890',
      dni_nif: 'B98765432',
      client_type: 'empresa',
      address_street: 'Rambla de Catalunya, 85',
      address_city: 'Barcelona',
      address_postal_code: '08008',
      business_sector: 'Tecnología',
      status: 'activo',
      hourly_rate: 160,
      org_id: orgId
    }
  ]

  const { data: createdClients } = await supabase
    .from('clients')
    .insert(clients)
    .select()

  return createdClients || []
}
