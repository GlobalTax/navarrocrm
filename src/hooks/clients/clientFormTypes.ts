
import { BaseFormData, createBaseDefaultValues } from '@/types/shared/baseFormTypes'
import { Client } from '@/types/shared/clientTypes'
import type { ClientFormData } from '@/components/clients/ClientFormTabs'

// Re-export Client type for consistency
export type { Client }

export const defaultClientFormValues: ClientFormData = createBaseDefaultValues()
