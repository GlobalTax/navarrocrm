
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Edit, Mail, Phone, MapPin } from 'lucide-react'
import { Contact } from '@/hooks/useContacts'

interface ContactCardViewProps {
  contacts: Contact[]
  onViewContact: (contact: Contact) => void
  onEditContact: (contact: Contact) => void
}

export function ContactCardView({ contacts, onViewContact, onEditContact }: ContactCardViewProps) {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay contactos para mostrar</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contacts.map((contact) => (
        <Card key={contact.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{contact.name}</CardTitle>
                {contact.relationship_type && (
                  <Badge variant="secondary" className="mt-1">
                    {contact.relationship_type}
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewContact(contact)}
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
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {contact.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.address_city && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{contact.address_city}</span>
              </div>
            )}
            {contact.status && (
              <div className="pt-2">
                <Badge variant={contact.status === 'activo' ? 'default' : 'secondary'}>
                  {contact.status}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
