
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PersonFormData } from '@/hooks/persons/personFormTypes'
import { CompanySelector } from './CompanySelector'

interface PersonBusinessTabProps {
  form: UseFormReturn<PersonFormData>
}

export const PersonBusinessTab = ({ form }: PersonBusinessTabProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Vinculación Empresarial</h3>
        <p className="text-sm text-blue-700">
          Opcionalmente, puedes vincular esta persona física a una empresa existente.
        </p>
      </div>

      <CompanySelector form={form} />
    </div>
  )
}
