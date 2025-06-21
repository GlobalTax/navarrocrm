
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TabsContent } from '@/components/ui/tabs'
import { Grid, List, Upload, Download, BarChart3, Plus } from 'lucide-react'
import { Client } from '@/hooks/useClients'
import { ClientsList } from './ClientsList'
import { ClientCardView } from './ClientCardView'
import { ClientMetricsDashboard } from './ClientMetricsDashboard'

interface ClientsTabsContentProps {
  clients: Client[]
  viewMode: 'table' | 'cards'
  setViewMode: (mode: 'table' | 'cards') => void
  setActiveTab: (tab: string) => void
  onCreateClient: () => void
  onViewClient: (client: Client) => void
  onEditClient: (client: Client) => void
  onBulkUpload: () => void
  onExport: () => void
}

export const ClientsTabsContent = ({
  clients,
  viewMode,
  setViewMode,
  setActiveTab,
  onCreateClient,
  onViewClient,
  onEditClient,
  onBulkUpload,
  onExport
}: ClientsTabsContentProps) => {
  return (
    <>
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
                onCreateClient={onCreateClient}
                onViewClient={onViewClient}
                onEditClient={onEditClient}
              />
            ) : (
              <ClientCardView
                clients={clients}
                onViewClient={onViewClient}
                onEditClient={onEditClient}
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
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onBulkUpload}>
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

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onExport}>
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
              <Button variant="outline" onClick={onCreateClient}>
                <Plus className="h-4 w-4 mr-2" />
                Cliente Individual
              </Button>
              <Button variant="outline" onClick={onBulkUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Importación Masiva
              </Button>
              <Button variant="outline" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Todo
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  )
}
