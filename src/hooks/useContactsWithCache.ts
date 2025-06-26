
import React, { useState } from 'react'
import { useOptimizedAPICache } from '@/hooks/cache'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  created_at: string
  dni_nif: string | null
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_country: string | null
  legal_representative: string | null
  client_type: string | null
  business_sector: string | null
  how_found_us: string | null
  contact_preference: string | null
  preferred_language: string | null
  hourly_rate: number | null
  payment_method: string | null
  status: string | null
  relationship_type: string | null
  tags: string[] | null
  internal_notes: string | null
  last_contact_date: string | null
}

interface ContactStats {
  status: string
  relationship_type: string
}

export const useContactsWithCache = () => {
  const { user } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [relationshipFilter, setRelationshipFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])

  // Usar el nuevo cache híbrido optimizado para APIs
  const apiCache = useOptimizedAPICache()

  const fetchContacts = async (): Promise<Contact[]> => {
    if (!user?.org_id) {
      console.log('👥 No org_id disponible para obtener contactos')
      return []
    }
    
    console.log('👥 Obteniendo contactos desde API:', user.org_id)
    
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching contacts:', error)
      throw error
    }
    
    console.log('✅ Contactos obtenidos desde API:', data?.length || 0)
    return data || []
  }

  const loadContacts = async (forceRefresh = false) => {
    if (!user?.org_id || !apiCache.isReady) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await apiCache.fetchWithCache(
        `contacts_${user.org_id}`,
        fetchContacts,
        {
          priority: 'high', // Los contactos son datos críticos
          forceRefresh,
          ttl: 10 * 60 * 1000, // 10 minutos de cache
        }
      )
      
      setContacts(data)
    } catch (err) {
      console.error('❌ Error loading contacts:', err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar contactos cuando el cache esté listo
  React.useEffect(() => {
    if (apiCache.isReady && user?.org_id) {
      loadContacts()
    }
  }, [apiCache.isReady, user?.org_id])

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.includes(searchTerm) ||
      contact.dni_nif?.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
    const matchesRelationship = relationshipFilter === 'all' || contact.relationship_type === relationshipFilter

    return matchesSearch && matchesStatus && matchesRelationship
  })

  const refetch = async () => {
    await loadContacts(true) // Forzar refresh
  }

  // Precargar datos relacionados cuando sea apropiado
  const preloadRelatedData = async () => {
    if (!apiCache.isReady || !user?.org_id) return

    try {
      // Precargar estadísticas de contactos
      await apiCache.preloadData(
        `contact_stats_${user.org_id}`,
        async () => {
          const { data } = await supabase
            .from('contacts')
            .select('status, relationship_type')
            .eq('org_id', user.org_id)
          
          return (data || []) as ContactStats[]
        },
        'medium'
      )
    } catch (error) {
      console.warn('⚠️ Error precargando datos relacionados:', error)
    }
  }

  return {
    contacts,
    filteredContacts,
    isLoading,
    error,
    refetch,
    preloadRelatedData,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,  
    relationshipFilter,
    setRelationshipFilter,
    cacheStats: apiCache.stats
  }
}

export type { Contact }
