
import { useState, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Building2, X } from 'lucide-react'
import { PersonFormData } from '@/hooks/persons/personFormTypes'
import { useCompanies } from '@/hooks/useCompanies'

interface CompanySelectorProps {
  form: UseFormReturn<PersonFormData>
}

export const CompanySelector = ({ form }: CompanySelectorProps) => {
  const { companies, isLoading } = useCompanies()
  const [selectedCompany, setSelectedCompany] = useState<string>('')

  const currentCompanyId = form.watch('company_id')

  useEffect(() => {
    if (currentCompanyId) {
      setSelectedCompany(currentCompanyId)
    }
  }, [currentCompanyId])

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId)
    form.setValue('company_id', companyId)
  }

  const handleClearCompany = () => {
    setSelectedCompany('')
    form.setValue('company_id', '')
  }

  const selectedCompanyData = companies.find(c => c.id === selectedCompany)

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="company_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Empresa Vinculada</FormLabel>
            <div className="flex gap-2">
              <Select 
                onValueChange={handleCompanyChange} 
                value={selectedCompany}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empresa (opcional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {company.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCompany && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearCompany}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedCompanyData && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">{selectedCompanyData.name}</h4>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            {selectedCompanyData.business_sector && (
              <p><strong>Sector:</strong> {selectedCompanyData.business_sector}</p>
            )}
            {selectedCompanyData.email && (
              <p><strong>Email:</strong> {selectedCompanyData.email}</p>
            )}
            {selectedCompanyData.phone && (
              <p><strong>Teléfono:</strong> {selectedCompanyData.phone}</p>
            )}
            <p><strong>Contactos vinculados:</strong> {selectedCompanyData.total_contacts || 0}</p>
          </div>
        </div>
      )}
    </div>
  )
}
