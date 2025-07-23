
import { BaseFormData, createBaseDefaultValues } from '@/types/shared/baseFormTypes'
import { Contact } from '@/types/shared/clientTypes'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'

// Re-export Contact type for consistency
export type { Contact }

export interface ContactFormDataExtended extends BaseFormData {
  relationship_type: 'prospecto' | 'cliente' | 'ex_cliente'
}

export const defaultContactFormValues: ContactFormData = {
  ...createBaseDefaultValues(),
  relationship_type: 'prospecto',
  company_id: '',
}
