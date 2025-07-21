
import { memo, CSSProperties } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Edit, Building2, Users, Mail, Phone } from 'lucide-react'
import { Company } from '@/hooks/useCompanies'
import { useNavigate } from 'react-router-dom'

interface CompanyRowOptimizedProps {
  index: number
  style: CSSProperties
  data: {
    companies: Company[]
    onEditCompany: (company: Company) => void
  }
}

const CompanyRowOptimized = memo(({ index, style, data }: CompanyRowOptimizedProps) => {
  const navigate = useNavigate()
  const { companies, onEditCompany } = data
  const company = companies[index]

  if (!company) {
    return (
      <div style={style} className="flex items-center px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="flex-1 grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const handleViewCompany = () => navigate(`/contacts/${company.id}`)

  const getStatusBadge = (status: string | null) => {
    if (!status) return null
    
    const statusConfig = {
      'activo': { 
        variant: 'default' as const, 
        label: 'Activo',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      },
      'inactivo': { 
        variant: 'secondary' as const, 
        label: 'Inactivo',
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      },
      'prospecto': { 
        variant: 'outline' as const, 
        label: 'Prospecto',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      'bloqueado': { 
        variant: 'destructive' as const, 
        label: 'Bloqueado',
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return <Badge variant="outline">{status}</Badge>

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div 
      style={style}
      className="flex items-center px-6 py-4 border-b border-gray-50 hover:bg-gray-25 transition-colors group cursor-pointer"
      onClick={handleViewCompany}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-white shadow-lg flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-semibold">
            {getInitials(company.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 grid grid-cols-7 gap-4 items-center">
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm group-hover:text-emerald-600 transition-colors truncate">
              {company.name}
            </div>
            {company.business_sector && (
              <div className="text-xs text-gray-500 mt-0.5 truncate">{company.business_sector}</div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span className="text-sm text-gray-700 truncate">{company.business_sector || 'Sin especificar'}</span>
          </div>
          
          <div className="min-w-0">
            {company.primary_contact ? (
              <div>
                <div className="font-medium text-sm text-gray-900 truncate">{company.primary_contact.name}</div>
                <div className="space-y-0.5">
                  {company.primary_contact.email && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{company.primary_contact.email}</span>
                    </div>
                  )}
                  {company.primary_contact.phone && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{company.primary_contact.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-gray-400 text-sm">Sin contacto principal</span>
            )}
          </div>
          
          <div className="min-w-0">
            {company.email && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{company.email}</span>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{company.phone}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Users className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">{company.total_contacts || 0}</span>
          </div>
          
          <div>
            {getStatusBadge(company.status)}
          </div>
          
          <div className="flex justify-end">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onEditCompany(company)
                }}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

CompanyRowOptimized.displayName = 'CompanyRowOptimized'

export { CompanyRowOptimized }
