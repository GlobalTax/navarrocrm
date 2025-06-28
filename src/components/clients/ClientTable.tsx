
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Phone, Edit, Eye, Building, User } from 'lucide-react'
import { Client } from '@/hooks/useClients'
import { useNavigate } from 'react-router-dom'

interface ClientTableProps {
  clients: Client[]
  onViewClient: (client: Client) => void
  onEditClient: (client: Client) => void
}

export const ClientTable = ({ clients, onViewClient, onEditClient }: ClientTableProps) => {
  const navigate = useNavigate()

  const handleViewClient = (client: Client) => {
    navigate(`/contacts/${client.id}`)
  }

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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Tarifa</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{client.name}</div>
                  {client.business_sector && (
                    <div className="text-sm text-gray-500">{client.business_sector}</div>
                  )}
                  {client.tags && client.tags.length > 0 && (
                    <div className="flex gap-1">
                      {client.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {client.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{client.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 text-gray-400" />
                      {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {client.phone}
                    </div>
                  )}
                  {!client.email && !client.phone && (
                    <span className="text-gray-400 text-sm">Sin contacto</span>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                {getStatusBadge(client.status)}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  {getClientTypeIcon(client.client_type)}
                  <span className="capitalize text-sm">
                    {client.client_type || 'No especificado'}
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                {client.hourly_rate ? (
                  <span className="font-medium">{client.hourly_rate}€/h</span>
                ) : (
                  <span className="text-gray-400">No definida</span>
                )}
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  {new Date(client.created_at).toLocaleDateString()}
                </div>
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewClient(client)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditClient(client)}
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
