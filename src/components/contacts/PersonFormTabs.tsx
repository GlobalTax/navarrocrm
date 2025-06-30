
import { UseFormReturn } from 'react-hook-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PersonBasicInfoTab } from './tabs/PersonBasicInfoTab'
import { PersonAddressTab } from './tabs/PersonAddressTab'
import { PersonPreferencesTab } from './tabs/PersonPreferencesTab'
import { PersonBusinessTab } from './tabs/PersonBusinessTab'
import { PersonFormData } from '@/hooks/persons/personFormTypes'

interface PersonFormTabsProps {
  form: UseFormReturn<PersonFormData>
}

export const PersonFormTabs = ({ form }: PersonFormTabsProps) => {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">Información Básica</TabsTrigger>
        <TabsTrigger value="address">Dirección</TabsTrigger>
        <TabsTrigger value="preferences">Preferencias</TabsTrigger>
        <TabsTrigger value="business">Empresa</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <PersonBasicInfoTab form={form} />
      </TabsContent>

      <TabsContent value="address" className="space-y-4">
        <PersonAddressTab form={form} />
      </TabsContent>

      <TabsContent value="preferences" className="space-y-4">
        <PersonPreferencesTab form={form} />
      </TabsContent>

      <TabsContent value="business" className="space-y-4">
        <PersonBusinessTab form={form} />
      </TabsContent>
    </Tabs>
  )
}
