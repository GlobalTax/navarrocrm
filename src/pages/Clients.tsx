
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Upload, Download, BarChart3, Grid, List } from 'lucide-react'
import { ClientFormDialog } from '@/components/clients/ClientFormDialog'
import { ClientDetailDialog } from '@/components/clients/ClientDetailDialog'
import { ClientBulkUpload } from '@/components/clients/ClientBulkUpload'
import { ClientExportDialog } from '@/components/clients/ClientExportDialog'
import { ClientMetricsDashboard } from '@/components/clients/ClientMetricsDashboard'
import { ClientsList } from '@/components/clients/ClientsList'
import { ClientCardView } from '@/components/clients/ClientCardView'
import { Client, useClients } from '@/hooks/useClients'

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600">Panel completo para la administración de tu cartera de clientes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button onClick={handleCreateClient} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

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

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vista de Clientes</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'table' ? (
                <ClientsList
                  onCreateClient={handleCreateClient}
                  onViewClient={handleViewClient}
                  onEditClient={handleEditClient}
                />
              ) : (
                <ClientCardView
                  clients={clients}
                  onViewClient={handleViewClient}
                  onEditClient={handleEditClient}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <ClientMetricsDashboard clients={clients} />
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setIsBulkUploadOpen(true)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Importación Masiva
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Importa múltiples clientes desde archivos CSV o Excel de forma rápida y segura.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setIsExportDialogOpen(true)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-600" />
                  Exportación de Datos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Exporta la información de tus clientes en diferentes formatos para análisis externo.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('dashboard')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Análisis Avanzado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Visualiza métricas detalladas y estadísticas de tu cartera de clientes.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleCreateClient}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cliente Individual
                </Button>
                <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importación Masiva
                </Button>
                <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Todo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
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

      <ClientBulkUpload
        open={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onSuccess={handleBulkUploadSuccess}
      />

      <ClientExportDialog
        open={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        clients={clients}
      />
    </div>
  )
}

export default Clients
