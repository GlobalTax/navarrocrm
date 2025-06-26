
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Contact } from '@/hooks/useContacts'
import { Mail, Phone, MapPin, Building, User, Calendar, Tag } from 'lucide-react'

interface ContactDetailDialogProps {
  contact: Contact | null
  open: boolean
  onClose: () => void
}

export const ContactDetailDialog = ({ contact, open, onClose }: ContactDetailDialogProps) => {
  if (!contact) return null

  const getRelationshipTypeBadge = (type: string) => {
    const badgeProps = {
      prospecto: { variant: 'secondary' as const, label: 'Prospecto' },
      cliente: { variant: 'default' as const, label: 'Cliente' },
      ex_cliente: { variant: 'outline' as const, label: 'Ex Cliente' }
    }
    
    const config = badgeProps[type as keyof typeof badgeProps] || badgeProps.prospecto
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      activo: { variant: 'default' as const, label: 'Activo' },
      inactivo: { variant: 'secondary' as const, label: 'Inactivo' },
      prospecto: { variant: 'outline' as const, label: 'Prospecto' },
      bloqueado: { variant: 'destructive' as const, label: 'Bloqueado' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.activo
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {contact.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado y Tipo de Relación */}
          <div className="flex items-center gap-2 flex-wrap">
            {getRelationshipTypeBadge(contact.relationship_type)}
            {contact.status && getStatusBadge(contact.status)}
            {contact.client_type && (
              <Badge variant="outline">
                {contact.client_type === 'particular' ? 'Particular' : 
                 contact.client_type === 'empresa' ? 'Empresa' : 
                 contact.client_type === 'autonomo' ? 'Autónomo' : contact.client_type}
              </Badge>
            )}
          </div>

          {/* Información de Contacto */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{contact.phone}</span>
                </div>
              )}
              {contact.dni_nif && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">DNI/NIF: {contact.dni_nif}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dirección */}
          {(contact.address_street || contact.address_city || contact.address_postal_code) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Dirección</h3>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  {contact.address_street && <div>{contact.address_street}</div>}
                  <div>
                    {contact.address_postal_code && `${contact.address_postal_code} `}
                    {contact.address_city}
                  </div>
                  {contact.address_country && <div>{contact.address_country}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Información Comercial */}
          {(contact.business_sector || contact.how_found_us || contact.hourly_rate) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Información Comercial</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {contact.business_sector && (
                    <div>
                      <span className="font-medium">Sector:</span> {contact.business_sector}
                    </div>
                  )}
                  {contact.how_found_us && (
                    <div>
                      <span className="font-medium">Cómo nos encontró:</span> {contact.how_found_us}
                    </div>
                  )}
                  {contact.hourly_rate && (
                    <div>
                      <span className="font-medium">Tarifa por hora:</span> €{contact.hourly_rate}
                    </div>
                  )}
                  {contact.payment_method && (
                    <div>
                      <span className="font-medium">Método de pago:</span> {contact.payment_method}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Preferencias */}
          {(contact.contact_preference || contact.preferred_language || contact.preferred_meeting_time) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Preferencias</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {contact.contact_preference && (
                    <div>
                      <span className="font-medium">Preferencia de contacto:</span> {contact.contact_preference}
                    </div>
                  )}
                  {contact.preferred_language && (
                    <div>
                      <span className="font-medium">Idioma preferido:</span> {contact.preferred_language}
                    </div>
                  )}
                  {contact.preferred_meeting_time && (
                    <div>
                      <span className="font-medium">Hora preferida de reunión:</span> {contact.preferred_meeting_time}
                    </div>
                  )}
                  {contact.timezone && (
                    <div>
                      <span className="font-medium">Zona horaria:</span> {contact.timezone}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Etiquetas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notas Internas */}
          {contact.internal_notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Notas Internas</h3>
                <div className="text-sm bg-muted p-3 rounded-md">
                  {contact.internal_notes}
                </div>
              </div>
            </>
          )}

          {/* Información del Sistema */}
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Creado: {formatDate(contact.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Actualizado: {formatDate(contact.updated_at)}</span>
              </div>
              {contact.last_contact_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Último contacto: {formatDate(contact.last_contact_date)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
