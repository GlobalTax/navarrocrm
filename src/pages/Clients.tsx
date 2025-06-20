
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Mail, Phone, Edit, Eye, RefreshCw, Filter, Building, User } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { ClientFormDialog } from '@/components/clients/ClientFormDialog'
import { ClientDetailDialog } from '@/components/clients/ClientDetailDialog'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  created_at: string
  dni_nif: string | null
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_country: string | null
  legal_representative: string | null
  client_type: string | null
  business_sector: string | null
  how_found_us: string | null
  contact_preference: string | null
  preferred_language: string | null
  hourly_rate: number | null
  payment_method: string | null
  status: string | null
  tags: string[] | null
  internal_notes: string | null
  last_contact_date: string | null
}

const Clients = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const { data: clients = [], isLoading, error, refetch } = useQuery({
    queryKey: ['clients', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) {
        console.log('👥 No org_id disponible para obtener clientes')
        return []
      }
      
      console.log('👥 Obteniendo clientes para org:', user.org_id)
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching clients:', error)
        throw error
      }
      
      console.log('✅ Clientes obtenidos:', data?.length || 0)
      return data || []
    },
    enabled: !!user?.org_id,
  })

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm) ||
      client.dni_nif?.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    const matchesType = typeFilter === 'all' || client.client_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

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

  const handleCreateClient = () => {
    setSelectedClient(null)
    setIsCreateDialogOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setIsEditDialogOpen(true)
  }

  const handleViewClient = (client: Client) => {
    setSelectedClient(client)
    setIsDetailDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setIsDetailDialogOpen(false)
    setSelectedClient(null)
    refetch()
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600">Gestiona tu cartera de clientes con información completa</p>
          </div>
          <Button onClick={handleCreateClient} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Lista de Clientes ({filteredClients.length})
              {error && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetch}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reintentar
                </Button>
              )}
            </CardTitle>
            
            {/* Filtros y búsqueda */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email, teléfono o DNI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="prospecto">Prospecto</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="particular">Particular</SelectItem>
                    <SelectItem value="empresa">Empresa</SelectItem>
                    <SelectItem value="autonomo">Autónomo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="text-center py-8 text-red-600">
                <p className="font-medium">Error al cargar clientes</p>
                <p className="text-sm">{error.message}</p>
                <Button variant="outline" onClick={refetch} className="mt-2">
                  Reintentar
                </Button>
              </div>
            )}
            
            {!error && isLoading && (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Cargando clientes...</div>
              </div>
            )}
            
            {!error && !isLoading && filteredClients.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                    ? 'No se encontraron clientes con los filtros aplicados' 
                    : 'No hay clientes registrados'
                  }
                </div>
                {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                  <Button onClick={handleCreateClient}>
                    Crear primer cliente
                  </Button>
                )}
              </div>
            )}
            
            {!error && !isLoading && filteredClients.length > 0 && (
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
                    {filteredClients.map((client) => (
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
                              onClick={() => handleEditClient(client)}
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
            )}
          </CardContent>
        </Card>

        <ClientFormDialog
          client={selectedClient}
          open={isCreateDialogOpen || isEditDialogOpen}
          onClose={handleDialogClose}
        />

        <ClientDetailDialog
          client={selectedClient}
          open={isDetailDialogOpen}
          onClose={handleDialogClose}
        />
      </div>
    </MainLayout>
  )
}

export default Clients
