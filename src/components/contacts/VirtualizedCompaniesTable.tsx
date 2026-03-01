
import { forwardRef, CSSProperties } from 'react'
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Edit, Building2, Users, Mail, Phone } from 'lucide-react'
import { Company } from '@/hooks/useCompanies'
import { useNavigate } from 'react-router-dom'

interface VirtualizedCompaniesTableProps {
  companies: Company[]
  onEditCompany: (company: Company) => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
}

interface CompanyRowProps {
  index: number
  style: CSSProperties
  data: {
    companies: Company[]
    onEditCompany: (company: Company) => void
  }
}

const CompanyRow = ({ index, style, data }: CompanyRowProps) => {
  const navigate = useNavigate()
  const { companies, onEditCompany } = data
  const company = companies[index]

  if (!company) {
    return (
      <div style={style} className="flex items-center px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const handleViewCompany = () => {
    navigate(`/contacts/${company.id}`)
  }

  const getStatusBadge = (status: string | null) => {
    if (!status) return null
    
    const statusConfig = {
      'activo': { 
        variant: 'default' as const, 
        label: 'Activo',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200'
      },
      'inactivo': { 
        variant: 'secondary' as const, 
        label: 'Inactivo',
        className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
      },
      'prospecto': { 
        variant: 'outline' as const, 
        label: 'Prospecto',
        className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
      },
      'bloqueado': { 
        variant: 'destructive' as const, 
        label: 'Bloqueado',
        className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return <Badge variant="outline">{status}</Badge>

    return (
      <Badge 
        variant={config.variant} 
        className={`${config.className} transition-colors duration-200`}
      >
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
      className="flex items-center px-6 py-4 border-b border-gray-50 hover:bg-gray-25 transition-all duration-200 group cursor-pointer animate-fade-in"
      onClick={handleViewCompany}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0">
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
}

export const VirtualizedCompaniesTable = forwardRef<any, VirtualizedCompaniesTableProps>(
  ({ companies, onEditCompany, hasNextPage, isFetchingNextPage, fetchNextPage }, ref) => {
    const itemCount = hasNextPage ? companies.length + 1 : companies.length
    const isItemLoaded = (index: number) => !!companies[index]

    return (
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 flex-shrink-0" />
            <div className="flex-1 min-w-0 grid grid-cols-7 gap-4">
              <div className="font-semibold text-gray-900 text-sm">Empresa</div>
              <div className="font-semibold text-gray-900 text-sm">Sector</div>
              <div className="font-semibold text-gray-900 text-sm">Contacto Principal</div>
              <div className="font-semibold text-gray-900 text-sm">Información</div>
              <div className="font-semibold text-gray-900 text-sm">Contactos</div>
              <div className="font-semibold text-gray-900 text-sm">Estado</div>
              <div className="font-semibold text-gray-900 text-sm text-right">Acciones</div>
            </div>
          </div>
        </div>

        {/* Virtualized List */}
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={fetchNextPage || (() => Promise.resolve())}
        >
          {({ onItemsRendered, ref: loaderRef }) => (
            <List
              ref={(list) => {
                loaderRef(list)
                if (ref) {
                  if (typeof ref === 'function') {
                    ref(list)
                  } else {
                    ref.current = list
                  }
                }
              }}
              height={600}
              width="100%"
              itemCount={itemCount}
              itemSize={80}
              itemData={{ companies, onEditCompany }}
              onItemsRendered={onItemsRendered}
            >
              {CompanyRow}
            </List>
          )}
        </InfiniteLoader>

        {/* Loading indicator */}
        {isFetchingNextPage && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-center">
              <div className="text-sm text-gray-600">Cargando más empresas...</div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

VirtualizedCompaniesTable.displayName = 'VirtualizedCompaniesTable'
