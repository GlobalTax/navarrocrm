
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, MapPin, Tag, Building, User } from 'lucide-react'
import { Contact } from '@/hooks/useContacts'
import { getInitials, getClientTypeIcon } from '../utils/contactUtils'

interface ContactMainInfoProps {
  contact: Contact
}

export const ContactMainInfo = ({ contact }: ContactMainInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold">{contact.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {getClientTypeIcon(contact.client_type)}
              <span className="text-sm text-gray-600 capitalize">
                {contact.client_type || 'No especificado'}
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contact.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{contact.phone}</span>
            </div>
          )}
          {(contact.address_street || contact.address_city) && (
            <div className="flex items-start gap-2 md:col-span-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              <div className="text-sm">
                {contact.address_street && <div>{contact.address_street}</div>}
                {contact.address_city && (
                  <div>
                    {contact.address_city}
                    {contact.address_postal_code && `, ${contact.address_postal_code}`}
                    {contact.address_country && `, ${contact.address_country}`}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {contact.business_sector && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Sector Empresarial</h4>
            <p className="text-sm">{contact.business_sector}</p>
          </div>
        )}

        {contact.tags && contact.tags.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Etiquetas
            </h4>
            <div className="flex flex-wrap gap-1">
              {contact.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
