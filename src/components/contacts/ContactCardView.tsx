
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, Phone, Edit, Eye, Building, User, MapPin } from 'lucide-react'
import { Contact } from '@/hooks/useContacts'

interface ContactCardViewProps {
  contacts: Contact[]
  onViewContact: (contact: Contact) => void
  onEditContact: (contact: Contact) => void
}

export const ContactCardView = ({ contacts, onViewContact, onEditContact }: ContactCardViewProps) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {contacts.map((contact) => (
        <Card 
          key={contact.id} 
          className="group cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          onClick={() => onViewContact(contact)}
        >
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="h-10 w-10 bg-gray-50 border border-gray-100">
                  <AvatarFallback className="bg-gray-50 text-gray-700 text-sm font-medium">
                    {getInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                    {contact.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="text-gray-500">
                      {getClientTypeIcon(contact.client_type)}
                    </div>
                    <span className="text-xs text-gray-500">
                      {getClientTypeText(contact.client_type)}
                    </span>
                  </div>
                </div>
              </div>
              <div className={`text-xs font-medium ${getStatusColor(contact.status)}`}>
                {getStatusText(contact.status)}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-3">
            {/* Información de contacto */}
            <div className="space-y-2.5">
              {contact.email && (
                <div className="flex items-center gap-3 text-sm group/item">
                  <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 truncate group-hover/item:text-gray-900 transition-colors">
                    {contact.email}
                  </span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3 text-sm group/item">
                  <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 group-hover/item:text-gray-900 transition-colors">
                    {contact.phone}
                  </span>
                </div>
              )}
              {(contact.address_city || contact.address_country) && (
                <div className="flex items-center gap-3 text-sm group/item">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 truncate group-hover/item:text-gray-900 transition-colors">
                    {[contact.address_city, contact.address_country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Información adicional */}
            {contact.business_sector && (
              <div className="pt-2 border-t border-gray-50">
                <div className="text-xs text-gray-600 bg-gray-25 px-2.5 py-1.5 rounded-lg inline-block">
                  {contact.business_sector}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end gap-1 pt-3 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewContact(contact)
                }}
              >
                <Eye className="h-3.5 w-3.5 text-gray-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onEditContact(contact)
                }}
              >
                <Edit className="h-3.5 w-3.5 text-gray-600" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
