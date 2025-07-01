
import { forwardRef, CSSProperties } from 'react'
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Edit, Building2, User, Briefcase, Mail, Phone } from 'lucide-react'
import { Person } from '@/hooks/usePersons'
import { useNavigate } from 'react-router-dom'

interface VirtualizedPersonsTableProps {
  persons: Person[]
  onEditPerson: (person: Person) => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
}

interface PersonRowProps {
  index: number
  style: CSSProperties
  data: {
    persons: Person[]
    onEditPerson: (person: Person) => void
  }
}

const PersonRow = ({ index, style, data }: PersonRowProps) => {
  const navigate = useNavigate()
  const { persons, onEditPerson } = data
  const person = persons[index]

  if (!person) {
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

  const handleViewPerson = () => {
    navigate(`/contacts/${person.id}`)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'particular': return <User className="h-4 w-4" />
      case 'autonomo': return <Briefcase className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'particular': return 'Particular'
      case 'autonomo': return 'Autónomo'
      default: return type
    }
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
      onClick={handleViewPerson}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white shadow-lg flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
            {getInitials(person.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 grid grid-cols-6 gap-4 items-center">
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors truncate">
              {person.name}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-gray-700">
            <div className="text-blue-500 flex-shrink-0">
              {getTypeIcon(person.client_type)}
            </div>
            <span className="text-sm font-medium truncate">{getTypeLabel(person.client_type)}</span>
          </div>
          
          <div className="min-w-0">
            {person.email && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{person.email}</span>
              </div>
            )}
            {person.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{person.phone}</span>
              </div>
            )}
          </div>
          
          <div>
            {person.company ? (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 truncate">{person.company.name}</span>
              </div>
            ) : (
              <span className="text-gray-400 text-sm">-</span>
            )}
          </div>
          
          <div>
            {getStatusBadge(person.status)}
          </div>
          
          <div className="flex justify-end">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onEditPerson(person)
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

export const VirtualizedPersonsTable = forwardRef<any, VirtualizedPersonsTableProps>(
  ({ persons, onEditPerson, hasNextPage, isFetchingNextPage, fetchNextPage }, ref) => {
    const itemCount = hasNextPage ? persons.length + 1 : persons.length
    const isItemLoaded = (index: number) => !!persons[index]

    return (
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div className="grid grid-cols-6 gap-4">
            <div className="font-semibold text-gray-900 text-sm">Persona</div>
            <div className="font-semibold text-gray-900 text-sm">Tipo</div>
            <div className="font-semibold text-gray-900 text-sm">Contacto</div>
            <div className="font-semibold text-gray-900 text-sm">Empresa</div>
            <div className="font-semibold text-gray-900 text-sm">Estado</div>
            <div className="font-semibold text-gray-900 text-sm text-right">Acciones</div>
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
              itemData={{ persons, onEditPerson }}
              onItemsRendered={onItemsRendered}
            >
              {PersonRow}
            </List>
          )}
        </InfiniteLoader>

        {/* Loading indicator */}
        {isFetchingNextPage && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-center">
              <div className="text-sm text-gray-600">Cargando más personas...</div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

VirtualizedPersonsTable.displayName = 'VirtualizedPersonsTable'
