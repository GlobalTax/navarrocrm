
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { personSchema, PersonFormData, defaultPersonFormValues } from './personFormTypes'
import type { Person } from '../usePersons'

export const usePersonFormState = (person: Person | null) => {
  const isEditing = !!person

  const form = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: defaultPersonFormValues,
  })

  useEffect(() => {
    if (person) {
      const formData: PersonFormData = {
        name: person.name,
        email: person.email || '',
        phone: person.phone || '',
        dni_nif: person.dni_nif || '',
        address_street: person.address_street || '',
        address_city: person.address_city || '',
        address_postal_code: person.address_postal_code || '',
        address_country: person.address_country || 'España',
        legal_representative: person.legal_representative || '',
        client_type: person.client_type,
        business_sector: person.business_sector || '',
        how_found_us: person.how_found_us || '',
        contact_preference: (person.contact_preference as PersonFormData['contact_preference']) || 'email',
        preferred_language: (person.preferred_language as PersonFormData['preferred_language']) || 'es',
        hourly_rate: person.hourly_rate?.toString() || '',
        payment_method: (person.payment_method as PersonFormData['payment_method']) || 'transferencia',
        status: (person.status as PersonFormData['status']) || 'activo',
        relationship_type: person.relationship_type,
        tags: person.tags || [],
        internal_notes: person.internal_notes || '',
        company_id: person.company_id || ''
      }
      form.reset(formData)
    } else {
      form.reset(defaultPersonFormValues)
    }
  }, [person, form])

  return {
    form,
    isEditing
  }
}
