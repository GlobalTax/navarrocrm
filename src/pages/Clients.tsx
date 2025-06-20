
import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ClientFormDialog } from '@/components/clients/ClientFormDialog'
import { ClientDetailDialog } from '@/components/clients/ClientDetailDialog'
import { ClientsList } from '@/components/clients/ClientsList'
import { Client } from '@/hooks/useClients'

const Clients = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

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

        <ClientsList
          onCreateClient={handleCreateClient}
          onViewClient={handleViewClient}
          onEditClient={handleEditClient}
        />

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
