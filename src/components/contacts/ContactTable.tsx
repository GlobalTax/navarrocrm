
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Edit } from 'lucide-react'
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Relación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell className="font-medium">{contact.name}</TableCell>
              <TableCell>{contact.email || '-'}</TableCell>
              <TableCell>{contact.phone || '-'}</TableCell>
              <TableCell>
                {contact.client_type && (
                  <Badge variant="outline">
                    {contact.client_type}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {contact.status && (
                  <Badge variant={contact.status === 'activo' ? 'default' : 'secondary'}>
                    {contact.status}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {contact.relationship_type && (
                  <Badge variant="outline">
                    {contact.relationship_type}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewContact(contact)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditContact(contact)}
                  >
                    <Edit className="h-4 w-4" />
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
