
import { BaseFormData, BaseEntity, createBaseDefaultValues } from '@/types/shared/baseFormTypes'
import type { ClientFormData } from '@/components/clients/ClientFormTabs'

export interface Client extends BaseEntity {}

export const defaultClientFormValues: ClientFormData = createBaseDefaultValues()
