
import { UseFormReturn } from 'react-hook-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BasicInfoTab } from './tabs/BasicInfoTab'
import { AddressTab } from './tabs/AddressTab'
import { PreferencesTab } from './tabs/PreferencesTab'
import { BusinessTab } from './tabs/BusinessTab'
import { TagsManager } from './tabs/TagsManager'
import { FormSection } from '@/components/forms/FormSection'
import { useFormSectionValidation } from '@/hooks/shared/useFormSectionValidation'

export interface ContactFormData {
  name: string
  email: string
  phone: string
  dni_nif: string
  address_street: string
  address_city: string
  address_postal_code: string
  address_country: string
  legal_representative: string
  client_type: 'particular' | 'empresa' | 'autonomo'
  business_sector: string
  how_found_us: string
  contact_preference: 'email' | 'telefono' | 'whatsapp' | 'presencial'
  preferred_language: 'es' | 'ca' | 'en'
  hourly_rate: string
  payment_method: 'transferencia' | 'domiciliacion' | 'efectivo' | 'tarjeta'
  status: 'activo' | 'inactivo' | 'prospecto' | 'bloqueado'
  relationship_type: 'prospecto' | 'cliente' | 'ex_cliente'
  tags: string[]
  internal_notes: string
  company_id?: string
}

interface ContactFormTabsProps {
  form: UseFormReturn<ContactFormData>
  isCompanyDataLoaded?: boolean
  currentContactId?: string
}

export const ContactFormTabs = ({ form, isCompanyDataLoaded = false, currentContactId }: ContactFormTabsProps) => {
  const formErrors = form.formState.errors
  
  // Calculate validation state for each section
  const basicInfoErrors = ['name', 'email', 'phone', 'dni_nif', 'client_type', 'relationship_type', 'status']
    .filter(field => formErrors[field as keyof ContactFormData]).length
  
  const addressErrors = ['address_street', 'address_city', 'address_postal_code', 'address_country']
    .filter(field => formErrors[field as keyof ContactFormData]).length
  
  const preferencesErrors = ['contact_preference', 'preferred_language', 'tags']
    .filter(field => formErrors[field as keyof ContactFormData]).length
  
  const businessErrors = ['business_sector', 'how_found_us', 'hourly_rate', 'payment_method']
    .filter(field => formErrors[field as keyof ContactFormData]).length

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic" className="relative">
          Información Básica
          {basicInfoErrors > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {basicInfoErrors}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="address" className="relative">
          Dirección
          {addressErrors > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {addressErrors}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="preferences" className="relative">
          Preferencias
          {preferencesErrors > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {preferencesErrors}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="business" className="relative">
          Comercial
          {businessErrors > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {businessErrors}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <FormSection
          title="Información Básica"
          description="Datos principales del contacto"
          isValid={basicInfoErrors === 0}
          hasChanges={form.formState.isDirty}
          errorCount={basicInfoErrors}
        >
          <BasicInfoTab 
            form={form} 
            isCompanyDataLoaded={isCompanyDataLoaded}
            currentContactId={currentContactId}
          />
        </FormSection>
      </TabsContent>

      <TabsContent value="address" className="space-y-4">
        <FormSection
          title="Dirección"
          description="Datos de localización"
          isValid={addressErrors === 0}
          hasChanges={form.formState.isDirty}
          errorCount={addressErrors}
        >
          <AddressTab form={form} />
        </FormSection>
      </TabsContent>

      <TabsContent value="preferences" className="space-y-4">
        <FormSection
          title="Preferencias"
          description="Configuración de comunicación"
          isValid={preferencesErrors === 0}
          hasChanges={form.formState.isDirty}
          errorCount={preferencesErrors}
        >
          <PreferencesTab form={form} />
          <TagsManager form={form} />
        </FormSection>
      </TabsContent>

      <TabsContent value="business" className="space-y-4">
        <FormSection
          title="Información Comercial"
          description="Datos de negocio y facturación"
          isValid={businessErrors === 0}
          hasChanges={form.formState.isDirty}
          errorCount={businessErrors}
        >
          <BusinessTab form={form} />
        </FormSection>
      </TabsContent>
    </Tabs>
  )
}
