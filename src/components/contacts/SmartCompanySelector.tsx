import { useMemo, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Plus, X } from 'lucide-react'
import { useContacts } from '@/hooks/useContacts'
import type { ContactFormData } from './ContactFormTabs'

interface SmartCompanySelectorProps {
  form: UseFormReturn<ContactFormData>
}

export const SmartCompanySelector = ({ form }: SmartCompanySelectorProps) => {
  const clientType = form.watch('client_type')
  const selectedCompanyId = form.watch('company_id')
  
  const { contacts = [], isLoading } = useContacts()
  
  // Debug logging
  useEffect(() => {
    console.log('🏢 SmartCompanySelector - Debug Info:', {
      clientType,
      selectedCompanyId,
      contactsCount: contacts.length,
      isLoading,
      shouldShow: clientType !== 'empresa'
    })
  }, [clientType, selectedCompanyId, contacts.length, isLoading])
  
  // Filtrar solo empresas con debugging
  const companies = useMemo(() => {
    const filtered = contacts.filter(contact => contact.client_type === 'empresa')
    console.log('🏢 Companies filtered:', {
      totalContacts: contacts.length,
      companiesFound: filtered.length,
      companies: filtered.map(c => ({ id: c.id, name: c.name, client_type: c.client_type }))
    })
    return filtered
  }, [contacts])
  
  const selectedCompany = useMemo(() => {
    const found = companies.find(company => company.id === selectedCompanyId)
    console.log('🏢 Selected company:', { selectedCompanyId, found: !!found, companyName: found?.name })
    return found
  }, [companies, selectedCompanyId])
  
  // Determinar si debe mostrarse
  const shouldShow = useMemo(() => {
    const show = clientType !== 'empresa'
    console.log('🏢 Should show selector:', { clientType, shouldShow: show })
    return show
  }, [clientType])
  
  // No mostrar para empresas
  if (!shouldShow) {
    console.log('🏢 Selector hidden for client_type:', clientType)
    return null
  }
  
  const clearSelection = () => {
    form.setValue('company_id', '')
  }
  
  return (
    <div className="space-y-3">
      <FormField
        control={form.control}
        name="company_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Empresa Asociada
              <Badge variant="outline" className="text-xs">
                Opcional
              </Badge>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Buscar empresa..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">Sin empresa asociada</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span>{company.name}</span>
                      {company.dni_nif && (
                        <Badge variant="secondary" className="text-xs">
                          {company.dni_nif}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Previsualización de empresa seleccionada */}
      {selectedCompany && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">{selectedCompany.name}</h4>
                <div className="flex items-center gap-3 text-sm text-blue-700 mt-1">
                  {selectedCompany.dni_nif && (
                    <span>CIF: {selectedCompany.dni_nif}</span>
                  )}
                  {selectedCompany.business_sector && (
                    <span>• {selectedCompany.business_sector}</span>
                  )}
                </div>
                {selectedCompany.address_city && (
                  <p className="text-sm text-blue-600 mt-1">
                    📍 {selectedCompany.address_city}
                  </p>
                )}
              </div>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={clearSelection}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Ayuda contextual */}
      <div className="text-sm text-muted-foreground">
        <p className="flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {clientType === 'particular' 
            ? 'Vincula esta persona física a una empresa cliente'
            : 'Vincula este autónomo a una empresa colaboradora'
          }
        </p>
      </div>
    </div>
  )
}