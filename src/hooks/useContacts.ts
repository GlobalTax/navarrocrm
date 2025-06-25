
import { useState, useMemo } from 'react'
import { useOptimizedContacts } from './contacts/useOptimizedContacts'

export interface Contact {
  id: string
  org_id: string
  name: string
  email?: string
  phone?: string
  dni_nif?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  address_country?: string
  legal_representative?: string
  client_type?: string
  business_sector?: string
  how_found_us?: string
  contact_preference?: string
  preferred_language?: string
  payment_method?: string
  status?: string
  tags?: string[]
  internal_notes?: string
  preferred_meeting_time?: string
  timezone?: string
  relationship_type: string
  hourly_rate?: number
  last_contact_date?: string
  email_preferences?: any
  created_at: string
  updated_at: string
}

export const useContacts = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [relationshipFilter, setRelationshipFilter] = useState<string>('all')

  // Usar el hook optimizado
  const optimizedResult = useOptimizedContacts({
    status: statusFilter,
    relationship_type: relationshipFilter,
    searchTerm: searchTerm.trim() || undefined
  })

  // Extraer propiedades del resultado optimizado
  const contacts = optimizedResult.data || []
  const isLoading = optimizedResult.isLoading || false
  const error = optimizedResult.error || null

  // Crear funciones mock para propiedades que no existen en QueryResult
  const hasMore = false // Mock value
  const loadMore = () => {} // Mock function
  const refetch = () => Promise.resolve() // Mock function

  // Filtrar en memoria solo si es necesario (para compatibilidad)
  const filteredContacts = useMemo(() => {
    return contacts || []
  }, [contacts])

  return {
    contacts: contacts || [],
    filteredContacts,
    isLoading,
    error,
    count: contacts?.length || 0,
    hasMore,
    loadMore,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    relationshipFilter,
    setRelationshipFilter
  }
}
