
import { useSharedFormState } from '../shared/useSharedFormState'
import { clientSchema } from './clientFormSchema'
import { defaultClientFormValues, type Client } from './clientFormTypes'
import { mapBaseEntityToFormData } from '@/types/shared/baseFormTypes'
import type { ClientFormData } from '@/components/clients/ClientFormTabs'

const mapClientToFormData = (client: Client): ClientFormData => 
  mapBaseEntityToFormData(client) as ClientFormData

export const useClientFormState = (client: Client | null) => {
  return useSharedFormState({
    schema: clientSchema,
    defaultValues: defaultClientFormValues,
    entity: client,
    mapEntityToFormData: mapClientToFormData
  })
}
