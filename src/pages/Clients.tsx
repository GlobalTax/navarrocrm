
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Mail, Phone, Edit, Eye } from 'lucide-react'
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
  _count?: {
    cases: number
  }
}

const Clients = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const { data: clients = [], isLoading, refetch } = useQuery({
    queryKey: ['clients', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          email,
          phone,
          created_at
        `)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching clients:', error)
        throw error
      }
      return data || []
    },
    enabled: !!user?.org_id,
  })

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  )

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
            <p className="text-gray-600">Gestiona tus clientes y su información</p>
          </div>
          <Button onClick={handleCreateClient} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Cargando clientes...</div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">
                  {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                </div>
                {!searchTerm && (
                  <Button onClick={handleCreateClient}>
                    Crear primer cliente
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>
                        {client.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {client.email}
                          </div>
                        ) : (
                          <span className="text-gray-400">Sin email</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {client.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {client.phone}
                          </div>
                        ) : (
                          <span className="text-gray-400">Sin teléfono</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(client.created_at).toLocaleDateString()}
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
