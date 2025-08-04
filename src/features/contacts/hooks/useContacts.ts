/**
 * Contacts Hooks
 * 
 * Hooks principales para gestión de contactos
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useApp } from '@/contexts/AppContext'
import { contactsService } from '../services/ContactsService'
import { Contact, ContactFormData, ContactSearchParams } from '../types'
import { CONTACTS_PAGE_SIZE, CONTACTS_SEARCH_MIN_LENGTH } from '../constants'

/**
 * Hook principal para gestionar contactos
 */
export const useContacts = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [relationshipFilter, setRelationshipFilter] = useState<string>('all')

  // Query para obtener contactos
  const contactsQuery = useQuery({
    queryKey: ['contacts', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      return contactsService.getContacts(user.org_id)
    },
    enabled: !!user?.org_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  // Filtrar contactos localmente
  const filteredContacts = (contactsQuery.data || []).filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.phone && contact.phone.includes(searchTerm))

    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
    const matchesRelationship = relationshipFilter === 'all' || contact.relationship_type === relationshipFilter

    return matchesSearch && matchesStatus && matchesRelationship
  })

  // Mutation para crear contacto
  const createContactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      if (!user?.org_id) throw new Error('Organization ID not found')
      return contactsService.createContact(data, user.org_id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Contacto creado exitosamente')
    },
    onError: (error: any) => {
      console.error('❌ [useContacts] Create error:', error)
      toast.error(error.message || 'Error al crear contacto')
    }
  })

  // Mutation para actualizar contacto
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContactFormData> }) => {
      if (!user?.org_id) throw new Error('Organization ID not found')
      return contactsService.updateContact(id, data, user.org_id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Contacto actualizado exitosamente')
    },
    onError: (error: any) => {
      console.error('❌ [useContacts] Update error:', error)
      toast.error(error.message || 'Error al actualizar contacto')
    }
  })

  // Mutation para eliminar contacto
  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.org_id) throw new Error('Organization ID not found')
      return contactsService.deleteContact(id, user.org_id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Contacto eliminado exitosamente')
    },
    onError: (error: any) => {
      console.error('❌ [useContacts] Delete error:', error)
      toast.error(error.message || 'Error al eliminar contacto')
    }
  })

  return {
    // Data
    contacts: contactsQuery.data || [],
    filteredContacts,
    isLoading: contactsQuery.isLoading,
    error: contactsQuery.error,
    
    // Actions
    createContact: createContactMutation.mutate,
    updateContact: updateContactMutation.mutate,
    deleteContact: deleteContactMutation.mutate,
    
    // Status
    isCreating: createContactMutation.isPending,
    isUpdating: updateContactMutation.isPending,
    isDeleting: deleteContactMutation.isPending,
    
    // Filters
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    relationshipFilter,
    setRelationshipFilter,
    
    // Utils
    refetch: contactsQuery.refetch
  }
}

/**
 * Hook para búsqueda de contactos con debounce
 */
export const useContactSearch = (searchParams: ContactSearchParams) => {
  const { user } = useApp()
  
  return useQuery({
    queryKey: ['contacts', 'search', user?.org_id, searchParams],
    queryFn: async () => {
      if (!user?.org_id) return []
      return contactsService.searchContacts(user.org_id, searchParams)
    },
    enabled: !!user?.org_id && searchParams.term.length >= CONTACTS_SEARCH_MIN_LENGTH
  })
}

/**
 * Hook para obtener un contacto por email
 */
export const useContactByEmail = (email: string) => {
  const { user } = useApp()
  
  return useQuery({
    queryKey: ['contacts', 'email', user?.org_id, email],
    queryFn: async () => {
      if (!user?.org_id || !email) return null
      return contactsService.getContactByEmail(email, user.org_id)
    },
    enabled: !!user?.org_id && !!email
  })
}

/**
 * Hook para obtener solo clientes
 */
export const useClients = () => {
  const { user } = useApp()
  
  return useQuery({
    queryKey: ['clients', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      return contactsService.getClients(user.org_id)
    },
    enabled: !!user?.org_id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })
}

// Re-export para compatibilidad
export type { Contact, ContactFormData }