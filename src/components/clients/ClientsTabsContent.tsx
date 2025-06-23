
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TabsContent } from '@/components/ui/tabs'
import { Grid, List, Upload, Download, BarChart3 } from 'lucide-react'
import { Client } from '@/hooks/useClients'
import { ClientsList } from './ClientsList'
import { ClientCardView } from './ClientCardView'
import { ClientMetricsDashboard } from './ClientMetricsDashboard'

interface ClientsTabsContentProps {
  clients: Client[]
  viewMode: 'table' | 'cards'
  setViewMode: (mode: 'table' | 'cards') => void
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
  onCreateClient,
  onViewClient,
  onEditClient,
  onBulkUpload,
  onExport
}: ClientsTabsContentProps) => {
  return (
    <>
      <TabsContent value="list" className="space-y-4">
        <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={onBulkUpload}>
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
          </div>
        </div>

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
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <ClientMetricsDashboard clients={clients} />
      </TabsContent>
    </>
  )
}
