
import { BaseFormData, BaseEntity, createBaseDefaultValues } from '@/types/shared/baseFormTypes'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'
import type { Contact as BaseContact } from '@/hooks/useContacts'

export interface Contact extends BaseContact {
  // Ya hereda todas las propiedades de BaseContact, incluyendo relationship_type como string | null
}

export interface ContactFormDataExtended extends BaseFormData {
  relationship_type: 'prospecto' | 'cliente' | 'ex_cliente'
}

export const defaultContactFormValues: ContactFormData = {
  ...createBaseDefaultValues(),
  relationship_type: 'prospecto',
}
