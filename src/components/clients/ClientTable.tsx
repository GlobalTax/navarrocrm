
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CompactTable, CompactTableBody, CompactTableCell, CompactTableHead, CompactTableHeader, CompactTableRow } from '@/components/ui/compact-table'
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
      <CompactTable>
        <CompactTableHeader>
          <CompactTableRow>
            <CompactTableHead className="crm-table-header">Cliente</CompactTableHead>
            <CompactTableHead className="crm-table-header">Contacto</CompactTableHead>
            <CompactTableHead className="crm-table-header">Estado</CompactTableHead>
            <CompactTableHead className="crm-table-header">Tipo</CompactTableHead>
            <CompactTableHead className="crm-table-header">Tarifa</CompactTableHead>
            <CompactTableHead className="crm-table-header">Fecha</CompactTableHead>
            <CompactTableHead className="crm-table-header text-right">Acciones</CompactTableHead>
          </CompactTableRow>
        </CompactTableHeader>
        <CompactTableBody>
          {clients.map((client) => (
            <CompactTableRow key={client.id} className="hover:bg-gray-50">
              <CompactTableCell>
                <div className="space-y-0.5">
                  <div className="crm-table-cell font-medium">{client.name}</div>
                  {client.business_sector && (
                    <div className="crm-table-cell-secondary">{client.business_sector}</div>
                  )}
                  {client.tags && client.tags.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {client.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs h-4 px-1">
                          {tag}
                        </Badge>
                      ))}
                      {client.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs h-4 px-1">
                          +{client.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CompactTableCell>
              
              <CompactTableCell>
                <div className="space-y-0.5">
                  {client.email && (
                    <div className="flex items-center gap-1 crm-list-item">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-1 crm-list-item-secondary">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {client.phone}
                    </div>
                  )}
                  {!client.email && !client.phone && (
                    <span className="crm-table-cell-secondary">Sin contacto</span>
                  )}
                </div>
              </CompactTableCell>
              
              <CompactTableCell>
                {getStatusBadge(client.status)}
              </CompactTableCell>
              
              <CompactTableCell>
                <div className="flex items-center gap-1">
                  {getClientTypeIcon(client.client_type)}
                  <span className="crm-table-cell capitalize">
                    {client.client_type || 'No especificado'}
                  </span>
                </div>
              </CompactTableCell>
              
              <CompactTableCell>
                {client.hourly_rate ? (
                  <span className="crm-table-cell font-medium">{client.hourly_rate}€/h</span>
                ) : (
                  <span className="crm-table-cell-secondary">No definida</span>
                )}
              </CompactTableCell>
              
              <CompactTableCell>
                <div className="crm-table-cell-secondary">
                  {new Date(client.created_at).toLocaleDateString()}
                </div>
              </CompactTableCell>
              
              <CompactTableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewClient(client)}
                    className="h-6 w-6 p-0"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditClient(client)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CompactTableCell>
            </CompactTableRow>
          ))}
        </CompactTableBody>
      </CompactTable>
    </div>
  )
}
