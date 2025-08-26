/**
 * Contacts actions - standardized mutations
 */

import { toast } from 'sonner'
import { createMutation } from '@/lib/queries/base'
import { contactsDAL, type Contact } from '@/lib/dal'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth'

type ContactRelationshipType = 'prospecto' | 'cliente' | 'ex_cliente'
type ContactStatus = 'active' | 'inactive' | 'pending'

interface CreateContactData {
  name: string
  email?: string
  phone?: string
  relationship_type?: ContactRelationshipType
  status?: ContactStatus
}

interface UpdateContactData extends Partial<CreateContactData> {
  id: string
}

export const useContactsActions = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  const createContactMutation = createMutation<Contact, CreateContactData>(
    async (data) => {
      const response = await contactsDAL.create({
        ...data,
        org_id: user?.org_id,
      } as any)
      
      if (!response.success) {
        throw response.error || new Error('Failed to create contact')
      }
      
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] })
        toast.success('Contacto creado exitosamente')
      },
      onError: (error) => {
        toast.error('Error al crear contacto: ' + error.message)
      }
    }
  )
  
  const updateContactMutation = createMutation<Contact, UpdateContactData>(
    async ({ id, ...data }) => {
      const response = await contactsDAL.update(id, data as any)
      
      if (!response.success) {
        throw response.error || new Error('Failed to update contact')
      }
      
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] })
        toast.success('Contacto actualizado exitosamente')
      },
      onError: (error) => {
        toast.error('Error al actualizar contacto: ' + error.message)
      }
    }
  )
  
  const deleteContactMutation = createMutation<void, string>(
    async (id) => {
      const response = await contactsDAL.delete(id)
      
      if (!response.success) {
        throw response.error || new Error('Failed to delete contact')
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] })
        toast.success('Contacto eliminado exitosamente')
      },
      onError: (error) => {
        toast.error('Error al eliminar contacto: ' + error.message)
      }
    }
  )
  
  return {
    createContact: createContactMutation.mutate,
    createContactAsync: createContactMutation.mutateAsync,
    isCreating: createContactMutation.isLoading,
    
    updateContact: updateContactMutation.mutate,
    updateContactAsync: updateContactMutation.mutateAsync,
    isUpdating: updateContactMutation.isLoading,
    
    deleteContact: deleteContactMutation.mutate,
    deleteContactAsync: deleteContactMutation.mutateAsync,
    isDeleting: deleteContactMutation.isLoading,
  }
}