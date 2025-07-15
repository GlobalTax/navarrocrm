
import { useEffect, useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { CompanyData } from '@/hooks/useCompanyLookup'

interface SharedFormStateConfig<T extends Record<string, any>, D> {
  schema: any
  defaultValues: T
  entity: D | null
  mapEntityToFormData: (entity: D) => T
}

export const useSharedFormState = <T extends Record<string, any>, D>({
  schema,
  defaultValues,
  entity,
  mapEntityToFormData
}: SharedFormStateConfig<T, D>) => {
  const isEditing = !!entity
  const [isCompanyDataLoaded, setIsCompanyDataLoaded] = useState(false)

  const form: UseFormReturn<T> = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  })

  useEffect(() => {
    console.log('🔄 useSharedFormState - Form reset triggered:', {
      hasEntity: !!entity,
      entityId: (entity as any)?.id,
      entityName: (entity as any)?.name,
      entityClientType: (entity as any)?.client_type,
      entityCompanyId: (entity as any)?.company_id
    })

    if (entity) {
      const formData = mapEntityToFormData(entity)
      console.log('🔄 Form data mapped:', formData)
      form.reset(formData as any)
      setIsCompanyDataLoaded((entity as any).client_type === 'empresa')
      
      // Verify form values after reset
      setTimeout(() => {
        const currentValues = form.getValues()
        console.log('✅ Form values after reset:', {
          client_type: currentValues.client_type,
          company_id: currentValues.company_id,
          name: currentValues.name
        })
      }, 100)
    } else {
      console.log('🔄 Resetting to default values:', defaultValues)
      form.reset(defaultValues as any)
      setIsCompanyDataLoaded(false)
    }
  }, [entity, form, defaultValues, mapEntityToFormData])

  const handleCompanyFound = (companyData: CompanyData) => {
    console.log('🏢 Datos de empresa recibidos:', companyData)
    
    const currentValues = form.getValues()
    const updatedValues: T = {
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
    } as T

    // Special handling for contacts to set relationship_type
    if ('relationship_type' in currentValues) {
      (updatedValues as any).relationship_type = companyData.status === 'activo' ? 'cliente' : 'prospecto'
    }

    form.reset(updatedValues as any)
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
