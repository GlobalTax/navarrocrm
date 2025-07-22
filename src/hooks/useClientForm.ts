
import { useClientFormState } from './clients/useClientFormState'
import { useClientFormSubmit } from './clients/useClientFormSubmit'
import type { Client } from './clients/clientFormTypes'

export const useClientForm = (client: Client | null, onClose: () => void) => {
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
