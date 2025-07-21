
import React, { useCallback } from 'react'
import { VirtualList } from '@/components/optimization/VirtualList'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Edit, Mail, Phone, Building, User } from 'lucide-react'
import { Contact } from '@/hooks/useContacts'
import { useNavigate } from 'react-router-dom'

interface VirtualizedContactTableLegacyProps {
  contacts: Contact[]
  onEditContact: (contact: Contact) => void
  hasNextPage?: boolean
  isLoading?: boolean
  onLoadMore?: () => void
}

export function VirtualizedContactTableLegacy({ 
  contacts, 
  onEditContact, 
  hasNextPage, 
  isLoading, 
  onLoadMore 
}: VirtualizedContactTableLegacyProps) {
  const navigate = useNavigate()

  const getStatusColor = useCallback((status: string | null) => {
    switch (status) {
      case 'activo': return 'text-green-700 bg-green-50'
      case 'inactivo': return 'text-gray-600 bg-gray-50'
      case 'prospecto': return 'text-blue-700 bg-blue-50'
      case 'bloqueado': return 'text-red-700 bg-red-50'
      default: return 'text-gray-500 bg-gray-50'
    }
  }, [])

  const getStatusText = useCallback((status: string | null) => {
    switch (status) {
      case 'activo': return 'Activo'
      case 'inactivo': return 'Inactivo'
      case 'prospecto': return 'Prospecto'
      case 'bloqueado': return 'Bloqueado'
      default: return 'Sin estado'
    }
  }, [])

  const getClientTypeIcon = useCallback((type: string | null) => {
    switch (type) {
      case 'empresa':
        return <Building className="h-3.5 w-3.5" />
      case 'particular':
      case 'autonomo':
        return <User className="h-3.5 w-3.5" />
      default:
        return <User className="h-3.5 w-3.5" />
    }
  }, [])

  const getClientTypeText = useCallback((type: string | null) => {
    switch (type) {
      case 'empresa': return 'Empresa'
      case 'particular': return 'Particular'
      case 'autonomo': return 'Autónomo'
      default: return 'No especificado'
    }
  }, [])

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [])

  const handleViewContact = useCallback((contact: Contact) => {
    navigate(`/contacts/${contact.id}`)
  }, [navigate])

  const renderContactItem = useCallback((contact: Contact, index: number) => (
    <div 
      key={contact.id}
      className="flex items-center gap-6 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 cursor-pointer group"
      onClick={() => handleViewContact(contact)}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-9 w-9 bg-gray-50 border border-gray-100">
          <AvatarFallback className="bg-gray-50 text-gray-700 text-sm font-medium">
            {getInitials(contact.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 text-sm truncate">{contact.name}</div>
          {contact.business_sector && (
            <div className="text-xs text-gray-500 mt-0.5 truncate">{contact.business_sector}</div>
          )}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="space-y-1.5">
          {contact.email && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Mail className="h-3.5 w-3.5 text-gray-400" />
              <span className="truncate">{contact.email}</span>
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
      </div>
      
      <div className="w-24">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
          {getStatusText(contact.status)}
        </span>
      </div>
      
      <div className="w-32">
        <div className="flex items-center gap-2">
          <div className="text-gray-400">
            {getClientTypeIcon(contact.client_type)}
          </div>
          <span className="text-sm text-gray-700 truncate">
            {getClientTypeText(contact.client_type)}
          </span>
        </div>
      </div>
      
      <div className="w-32">
        <span className="text-sm text-gray-700 capitalize">
          {contact.relationship_type || 'No definida'}
        </span>
      </div>
      
      <div className="w-16">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
  ), [handleViewContact, onEditContact, getInitials, getStatusColor, getStatusText, getClientTypeIcon, getClientTypeText])

  const getItemKey = useCallback((contact: Contact, index: number) => contact.id, [])

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-6 p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex-1 font-semibold text-gray-900">Contacto</div>
        <div className="flex-1 font-semibold text-gray-900">Información</div>
        <div className="w-24 font-semibold text-gray-900">Estado</div>
        <div className="w-32 font-semibold text-gray-900">Tipo</div>
        <div className="w-32 font-semibold text-gray-900">Relación</div>
        <div className="w-16 font-semibold text-gray-900">Acciones</div>
      </div>

      {/* Virtualized Content */}
      <VirtualList
        items={contacts}
        renderItem={renderContactItem}
        itemHeight={80}
        height={600}
        getItemKey={getItemKey}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        onLoadMore={onLoadMore}
        className="w-full"
      />
    </div>
  )
}
