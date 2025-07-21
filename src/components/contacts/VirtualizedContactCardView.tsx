
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { VariableSizeGrid as Grid } from 'react-window'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, Phone, Edit, Eye, Building, User, MapPin } from 'lucide-react'
import { Contact } from '@/hooks/useContacts'
import { useImageLazyLoading } from '@/hooks/performance/useImageLazyLoading'
import { useGridVirtualization } from '@/hooks/performance/useGridVirtualization'
import { useVirtualizationCleanup } from '@/hooks/performance/useVirtualizationCleanup'
import { useLogger } from '@/hooks/useLogger'

interface VirtualizedContactCardViewProps {
  contacts: Contact[]
  onViewContact: (contact: Contact) => void
  onEditContact: (contact: Contact) => void
  height?: number
  minCardWidth?: number
  maxCardWidth?: number
}

interface ContactCardProps {
  contact: Contact
  onViewContact: (contact: Contact) => void
  onEditContact: (contact: Contact) => void
  width: number
  height: number
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onViewContact,
  onEditContact,
  width,
  height
}) => {
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'activo': return 'text-green-700'
      case 'inactivo': return 'text-gray-500'  
      case 'prospecto': return 'text-blue-700'
      case 'bloqueado': return 'text-red-700'
      default: return 'text-gray-400'
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
      case 'empresa':
        return <Building className="h-3.5 w-3.5" />
      case 'particular':
      case 'autonomo':
        return <User className="h-3.5 w-3.5" />
      default:
        return <User className="h-3.5 w-3.5" />
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

  const getClientTypeText = (type: string | null) => {
    switch (type) {
      case 'empresa': return 'Empresa'
      case 'particular': return 'Particular'
      case 'autonomo': return 'Autónomo'
      default: return 'No especificado'
    }
  }

  return (
    <Card 
      style={{ width: width - 8, height: height - 8 }}
      className="group cursor-pointer transition-all duration-200 hover:-translate-y-0.5 m-1 border-0.5 border-black rounded-[10px]"
      onClick={() => onViewContact(contact)}
    >
      <CardHeader className="pb-3 p-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar className="h-8 w-8 bg-gray-50 border border-gray-100 flex-shrink-0">
              <AvatarFallback className="bg-gray-50 text-gray-700 text-xs font-medium">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-xs leading-tight truncate">
                {contact.name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="text-gray-500">
                  {getClientTypeIcon(contact.client_type)}
                </div>
                <span className="text-xs text-gray-500 truncate">
                  {getClientTypeText(contact.client_type)}
                </span>
              </div>
            </div>
          </div>
          <div className={`text-xs font-medium ${getStatusColor(contact.status)} flex-shrink-0`}>
            {getStatusText(contact.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 p-3 space-y-2">
        {/* Información de contacto condensada */}
        <div className="space-y-1.5">
          {contact.email && (
            <div className="flex items-center gap-2 text-xs group/item">
              <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 truncate group-hover/item:text-gray-900 transition-colors">
                {contact.email}
              </span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2 text-xs group/item">
              <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 group-hover/item:text-gray-900 transition-colors">
                {contact.phone}
              </span>
            </div>
          )}
          {(contact.address_city || contact.address_country) && (
            <div className="flex items-center gap-2 text-xs group/item">
              <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 truncate group-hover/item:text-gray-900 transition-colors">
                {[contact.address_city, contact.address_country].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Información adicional */}
        {contact.business_sector && (
          <div className="pt-1.5 border-t border-gray-50">
            <div className="text-xs text-gray-600 bg-gray-25 px-2 py-1 rounded-md inline-block truncate max-w-full">
              {contact.business_sector}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-1 pt-2 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-50 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onViewContact(contact)
            }}
          >
            <Eye className="h-3 w-3 text-gray-600" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-50 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onEditContact(contact)
            }}
          >
            <Edit className="h-3 w-3 text-gray-600" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface GridCellProps {
  columnIndex: number
  rowIndex: number
  style: React.CSSProperties
  data: {
    contacts: Contact[]
    columnCount: number
    itemWidth: number
    itemHeight: number
    onViewContact: (contact: Contact) => void
    onEditContact: (contact: Contact) => void
  }
}

const GridCell: React.FC<GridCellProps> = ({
  columnIndex,
  rowIndex,
  style,
  data
}) => {
  const { contacts, columnCount, itemWidth, itemHeight, onViewContact, onEditContact } = data
  const index = rowIndex * columnCount + columnIndex
  const contact = contacts[index]

  if (!contact) {
    return <div style={style} />
  }

  return (
    <div style={style}>
      <ContactCard
        contact={contact}
        onViewContact={onViewContact}
        onEditContact={onEditContact}
        width={itemWidth}
        height={itemHeight}
      />
    </div>
  )
}

export const VirtualizedContactCardView: React.FC<VirtualizedContactCardViewProps> = ({
  contacts,
  onViewContact,
  onEditContact,
  height = 600,
  minCardWidth = 280,
  maxCardWidth = 320
}) => {
  const logger = useLogger('VirtualizedContactCardView')
  const gridRef = useRef<Grid>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(800)

  const { forceCleanup } = useVirtualizationCleanup({
    itemCount: contacts.length,
    componentName: 'VirtualizedContactCardView',
    cleanupThreshold: 100
  })

  // Calcular dimensiones del grid
  const { columnCount, rowCount, itemWidth, getItemPosition } = useGridVirtualization(
    contacts.length,
    {
      containerWidth,
      minItemWidth: minCardWidth,
      maxItemWidth: maxCardWidth,
      gap: 16,
      itemHeight: 240,
      overscan: 2
    }
  )

  // Observar cambios de tamaño del contenedor
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        setContainerWidth(width)
        
        // Resetear el grid cuando cambie el tamaño
        if (gridRef.current) {
          gridRef.current.resetAfterIndices({ columnIndex: 0, rowIndex: 0 })
        }
      }
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Datos memoizados para el grid
  const gridData = useMemo(() => ({
    contacts,
    columnCount,
    itemWidth,
    itemHeight: 240,
    onViewContact,
    onEditContact
  }), [contacts, columnCount, itemWidth, onViewContact, onEditContact])

  // Funciones de dimensionamiento para el grid
  const getColumnWidth = useCallback(() => itemWidth, [itemWidth])
  const getRowHeight = useCallback(() => 248, []) // itemHeight + gap

  logger.debug('📊 Grid virtualizado configurado', {
    itemCount: contacts.length,
    columnCount,
    rowCount,
    itemWidth: itemWidth.toFixed(0),
    containerWidth
  })

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay contactos para mostrar
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full">
      <div className="border rounded-[10px] border-0.5 border-black">
        <Grid
          ref={gridRef}
          height={height}
          width={containerWidth}
          columnCount={columnCount}
          rowCount={rowCount}
          columnWidth={getColumnWidth}
          rowHeight={getRowHeight}
          itemData={gridData}
          overscanRowCount={2}
          overscanColumnCount={1}
        >
          {GridCell}
        </Grid>
      </div>
      
      {contacts.length > 50 && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>
            Mostrando {contacts.length.toLocaleString()} contactos en grid virtualizado
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={forceCleanup}
            className="text-xs"
          >
            🧹 Optimizar memoria
          </Button>
        </div>
      )}
    </div>
  )
}
