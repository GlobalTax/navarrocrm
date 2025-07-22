
import { usePersonFormState } from './persons/usePersonFormState'
import { usePersonFormSubmit } from './persons/usePersonFormSubmit'
import type { Person } from './usePersons'

export const usePersonForm = (person: Person | null, onClose: () => void) => {
  const { form, isEditing } = usePersonFormState(person)
  const { onSubmit } = usePersonFormSubmit(person, onClose)

  return {
    form,
    isEditing,
    onSubmit
  }
}
