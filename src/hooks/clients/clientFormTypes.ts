
import { BaseFormData, BaseEntity, createBaseDefaultValues } from '@/types/shared/baseFormTypes'
import type { ClientFormData } from '@/components/clients/ClientFormTabs'

export interface Client extends BaseEntity {
  relationship_type: 'prospecto' | 'cliente' | 'ex_cliente'
  last_contact_date?: string | null
}

export const defaultClientFormValues: ClientFormData = createBaseDefaultValues()
