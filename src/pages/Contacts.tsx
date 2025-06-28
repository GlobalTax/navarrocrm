
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Contact, useContacts } from '@/hooks/useContacts'
import { ContactsTabsContent } from '@/components/contacts/ContactsTabsContent'
import { ContactsDialogManager } from '@/components/contacts/ContactsDialogManager'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'

const Contacts = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [activeTab, setActiveTab] = useState('list')

  const { contacts, refetch } = useContacts()

  const handleCreateContact = () => {
    setSelectedContact(null)
    setIsCreateDialogOpen(true)
  }

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact)
    setIsEditDialogOpen(true)
  }

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact)
    setIsDetailDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setIsDetailDialogOpen(false)
    setSelectedContact(null)
  }

  const handleBulkUploadSuccess = () => {
    refetch()
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Contactos"
        description="Gestiona tu cartera de contactos, prospectos y clientes"
        primaryAction={{
          label: 'Nuevo Contacto',
          onClick: handleCreateContact
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">
            Gestión de Contactos
          </TabsTrigger>
          <TabsTrigger value="analytics">
            Análisis y Métricas
          </TabsTrigger>
        </TabsList>

        <ContactsTabsContent
          contacts={contacts}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onCreateContact={handleCreateContact}
          onViewContact={handleViewContact}
          onEditContact={handleEditContact}
          onBulkUpload={() => setIsBulkUploadOpen(true)}
          onExport={() => setIsExportDialogOpen(true)}
        />
      </Tabs>

      <ContactsDialogManager
        selectedContact={selectedContact}
        isCreateDialogOpen={isCreateDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        isDetailDialogOpen={isDetailDialogOpen}
        isBulkUploadOpen={isBulkUploadOpen}
        isExportDialogOpen={isExportDialogOpen}
        contacts={contacts}
        onClose={handleDialogClose}
        onBulkUploadClose={() => setIsBulkUploadOpen(false)}
        onExportClose={() => setIsExportDialogOpen(false)}
        onBulkUploadSuccess={handleBulkUploadSuccess}
      />
    </StandardPageContainer>
  )
}

export default Contacts
