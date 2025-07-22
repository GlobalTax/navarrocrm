
import { useContactFormState } from './contacts/useContactFormState'
import { useContactFormSubmit } from './contacts/useContactFormSubmit'
import type { Contact } from './contacts/contactFormTypes'

export const useContactForm = (contact: Contact | null, onClose: () => void) => {
  const { form, isEditing, isCompanyDataLoaded, handleCompanyFound } = useContactFormState(contact)
  const { onSubmit } = useContactFormSubmit(contact, onClose)

  return {
    form,
    isEditing,
    isCompanyDataLoaded,
    handleCompanyFound,
    onSubmit
  }
}
