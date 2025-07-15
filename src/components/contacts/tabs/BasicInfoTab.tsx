
import { UseFormReturn } from 'react-hook-form'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'
import { ContactTypeField } from './components/ContactTypeField'
import { BasicContactFields } from './components/BasicContactFields'
import { ContactStatusFields } from './components/ContactStatusFields'
import { CompanySpecificFields } from './components/CompanySpecificFields'
import { SmartCompanySelector } from '../SmartCompanySelector'

interface BasicInfoTabProps {
  form: UseFormReturn<ContactFormData>
  isCompanyDataLoaded?: boolean
}

export const BasicInfoTab = ({ form, isCompanyDataLoaded = false }: BasicInfoTabProps) => {
  const clientType = form.watch('client_type')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <BasicContactFields form={form} />
      
      <ContactTypeField form={form} isCompanyDataLoaded={isCompanyDataLoaded} />
      
      <ContactStatusFields form={form} />

      {/* Selector inteligente de empresa - solo para particulares y autónomos */}
      {clientType !== 'empresa' && (
        <div className="md:col-span-2">
          <SmartCompanySelector form={form} />
        </div>
      )}

      {/* Campos específicos de empresa */}
      {clientType === 'empresa' && (
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CompanySpecificFields form={form} />
          </div>
        </div>
      )}
    </div>
  )
}
