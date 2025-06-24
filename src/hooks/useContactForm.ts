
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'
import type { CompanyData } from '@/hooks/useCompanyLookup'

const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').or(z.literal('')),
  phone: z.string().optional(),
  dni_nif: z.string().optional(),
  address_street: z.string().optional(),
  address_city: z.string().optional(),
  address_postal_code: z.string().optional(),
  address_country: z.string().optional(),
  legal_representative: z.string().optional(),
  client_type: z.enum(['particular', 'empresa', 'autonomo']),
  business_sector: z.string().optional(),
  how_found_us: z.string().optional(),
  contact_preference: z.enum(['email', 'telefono', 'whatsapp', 'presencial']),
  preferred_language: z.enum(['es', 'ca', 'en']),
  hourly_rate: z.string().optional(),
  payment_method: z.enum(['transferencia', 'domiciliacion', 'efectivo', 'tarjeta']),
  status: z.enum(['activo', 'inactivo', 'prospecto', 'bloqueado']),
  relationship_type: z.enum(['prospecto', 'cliente', 'ex_cliente']),
  tags: z.array(z.string()).optional(),
  internal_notes: z.string().optional(),
})

interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  dni_nif: string | null
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_country: string | null
  legal_representative: string | null
  client_type: string | null
  business_sector: string | null
  how_found_us: string | null
  contact_preference: string | null
  preferred_language: string | null
  hourly_rate: number | null
  payment_method: string | null
  status: string | null
  relationship_type: string | null
  tags: string[] | null
  internal_notes: string | null
}

const defaultValues: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  dni_nif: '',
  address_street: '',
  address_city: '',
  address_postal_code: '',
  address_country: 'España',
  legal_representative: '',
  client_type: 'particular',
  business_sector: '',
  how_found_us: '',
  contact_preference: 'email',
  preferred_language: 'es',
  hourly_rate: '',
  payment_method: 'transferencia',
  status: 'prospecto',
  relationship_type: 'prospecto',
  tags: [],
  internal_notes: '',
}

export const useContactForm = (contact: Contact | null, onClose: () => void) => {
  const { user } = useApp()
  const isEditing = !!contact
  const [isCompanyDataLoaded, setIsCompanyDataLoaded] = useState(false)

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues,
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
      form.reset(defaultValues)
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

  const onSubmit = async (data: ContactFormData) => {
    if (!user?.org_id) {
      toast.error('Error: No se pudo identificar la organización')
      return
    }

    try {
      const contactData = {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        dni_nif: data.dni_nif || null,
        address_street: data.address_street || null,
        address_city: data.address_city || null,
        address_postal_code: data.address_postal_code || null,
        address_country: data.address_country || null,
        legal_representative: data.legal_representative || null,
        client_type: data.client_type,
        business_sector: data.business_sector || null,
        how_found_us: data.how_found_us || null,
        contact_preference: data.contact_preference,
        preferred_language: data.preferred_language,
        hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
        payment_method: data.payment_method,
        status: data.status,
        relationship_type: data.relationship_type,
        tags: data.tags || null,
        internal_notes: data.internal_notes || null,
        org_id: user.org_id,
        last_contact_date: new Date().toISOString(),
      }

      if (isEditing && contact) {
        const { error } = await supabase
          .from('contacts')
          .update(contactData)
          .eq('id', contact.id)

        if (error) throw error
        toast.success('Contacto actualizado exitosamente')
      } else {
        const { error } = await supabase
          .from('contacts')
          .insert(contactData)

        if (error) throw error
        toast.success('Contacto creado exitosamente')
      }

      form.reset()
      onClose()
    } catch (error) {
      console.error('Error saving contact:', error)
      toast.error('Error al guardar el contacto')
    }
  }

  return {
    form,
    isEditing,
    isCompanyDataLoaded,
    handleCompanyFound,
    onSubmit
  }
}
