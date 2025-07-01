
import { forwardRef, CSSProperties } from 'react'
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Edit, Mail, Phone, Building, User } from 'lucide-react'
import { Contact } from '@/hooks/useContacts'
import { useNavigate } from 'react-router-dom'

interface VirtualizedContactTableProps {
  contacts: Contact[]
  onEditContact: (contact: Contact) => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
}

interface ContactRowProps {
  index: number
  style: CSSProperties
  data: {
    contacts: Contact[]
    onEditContact: (contact: Contact) => void
  }
}

const ContactRow = ({ index, style, data }: ContactRowProps) => {
  const navigate = useNavigate()
  const { contacts, onEditContact } = data
  const contact = contacts[index]

  if (!contact) {
    return (
      <div style={style} className="flex items-center px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="h-9 w-9 bg-gray-200 rounded-full"></div>
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const handleViewContact = () => {
    navigate(`/contacts/${contact.id}`)
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'activo': return 'text-green-700 bg-green-50'
      case 'inactivo': return 'text-gray-600 bg-gray-50'
      case 'prospecto': return 'text-blue-700 bg-blue-50'
      case 'bloqueado': return 'text-red-700 bg-red-50'
      default: return 'text-gray-500 bg-gray-50'
    }
  }

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'activo': return 'Activo'
      case 'inactivo': return 'Inactivo'
      case 'prospecto': return 'Prospecto'
      case 'bloqueado': return 'Bloqueado'
      default: return 'Sin estado'
    }
  }

  const getClientTypeIcon = (type: string | null) => {
    switch (type) {
      case 'empresa': return <Building className="h-3.5 w-3.5" />
      case 'particular':
      case 'autonomo': return <User className="h-3.5 w-3.5" />
      default: return <User className="h-3.5 w-3.5" />
    }
  }

  const getClientTypeText = (type: string | null) => {
    switch (type) {
      case 'empresa': return 'Empresa'
      case 'particular': return 'Particular'
      case 'autonomo': return 'Autónomo'
      default: return 'No especificado'
    }
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
      className="flex items-center px-6 py-4 border-b border-gray-50 hover:bg-gray-25 transition-colors duration-150 group cursor-pointer"
      onClick={handleViewContact}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-9 w-9 bg-gray-50 border border-gray-100 flex-shrink-0">
          <AvatarFallback className="bg-gray-50 text-gray-700 text-sm font-medium">
            {getInitials(contact.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 grid grid-cols-6 gap-4 items-center">
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate">{contact.name}</div>
            {contact.business_sector && (
              <div className="text-xs text-gray-500 truncate mt-0.5">{contact.business_sector}</div>
            )}
          </div>
          
          <div className="min-w-0">
            {contact.email && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{contact.phone}</span>
              </div>
            )}
          </div>
          
          <div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
              {getStatusText(contact.status)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-gray-400 flex-shrink-0">
              {getClientTypeIcon(contact.client_type)}
            </div>
            <span className="text-sm text-gray-700 truncate">
              {getClientTypeText(contact.client_type)}
            </span>
          </div>
          
          <div>
            <span className="text-sm text-gray-700 capitalize truncate">
              {contact.relationship_type || 'No definida'}
            </span>
          </div>
          
          <div className="flex justify-end">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onEditContact(contact)
                }}
              >
                <Edit className="h-3.5 w-3.5 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const VirtualizedContactTable = forwardRef<any, VirtualizedContactTableProps>(
  ({ contacts, onEditContact, hasNextPage, isFetchingNextPage, fetchNextPage }, ref) => {
    const itemCount = hasNextPage ? contacts.length + 1 : contacts.length
    const isItemLoaded = (index: number) => !!contacts[index]

    return (
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div className="grid grid-cols-6 gap-4">
            <div className="font-semibold text-gray-900 text-sm">Contacto</div>
            <div className="font-semibold text-gray-900 text-sm">Información</div>
            <div className="font-semibold text-gray-900 text-sm">Estado</div>
            <div className="font-semibold text-gray-900 text-sm">Tipo</div>
            <div className="font-semibold text-gray-900 text-sm">Relación</div>
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
              itemData={{ contacts, onEditContact }}
              onItemsRendered={onItemsRendered}
            >
              {ContactRow}
            </List>
          )}
        </InfiniteLoader>

        {/* Loading indicator */}
        {isFetchingNextPage && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-center">
              <div className="text-sm text-gray-600">Cargando más contactos...</div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

VirtualizedContactTable.displayName = 'VirtualizedContactTable'
