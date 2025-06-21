
import { Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { NifLookup } from './NifLookup'
import type { CompanyData } from '@/hooks/useCompanyLookup'

interface CompanyLookupSectionProps {
  onCompanyFound: (company: CompanyData) => void
  initialNif?: string
  disabled?: boolean
}

export const CompanyLookupSection = ({ 
  onCompanyFound, 
  initialNif, 
  disabled 
}: CompanyLookupSectionProps) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Búsqueda Empresarial</h3>
        <Badge variant="secondary" className="text-xs">
          Registro Mercantil
        </Badge>
      </div>
      <p className="text-sm text-blue-700 mb-4">
        Introduce el NIF/CIF para auto-completar los datos oficiales de la empresa
      </p>
      <NifLookup
        onCompanyFound={onCompanyFound}
        initialNif={initialNif}
        disabled={disabled}
      />
    </div>
  )
}
