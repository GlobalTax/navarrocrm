
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { contactSchema } from './contactFormSchema'
import { defaultContactFormValues, type Contact } from './contactFormTypes'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'
import type { CompanyData } from '@/hooks/useCompanyLookup'

export const useContactFormState = (contact: Contact | null) => {
  const isEditing = !!contact
  const [isCompanyDataLoaded, setIsCompanyDataLoaded] = useState(false)

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: defaultContactFormValues,
  })

  useEffect(() => {
    if (contact) {
      form.reset({
        name: contact.name,
        email: contact.email || '',
        phone: contact.phone || '',
        dni_nif: contact.dni_nif || '',
        address_street: contact.address_street || '',
        address_city: contact.address_city || '',
        address_postal_code: contact.address_postal_code || '',
        address_country: contact.address_country || 'España',
        legal_representative: contact.legal_representative || '',
        client_type: (contact.client_type as ContactFormData['client_type']) || 'particular',
        business_sector: contact.business_sector || '',
        how_found_us: contact.how_found_us || '',
        contact_preference: (contact.contact_preference as ContactFormData['contact_preference']) || 'email',
        preferred_language: (contact.preferred_language as ContactFormData['preferred_language']) || 'es',
        hourly_rate: contact.hourly_rate?.toString() || '',
        payment_method: (contact.payment_method as ContactFormData['payment_method']) || 'transferencia',
        status: (contact.status as ContactFormData['status']) || 'prospecto',
        relationship_type: (contact.relationship_type as ContactFormData['relationship_type']) || 'prospecto',
        tags: contact.tags || [],
        internal_notes: contact.internal_notes || '',
      })
      setIsCompanyDataLoaded(contact.client_type === 'empresa')
    } else {
      form.reset(defaultContactFormValues)
      setIsCompanyDataLoaded(false)
    }
  }, [contact, form])

  const handleCompanyFound = (companyData: CompanyData) => {
    console.log('🏢 ContactForm - Datos de empresa recibidos:', companyData)
    
    // Usar batch update con reset para mejor rendimiento
    const currentValues = form.getValues()
    const updatedValues: ContactFormData = {
      ...currentValues,
      name: companyData.name,
      dni_nif: companyData.nif,
      client_type: 'empresa',
      status: companyData.status,
      relationship_type: companyData.status === 'activo' ? 'cliente' : 'prospecto',
      address_street: companyData.address_street || currentValues.address_street,
      address_city: companyData.address_city || currentValues.address_city,
      address_postal_code: companyData.address_postal_code || currentValues.address_postal_code,
      business_sector: companyData.business_sector || currentValues.business_sector,
      legal_representative: companyData.legal_representative || currentValues.legal_representative,
    }

    form.reset(updatedValues)
    setIsCompanyDataLoaded(true)

    toast.success('Formulario completado con datos oficiales del Registro Mercantil')
  }

  return {
    form,
    isEditing,
    isCompanyDataLoaded,
    handleCompanyFound
  }
}
