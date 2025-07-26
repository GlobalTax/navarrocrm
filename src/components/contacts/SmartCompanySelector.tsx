import { useMemo, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Plus, X, Loader2, AlertCircle } from 'lucide-react'
import { useContacts } from '@/hooks/useContacts'
import { contactsLogger } from '@/utils/logging'
import type { ContactFormData } from './ContactFormTabs'

interface SmartCompanySelectorProps {
  form: UseFormReturn<ContactFormData>
}

export const SmartCompanySelector = ({ form }: SmartCompanySelectorProps) => {
  const clientType = form.watch('client_type')
  const selectedCompanyId = form.watch('company_id')
  
  const { contacts = [], isLoading, error } = useContacts()
  
  // Component state logging
  useEffect(() => {
    contactsLogger.debug('SmartCompanySelector render state', {
      clientType,
      selectedCompanyId,
      contactsCount: contacts.length,
      isLoading,
      error: error?.message,
      shouldShow: clientType !== 'empresa'
    })
  }, [clientType, selectedCompanyId, contacts.length, isLoading, error])
  
  // Filtrar solo empresas
  const companies = useMemo(() => {
    const filtered = contacts.filter(contact => contact.client_type === 'empresa')
    
    contactsLogger.debug('Companies filtered', {
      totalContacts: contacts.length,
      companiesFound: filtered.length
    })
    return filtered
  }, [contacts])
  
  const selectedCompany = useMemo(() => {
    if (!selectedCompanyId) return null
    
    const found = companies.find(company => company.id === selectedCompanyId)
    if (!found) {
      contactsLogger.warn('Selected company not found', { selectedCompanyId })
    }
    return found
  }, [companies, selectedCompanyId])
  
  // Determinar si debe mostrarse
  const shouldShow = useMemo(() => clientType !== 'empresa', [clientType])
  
  // Early return
  if (!shouldShow) return null
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        <FormField
          control={form.control}
          name="company_id"
          render={() => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Empresa Asociada
                <Badge variant="outline" className="text-xs">
                  Opcional
                </Badge>
              </FormLabel>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Cargando empresas...</span>
              </div>
            </FormItem>
          )}
        />
      </div>
    )
  }
  
  // Error state
  if (error) {
    contactsLogger.error('Error loading companies', { error: error.message })
    return (
      <div className="space-y-3">
        <FormField
          control={form.control}
          name="company_id"
          render={() => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Empresa Asociada
                <Badge variant="outline" className="text-xs">
                  Opcional
                </Badge>
              </FormLabel>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-destructive/10 border-destructive">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">Error al cargar empresas</span>
              </div>
            </FormItem>
          )}
        />
      </div>
    )
  }
  
  const clearSelection = () => {
    contactsLogger.debug('Clearing company selection')
    form.setValue('company_id', '', { shouldValidate: true, shouldDirty: true })
  }
  
  const handleCompanySelect = (value: string) => {
    contactsLogger.debug('Company selected', { value })
    const finalValue = value === 'none' ? '' : value
    form.setValue('company_id', finalValue, { shouldValidate: true, shouldDirty: true })
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
            <Select onValueChange={handleCompanySelect} value={field.value || 'none'}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={
                    companies.length === 0 
                      ? "No hay empresas disponibles" 
                      : "Buscar empresa..."
                  } />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Sin empresa asociada</SelectItem>
                {companies.length === 0 ? (
                  <SelectItem value="no-companies" disabled>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span>No hay empresas registradas</span>
                    </div>
                  </SelectItem>
                ) : (
                  companies.map((company) => (
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
                  ))
                )}
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
        {companies.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">
            💡 Primero registra empresas para poder asociarlas aquí
          </p>
        )}
      </div>
    </div>
  )
}