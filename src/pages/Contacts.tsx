
import { useState } from 'react'
import { useContacts } from '@/hooks/useContacts'
import { PremiumPageHeader } from '@/components/layout/PremiumPageHeader'
import { PremiumFilters } from '@/components/layout/PremiumFilters'
import { ContactsList } from '@/components/contacts/ContactsList'
import { ContactsDialogManager } from '@/components/contacts/ContactsDialogManager'
import { ContactMetricsDashboard } from '@/components/contacts/ContactMetricsDashboard'

export default function Contacts() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<any>(null)

  const {
    contacts,
    filteredContacts,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    relationshipFilter,
    setRelationshipFilter
  } = useContacts()

  const handleCreateContact = () => {
    setIsCreateDialogOpen(true)
  }

  const handleViewContact = (contact: any) => {
    setSelectedContact(contact)
    setIsViewDialogOpen(true)
  }

  const handleEditContact = (contact: any) => {
    setSelectedContact(contact)
    setIsEditDialogOpen(true)
  }

  const statusOptions = [
    { label: 'Todos los estados', value: 'all' },
    { label: 'Activos', value: 'activo' },
    { label: 'Inactivos', value: 'inactivo' },
    { label: 'Prospectos', value: 'prospecto' }
  ]

  const relationshipOptions = [
    { label: 'Todas las relaciones', value: 'all' },
    { label: 'Cliente', value: 'cliente' },
    { label: 'Prospecto', value: 'prospecto' },
    { label: 'Proveedor', value: 'proveedor' }
  ]

  const hasActiveFilters = Boolean(
    searchTerm || 
    statusFilter !== 'all' || 
    relationshipFilter !== 'all'
  )

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setRelationshipFilter('all')
  }

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false)
    setIsViewDialogOpen(false)
    setIsEditDialogOpen(false)
    setSelectedContact(null)
  }

  return (
    <div className="min-h-screen bg-premium-gray-5 p-6">
      <div className="max-w-7xl mx-auto premium-spacing-xl">
        <PremiumPageHeader
          title="Contactos"
          description="Gestiona tu red de contactos y relaciones profesionales"
          badges={[
            { label: `${filteredContacts.length} contactos`, variant: 'primary' }
          ]}
          primaryAction={{
            label: 'Nuevo Contacto',
            onClick: handleCreateContact
          }}
        />

        <ContactMetricsDashboard contacts={contacts} />

        <div className="premium-spacing-lg">
          <PremiumFilters
            searchPlaceholder="Buscar contactos..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filters={[
              {
                placeholder: 'Estado',
                value: statusFilter,
                onChange: setStatusFilter,
                options: statusOptions
              },
              {
                placeholder: 'Relación',
                value: relationshipFilter,
                onChange: setRelationshipFilter,
                options: relationshipOptions
              }
            ]}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />

          <div className="mt-6">
            <ContactsList 
              onCreateContact={handleCreateContact}
              onViewContact={handleViewContact}
              onEditContact={handleEditContact}
            />
          </div>
        </div>

        <ContactsDialogManager
          selectedContact={selectedContact}
          isCreateDialogOpen={isCreateDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          isDetailDialogOpen={isViewDialogOpen}
          isBulkUploadOpen={false}
          isExportDialogOpen={false}
          contacts={contacts}
          onClose={handleCloseDialog}
          onBulkUploadClose={() => {}}
          onExportClose={() => {}}
          onBulkUploadSuccess={() => {}}
        />
      </div>
    </div>
  )
}
