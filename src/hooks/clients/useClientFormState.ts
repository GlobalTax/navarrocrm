
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema } from './clientFormSchema'
import { defaultClientFormValues, type Client } from './clientFormTypes'
import type { ClientFormData } from '@/components/clients/ClientFormTabs'
import type { CompanyData } from '@/hooks/useCompanyLookup'
import { toast } from 'sonner'

export const useClientFormState = (client: Client | null) => {
  const isEditing = !!client
  const [isCompanyDataLoaded, setIsCompanyDataLoaded] = useState(false)

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: defaultClientFormValues,
  })

  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        dni_nif: client.dni_nif || '',
        address_street: client.address_street || '',
        address_city: client.address_city || '',
        address_postal_code: client.address_postal_code || '',
        address_country: client.address_country || 'España',
        legal_representative: client.legal_representative || '',
        client_type: (client.client_type as ClientFormData['client_type']) || 'particular',
        business_sector: client.business_sector || '',
        how_found_us: client.how_found_us || '',
        contact_preference: (client.contact_preference as ClientFormData['contact_preference']) || 'email',
        preferred_language: (client.preferred_language as ClientFormData['preferred_language']) || 'es',
        hourly_rate: client.hourly_rate?.toString() || '',
        payment_method: (client.payment_method as ClientFormData['payment_method']) || 'transferencia',
        status: (client.status as ClientFormData['status']) || 'prospecto',
        tags: client.tags || [],
        internal_notes: client.internal_notes || '',
      })
      setIsCompanyDataLoaded(client.client_type === 'empresa')
    } else {
      form.reset(defaultClientFormValues)
      setIsCompanyDataLoaded(false)
    }
  }, [client, form])

  const handleCompanyFound = (companyData: CompanyData) => {
    console.log('🏢 ClientForm - Datos de empresa recibidos:', companyData)
    
    // Usar batch update con reset para mejor rendimiento
    const currentValues = form.getValues()
    const updatedValues: ClientFormData = {
      ...currentValues,
      name: companyData.name,
      dni_nif: companyData.nif,
      client_type: 'empresa',
      status: companyData.status,
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
