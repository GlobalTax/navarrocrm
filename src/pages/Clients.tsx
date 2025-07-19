
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Client, useClients } from '@/hooks/useClients'
import { ClientsTabsContent } from '@/components/clients/ClientsTabsContent'
import { ClientsDialogManager } from '@/components/clients/ClientsDialogManager'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { MainLayout } from '@/components/layout/MainLayout'

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
    // Ya no abrimos el modal, navegamos a la página de detalle
    // La navegación se maneja en ClientTable directamente
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
    <MainLayout>
      <StandardPageContainer>
        <StandardPageHeader
          title="Clientes"
          description="Gestiona tu cartera de clientes"
          primaryAction={{
            label: 'Nuevo Cliente',
            onClick: handleCreateClient
          }}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">
              Gestión de Clientes
            </TabsTrigger>
            <TabsTrigger value="analytics">
              Análisis y Métricas
            </TabsTrigger>
          </TabsList>

          <ClientsTabsContent
            clients={clients}
            viewMode={viewMode}
            setViewMode={setViewMode}
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
      </StandardPageContainer>
    </MainLayout>
  )
}

export default Clients
