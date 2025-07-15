
import { UseFormReturn } from 'react-hook-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BasicInfoTab } from './tabs/BasicInfoTab'
import { AddressTab } from './tabs/AddressTab'
import { PreferencesTab } from './tabs/PreferencesTab'
import { BusinessTab } from './tabs/BusinessTab'
import { TagsManager } from './tabs/TagsManager'

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
}

export const ContactFormTabs = ({ form, isCompanyDataLoaded = false }: ContactFormTabsProps) => {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">Información Básica</TabsTrigger>
        <TabsTrigger value="address">Dirección</TabsTrigger>
        <TabsTrigger value="preferences">Preferencias</TabsTrigger>
        <TabsTrigger value="business">Comercial</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <BasicInfoTab form={form} isCompanyDataLoaded={isCompanyDataLoaded} />
      </TabsContent>

      <TabsContent value="address" className="space-y-4">
        <AddressTab form={form} />
      </TabsContent>

      <TabsContent value="preferences" className="space-y-4">
        <PreferencesTab form={form} />
        <TagsManager form={form} />
      </TabsContent>

      <TabsContent value="business" className="space-y-4">
        <BusinessTab form={form} />
      </TabsContent>
    </Tabs>
  )
}
