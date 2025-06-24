
import { BaseFormData, BaseEntity, createBaseDefaultValues } from '@/types/shared/baseFormTypes'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'

export interface Contact extends BaseEntity {
  relationship_type: string | null
}

export interface ContactFormDataExtended extends BaseFormData {
  relationship_type: 'prospecto' | 'cliente' | 'ex_cliente'
}

export const defaultContactFormValues: ContactFormData = {
  ...createBaseDefaultValues(),
  relationship_type: 'prospecto',
}
