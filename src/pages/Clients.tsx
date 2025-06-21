
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, Grid, List } from 'lucide-react'
import { Client, useClients } from '@/hooks/useClients'
import { ClientsHeader } from '@/components/clients/ClientsHeader'
import { ClientsTabsContent } from '@/components/clients/ClientsTabsContent'
import { ClientsDialogManager } from '@/components/clients/ClientsDialogManager'

const Clients = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [activeTab, setActiveTab] = useState('list')

  const { clients, refetch } = useClients()

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

  const handleBulkUploadSuccess = () => {
    refetch()
  }

  return (
    <div className="space-y-6">
      <ClientsHeader
        onCreateClient={handleCreateClient}
        onBulkUpload={() => setIsBulkUploadOpen(true)}
        onExport={() => setIsExportDialogOpen(true)}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista de Clientes
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Métricas y Análisis
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Gestión Avanzada
          </TabsTrigger>
        </TabsList>

        <ClientsTabsContent
          clients={clients}
          viewMode={viewMode}
          setViewMode={setViewMode}
          setActiveTab={setActiveTab}
          onCreateClient={handleCreateClient}
          onViewClient={handleViewClient}
          onEditClient={handleEditClient}
          onBulkUpload={() => setIsBulkUploadOpen(true)}
          onExport={() => setIsExportDialogOpen(true)}
        />
      </Tabs>

      <ClientsDialogManager
        selectedClient={selectedClient}
        isCreateDialogOpen={isCreateDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        isDetailDialogOpen={isDetailDialogOpen}
        isBulkUploadOpen={isBulkUploadOpen}
        isExportDialogOpen={isExportDialogOpen}
        clients={clients}
        onClose={handleDialogClose}
        onBulkUploadClose={() => setIsBulkUploadOpen(false)}
        onExportClose={() => setIsExportDialogOpen(false)}
        onBulkUploadSuccess={handleBulkUploadSuccess}
      />
    </div>
  )
}

export default Clients
