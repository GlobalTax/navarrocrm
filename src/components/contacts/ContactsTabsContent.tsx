
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TabsContent } from '@/components/ui/tabs'
import { Grid, List, Upload, Download, BarChart3 } from 'lucide-react'
import { Contact } from '@/hooks/useContacts'
import { ContactsList } from './ContactsList'
import { ContactCardView } from './ContactCardView'
import { ContactMetricsDashboard } from './ContactMetricsDashboard'

interface ContactsTabsContentProps {
  contacts: Contact[]
  viewMode: 'table' | 'cards'
  setViewMode: (mode: 'table' | 'cards') => void
  onCreateContact: () => void
  onViewContact: (contact: Contact) => void
  onEditContact: (contact: Contact) => void
  onBulkUpload: () => void
  onExport: () => void
}

export const ContactsTabsContent = ({
  contacts,
  viewMode,
  setViewMode,
  onCreateContact,
  onViewContact,
  onEditContact,
  onBulkUpload,
  onExport
}: ContactsTabsContentProps) => {
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
          <ContactsList
            onCreateContact={onCreateContact}
            onViewContact={onViewContact}
            onEditContact={onEditContact}
          />
        ) : (
          <ContactCardView
            contacts={contacts}
            onViewContact={onViewContact}
            onEditContact={onEditContact}
          />
        )}
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <ContactMetricsDashboard contacts={contacts} />
      </TabsContent>
    </>
  )
}
