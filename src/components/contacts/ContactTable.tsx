
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Eye, Edit, Mail, Phone, Building, User } from 'lucide-react'
import { Contact } from '@/hooks/useContacts'
import { useNavigate } from 'react-router-dom'

interface ContactTableProps {
  contacts: Contact[]
  onViewContact: (contact: Contact) => void
  onEditContact: (contact: Contact) => void
}

export function ContactTable({ contacts, onViewContact, onEditContact }: ContactTableProps) {
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

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-100 hover:bg-transparent">
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Contacto</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Información</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Estado</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Tipo</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Relación</TableHead>
            <TableHead className="text-right font-semibold text-gray-900 py-4 px-6">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow 
              key={contact.id} 
              className="border-gray-50 hover:bg-gray-25 transition-colors duration-150 group"
            >
              <TableCell className="py-4 px-6">
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
              </TableCell>
              
              <TableCell className="py-4 px-6">
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
              </TableCell>
              
              <TableCell className="py-4 px-6">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                  {getStatusText(contact.status)}
                </span>
              </TableCell>
              
              <TableCell className="py-4 px-6">
                <div className="flex items-center gap-2">
                  <div className="text-gray-400">
                    {getClientTypeIcon(contact.client_type)}
                  </div>
                  <span className="text-sm text-gray-700">
                    {getClientTypeText(contact.client_type)}
                  </span>
                </div>
              </TableCell>
              
              <TableCell className="py-4 px-6">
                <span className="text-sm text-gray-700 capitalize">
                  {contact.relationship_type || 'No definida'}
                </span>
              </TableCell>
              
              <TableCell className="text-right py-4 px-6">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                    onClick={() => handleViewContact(contact)}
                  >
                    <Eye className="h-3.5 w-3.5 text-gray-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                    onClick={() => onEditContact(contact)}
                  >
                    <Edit className="h-3.5 w-3.5 text-gray-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
