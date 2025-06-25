
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, Phone, Edit, Eye, Building, User, MapPin, Calendar, Euro, Tag } from 'lucide-react'
import { Client } from '@/hooks/useClients'
import { useImageOptimization } from '@/hooks/image/useImageOptimization'
import { Skeleton } from '@/components/ui/skeleton'

interface ClientCardViewProps {
  clients: Client[]
  onViewClient: (client: Client) => void
  onEditClient: (client: Client) => void
}

const OptimizedAvatar = ({ client }: { client: Client }) => {
  // Simular URL de avatar - en producción vendría de client.avatar_url
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(client.name)}`
  
  const { optimizedSrc, isLoaded, isLoading } = useImageOptimization(avatarUrl, {
    width: 48,
    height: 48,
    format: 'webp',
    lazy: true,
    placeholder: 'blur'
  })

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return <Skeleton className="h-12 w-12 rounded-full" />
  }

  return (
    <Avatar className="h-12 w-12">
      {isLoaded && optimizedSrc ? (
        <img
          src={optimizedSrc}
          alt={`Avatar de ${client.name}`}
          className="h-full w-full object-cover rounded-full"
        />
      ) : (
        <AvatarFallback className="bg-blue-100 text-blue-700">
          {getInitials(client.name)}
        </AvatarFallback>
      )}
    </Avatar>
  )
}

export const ClientCardView = ({ clients, onViewClient, onEditClient }: ClientCardViewProps) => {
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'activo':
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>
      case 'inactivo':
        return <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
      case 'prospecto':
        return <Badge className="bg-blue-100 text-blue-800">Prospecto</Badge>
      case 'bloqueado':
        return <Badge className="bg-red-100 text-red-800">Bloqueado</Badge>
      default:
        return <Badge variant="outline">Sin estado</Badge>
    }
  }

  const getClientTypeIcon = (type: string | null) => {
    switch (type) {
      case 'empresa':
        return <Building className="h-4 w-4" />
      case 'particular':
      case 'autonomo':
        return <User className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {clients.map((client) => (
        <Card key={client.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <OptimizedAvatar client={client} />
                <div>
                  <h3 className="font-semibold text-sm leading-tight">{client.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {getClientTypeIcon(client.client_type)}
                    <span className="text-xs text-gray-500 capitalize">
                      {client.client_type || 'No especificado'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {getStatusBadge(client.status)}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* Información de contacto */}
            <div className="space-y-2">
              {client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span>{client.phone}</span>
                </div>
              )}
              {(client.address_city || client.address_country) && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">
                    {[client.address_city, client.address_country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Información adicional */}
            <div className="space-y-2">
              {client.business_sector && (
                <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                  {client.business_sector}
                </div>
              )}
              
              {client.hourly_rate && (
                <div className="flex items-center gap-2 text-sm">
                  <Euro className="h-3 w-3 text-gray-400" />
                  <span className="font-medium">{client.hourly_rate}€/h</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>
                  Desde {new Date(client.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Tags */}
            {client.tags && client.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <Tag className="h-3 w-3 text-gray-400" />
                <div className="flex gap-1 flex-wrap">
                  {client.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                      {tag}
                    </Badge>
                  ))}
                  {client.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      +{client.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end gap-2 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewClient(client)
                }}
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEditClient(client)
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
