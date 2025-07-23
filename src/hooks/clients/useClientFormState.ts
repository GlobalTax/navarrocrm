
import { useSharedFormState } from '../shared/useSharedFormState'
import { clientSchema } from './clientFormSchema'
import { defaultClientFormValues } from './clientFormTypes'
import { mapBaseEntityToFormData } from '@/types/shared/baseFormTypes'
import type { ClientFormData } from '@/components/clients/ClientFormTabs'
import type { Contact } from '@/types/shared/clientTypes'

const mapClientToFormData = (client: Contact): ClientFormData => {
  const formData = mapBaseEntityToFormData(client) as ClientFormData
  return formData
}

export const useClientFormState = (client: Contact | null) => {
  return useSharedFormState({
    schema: clientSchema,
    defaultValues: defaultClientFormValues,
    entity: client,
    mapEntityToFormData: mapClientToFormData
  })
}
