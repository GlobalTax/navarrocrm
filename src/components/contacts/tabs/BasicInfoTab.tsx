
import { UseFormReturn } from 'react-hook-form'
import { useEffect } from 'react'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'
import { ContactTypeField } from './components/ContactTypeField'
import { BasicContactFields } from './components/BasicContactFields'
import { ContactStatusFields } from './components/ContactStatusFields'
import { CompanySpecificFields } from './components/CompanySpecificFields'
import { SmartCompanySelector } from '../SmartCompanySelector'
import { UniqueField } from '@/components/forms/UniqueField'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface BasicInfoTabProps {
  form: UseFormReturn<ContactFormData>
  isCompanyDataLoaded?: boolean
  currentContactId?: string
}

export const BasicInfoTab = ({ form, isCompanyDataLoaded = false, currentContactId }: BasicInfoTabProps) => {
  const clientType = form.watch('client_type')

  // Debug logging
  useEffect(() => {
    console.log('📋 BasicInfoTab - Debug Info:', {
      clientType,
      isCompanyDataLoaded,
      shouldShowCompanySelector: clientType !== 'empresa',
      shouldShowCompanyFields: clientType === 'empresa'
    })
  }, [clientType, isCompanyDataLoaded])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Name field - not unique, can be duplicated */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre/Razón Social *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Nombre del contacto" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Email field - unique validation */}
      <UniqueField
        form={form}
        name="email"
        label="Email"
        placeholder="email@ejemplo.com"
        type="email"
        tableName="contacts"
        currentId={currentContactId}
        customMessage="Este email ya está registrado en otro contacto"
      />

      {/* Phone field - basic validation */}
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teléfono</FormLabel>
            <FormControl>
              <Input {...field} placeholder="+34 600 000 000" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* DNI/NIF field - unique validation */}
      <UniqueField
        form={form}
        name="dni_nif"
        label="DNI/NIF/CIF"
        placeholder="12345678X"
        tableName="contacts"
        currentId={currentContactId}
        customMessage="Este DNI/NIF/CIF ya está registrado"
      />
      
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
