
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactsDAL, Contact } from '@/lib/dal'
import { toast } from 'sonner'

export const useContactsDAL = (orgId: string) => {
  const queryClient = useQueryClient()

  // Query para obtener todos los contactos
  const contactsQuery = useQuery({
    queryKey: ['contacts', orgId],
    queryFn: () => contactsDAL.findByOrganization(orgId),
    enabled: !!orgId
  })

  // Mutation para crear contacto
  const createContactMutation = useMutation({
    mutationFn: (data: Partial<Contact>) => contactsDAL.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Contacto creado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear contacto')
    }
  })

  // Mutation para actualizar contacto
  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contact> }) => 
      contactsDAL.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Contacto actualizado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar contacto')
    }
  })

  // Mutation para eliminar contacto
  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => contactsDAL.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Contacto eliminado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar contacto')
    }
  })

  return {
    // Data
    contacts: contactsQuery.data?.data || [],
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
    
    // Utils
    refetch: contactsQuery.refetch
  }
}

// Hook específico para búsqueda
export const useContactSearch = (orgId: string, searchTerm: string) => {
  return useQuery({
    queryKey: ['contacts', 'search', orgId, searchTerm],
    queryFn: () => contactsDAL.searchContacts(orgId, searchTerm),
    enabled: !!orgId && searchTerm.length > 2
  })
}

// Hook para detectar duplicados
export const useContactDuplicates = (orgId: string) => {
  return useQuery({
    queryKey: ['contacts', 'duplicates', orgId],
    queryFn: () => contactsDAL.findDuplicates(orgId),
    enabled: !!orgId
  })
}
