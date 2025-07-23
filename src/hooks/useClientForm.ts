
import { useClientFormState } from './clients/useClientFormState'
import { useClientFormSubmit } from './clients/useClientFormSubmit'
import type { Contact } from '@/types/shared/clientTypes'

export const useClientForm = (client: Contact | null, onClose: () => void) => {
  const { form, isEditing, isCompanyDataLoaded, handleCompanyFound } = useClientFormState(client)
  const { onSubmit } = useClientFormSubmit(client, onClose)

  return {
    form,
    isEditing,
    isCompanyDataLoaded,
    handleCompanyFound,
    onSubmit
  }
}
