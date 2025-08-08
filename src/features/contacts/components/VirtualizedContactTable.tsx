import React from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Edit, Mail, Phone, Building, User } from 'lucide-react'
import { Contact } from '@/hooks/useContacts'
import { useNavigate } from 'react-router-dom'
import { VirtualList } from '@/components/ui/virtual-list'

interface VirtualizedContactTableProps {
  contacts: Contact[]
  onEditContact: (contact: Contact) => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
}

export function VirtualizedContactTable({ 
  contacts, 
  onEditContact,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage
}: VirtualizedContactTableProps) {
  const navigate = useNavigate()

  const handleViewContact = (contact: Contact) => {
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
      case 'empresa':
        return <Building className="h-3.5 w-3.5" />
      case 'particular':
      case 'autonomo':
        return <User className="h-3.5 w-3.5" />
      default:
        return <User className="h-3.5 w-3.5" />
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

  const renderContactRow = (contact: Contact, index: number) => (
    <div
      key={contact.id}
      className="grid grid-cols-6 gap-6 py-4 px-6 border-b border-gray-50 hover:bg-gray-25 transition-colors duration-150 group cursor-pointer"
      onClick={() => handleViewContact(contact)}
    >
      {/* Contacto */}
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 bg-gray-50 border border-gray-100">
          <AvatarFallback className="bg-gray-50 text-gray-700 text-sm font-medium">
            {getInitials(contact.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold text-gray-900 text-sm">{contact.name}</div>
          {contact.business_sector && (
            <div className="text-xs text-gray-500 mt-0.5">{contact.business_sector}</div>
          )}
        </div>
      </div>
      
      {/* Información */}
      <div className="space-y-1.5">
        {contact.email && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Mail className="h-3.5 w-3.5 text-gray-400" />
            <span>{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone className="h-3.5 w-3.5 text-gray-400" />
            <span>{contact.phone}</span>
          </div>
        )}
        {!contact.email && !contact.phone && (
          <span className="text-gray-400 text-sm">Sin información</span>
        )}
      </div>
      
      {/* Estado */}
      <div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
          {getStatusText(contact.status)}
        </span>
      </div>
      
      {/* Tipo */}
      <div className="flex items-center gap-2">
        <div className="text-gray-400">
          {getClientTypeIcon(contact.client_type)}
        </div>
        <span className="text-sm text-gray-700">
          {getClientTypeText(contact.client_type)}
        </span>
      </div>
      
      {/* Relación */}
      <div>
        <span className="text-sm text-gray-700 capitalize">
          {contact.relationship_type || 'No definida'}
        </span>
      </div>
      
      {/* Acciones */}
      <div className="flex items-center justify-end">
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
  )

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-6 gap-6 py-4 px-6 border-b border-gray-100 bg-gray-50">
        <div className="font-semibold text-gray-900">Contacto</div>
        <div className="font-semibold text-gray-900">Información</div>
        <div className="font-semibold text-gray-900">Estado</div>
        <div className="font-semibold text-gray-900">Tipo</div>
        <div className="font-semibold text-gray-900">Relación</div>
        <div className="font-semibold text-gray-900 text-right">Acciones</div>
      </div>
      
      {/* Virtualized Content */}
      <VirtualList
        items={contacts}
        itemHeight={80}
        containerHeight={600}
        threshold={20}
        renderItem={renderContactRow}
        emptyState={
          <div className="flex justify-center py-12">
            <div className="text-center text-gray-500">
              No se encontraron contactos
            </div>
          </div>
        }
        className="w-full"
      />
      
      {/* Loading indicator for infinite scroll */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">Cargando más contactos...</div>
        </div>
      )}
    </div>
  )
}