
import { UseFormReturn } from 'react-hook-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BasicInfoTab } from './tabs/BasicInfoTab'
import { LegalInfoTab } from './tabs/LegalInfoTab'
import { BusinessInfoTab } from './tabs/BusinessInfoTab'
import { PreferencesTab } from './tabs/PreferencesTab'
import { TagsManager } from './tabs/TagsManager'

export interface ClientFormData {
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
  tags: string[]
  internal_notes: string
  company_id?: string
}

interface ClientFormTabsProps {
  form: UseFormReturn<ClientFormData>
  isCompanyDataLoaded?: boolean
}

export const ClientFormTabs = ({ form, isCompanyDataLoaded = false }: ClientFormTabsProps) => {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">Datos Básicos</TabsTrigger>
        <TabsTrigger value="legal">Datos Legales</TabsTrigger>
        <TabsTrigger value="business">Negocio</TabsTrigger>
        <TabsTrigger value="preferences">Preferencias</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <BasicInfoTab form={form} isCompanyDataLoaded={isCompanyDataLoaded} />
        <TagsManager form={form} />
      </TabsContent>

      <TabsContent value="legal" className="space-y-4">
        <LegalInfoTab form={form} />
      </TabsContent>

      <TabsContent value="business" className="space-y-4">
        <BusinessInfoTab form={form} />
      </TabsContent>

      <TabsContent value="preferences" className="space-y-4">
        <PreferencesTab form={form} />
      </TabsContent>
    </Tabs>
  )
}
