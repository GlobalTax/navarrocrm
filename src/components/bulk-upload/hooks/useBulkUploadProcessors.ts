
import { supabase } from '@/integrations/supabase/client'
import { 
  ContactInsertData, 
  UserInvitationInsertData, 
  HubSpotContactInsertData,
  BulkUploadProcessorResult 
} from '@/types/bulkUpload'
import { 
  ContactValidationData, 
  UserValidationData, 
  HubSpotValidationData 
} from './useBulkUploadValidators'

export const useBulkUploadProcessors = () => {
  const processContacts = async (
    validatedData: ContactValidationData[], 
    orgId: string
  ): Promise<number> => {
    const batchSize = 10
    let successCount = 0

    for (let i = 0; i < validatedData.length; i += batchSize) {
      const batch = validatedData.slice(i, i + batchSize)
      
      const contactsToInsert: ContactInsertData[] = batch.map(contact => ({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        address_street: contact.address_street,
        address_city: contact.address_city,
        address_postal_code: contact.address_postal_code,
        address_country: contact.address_country || 'España',
        client_type: (contact.client_type as ContactInsertData['client_type']) || 'particular',
        status: (contact.status as ContactInsertData['status']) || 'activo',
        relationship_type: (contact.relationship_type as ContactInsertData['relationship_type']) || 'prospecto',
        org_id: orgId
      }))

      const { error } = await supabase
        .from('contacts')
        .insert(contactsToInsert)

      if (error) throw error

      successCount += batch.length
    }

    return successCount
  }

  const processUsers = async (
    validatedData: UserValidationData[], 
    orgId: string
  ): Promise<number> => {
    const batchSize = 10
    let successCount = 0

    // Obtener el usuario actual para invited_by
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    for (let i = 0; i < validatedData.length; i += batchSize) {
      const batch = validatedData.slice(i, i + batchSize)
      
      const usersToInsert: UserInvitationInsertData[] = batch.map(userData => ({
        email: userData.email,
        role: userData.role as UserInvitationInsertData['role'],
        org_id: orgId,
        invited_by: user.id,
        token: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
      }))

      const { error } = await supabase
        .from('user_invitations')
        .insert(usersToInsert)

      if (error) throw error

      successCount += batch.length
    }

    return successCount
  }

  const processHubSpotContacts = async (
    validatedData: HubSpotValidationData[], 
    orgId: string
  ): Promise<number> => {
    const batchSize = 10
    let successCount = 0

    for (let i = 0; i < validatedData.length; i += batchSize) {
      const batch = validatedData.slice(i, i + batchSize)
      
      const contactsToInsert: HubSpotContactInsertData[] = batch.map(contact => ({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        company_id: null, // Se podría mapear a una empresa si existe
        address_street: undefined,
        address_city: undefined,
        address_postal_code: undefined,
        address_country: 'España',
        client_type: contact.company ? 'empresa' : 'particular',
        status: 'activo' as const,
        relationship_type: 'prospecto' as const,
        business_sector: contact.industry,
        how_found_us: 'HubSpot',
        internal_notes: `Importado desde HubSpot. Lifecycle: ${contact.lifecycle_stage}, Lead Status: ${contact.lead_status}`,
        org_id: orgId
      }))

      const { error } = await supabase
        .from('contacts')
        .insert(contactsToInsert)

      if (error) throw error

      successCount += batch.length
    }

    return successCount
  }

  const processWithAI = async (
    validatedData: Record<string, any>[], 
    dataType: string, 
    orgId: string
  ): Promise<number> => {
    const batchSize = 10
    let successCount = 0

    for (let i = 0; i < validatedData.length; i += batchSize) {
      const batch = validatedData.slice(i, i + batchSize)
      
      const itemsToInsert = batch.map(item => ({
        ...item,
        org_id: orgId
      }))

      const tableName = dataType === 'users' ? 'user_invitations' : dataType
      const { error } = await supabase
        .from(tableName as 'contacts' | 'user_invitations')
        .insert(itemsToInsert)

      if (error) throw error

      successCount += batch.length
    }

    return successCount
  }

  return {
    processContacts,
    processUsers,
    processHubSpotContacts,
    processWithAI
  }
}
