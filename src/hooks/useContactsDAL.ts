
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactsDAL, Contact } from '@/lib/dal'
import { toast } from 'sonner'

export const useContactsDAL = (orgId: string) => {
  const queryClient = useQueryClient()

  // Query para obtener todos los contactos
  const contactsQuery = useQuery({
    queryKey: ['contacts', orgId],
    queryFn: async () => {
      const result = await contactsDAL.findByOrganization(orgId)
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al cargar contactos')
      }
      return result
    },
    enabled: !!orgId
  })

  // Mutation para crear contacto
  const createContactMutation = useMutation({
    mutationFn: async (data: Partial<Contact>) => {
      const result = await contactsDAL.create(data)
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al crear contacto')
      }
      return result
    },
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<Contact> }) => {
      const result = await contactsDAL.update(id, data)
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al actualizar contacto')
      }
      return result
    },
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
    mutationFn: async (id: string) => {
      const result = await contactsDAL.delete(id)
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al eliminar contacto')
      }
      return result
    },
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
    queryFn: async () => {
      const result = await contactsDAL.searchContacts(orgId, searchTerm)
      if (!result.success) {
        throw new Error(result.error?.message || 'Error en la búsqueda')
      }
      return result
    },
    enabled: !!orgId && searchTerm.length > 2
  })
}

// Hook para detectar duplicados
export const useContactDuplicates = (orgId: string) => {
  return useQuery({
    queryKey: ['contacts', 'duplicates', orgId],
    queryFn: async () => {
      const result = await contactsDAL.findDuplicates(orgId)
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al buscar duplicados')
      }
      return result
    },
    enabled: !!orgId
  })
}
