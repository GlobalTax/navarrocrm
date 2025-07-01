
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Contact, useContacts } from '@/hooks/useContacts'
import { Person } from '@/hooks/usePersons'
import { Company } from '@/hooks/useCompanies'
import { ContactsTabsContent } from '@/components/contacts/ContactsTabsContent'
import { ContactsDialogManager } from '@/components/contacts/ContactsDialogManager'
import { PersonFormDialog } from '@/components/contacts/PersonFormDialog'
import { ContactQuickMetrics } from '@/components/contacts/ContactQuickMetrics'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'

const Contacts = () => {
  const [isCreatePersonDialogOpen, setIsCreatePersonDialogOpen] = useState(false)
  const [isEditPersonDialogOpen, setIsEditPersonDialogOpen] = useState(false)
  const [isCreateCompanyDialogOpen, setIsCreateCompanyDialogOpen] = useState(false)
  const [isEditCompanyDialogOpen, setIsEditCompanyDialogOpen] = useState(false)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [activeTab, setActiveTab] = useState('persons')

  const { contacts, refetch } = useContacts()

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Contactos"
        description="Gestiona personas físicas y empresas de tu cartera"
      />

      {/* Métricas rápidas */}
      <ContactQuickMetrics contacts={contacts} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="persons">
            Personas Físicas
          </TabsTrigger>
          <TabsTrigger value="companies">
            Empresas
          </TabsTrigger>
          <TabsTrigger value="analytics">
            Análisis y Métricas
          </TabsTrigger>
        </TabsList>

        <ContactsTabsContent
          contacts={contacts}
          onBulkUpload={() => setIsBulkUploadOpen(true)}
          onExport={() => setIsExportDialogOpen(true)}
          onCreatePerson={handleCreatePerson}
          onCreateCompany={handleCreateCompany}
          onViewPerson={handleViewPerson}
          onEditPerson={handleEditPerson}
          onViewCompany={handleViewCompany}
          onEditCompany={handleEditCompany}
        />
      </Tabs>

      {/* Diálogos para Personas Físicas */}
      <PersonFormDialog
        person={selectedPerson}
        open={isCreatePersonDialogOpen || isEditPersonDialogOpen}
        onClose={handleDialogClose}
      />

      {/* Diálogos para Empresas - Sin ClientDetailDialog */}
      <ContactsDialogManager
        selectedContact={selectedContact}
        isCreateDialogOpen={isCreateCompanyDialogOpen}
        isEditDialogOpen={isEditCompanyDialogOpen}
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

  function handleCreatePerson() {
    setSelectedPerson(null)
    setIsCreatePersonDialogOpen(true)
  }

  function handleCreateCompany() {
    setSelectedCompany(null)
    setIsCreateCompanyDialogOpen(true)
  }

  function handleEditPerson(person: Person) {
    setSelectedPerson(person)
    setIsEditPersonDialogOpen(true)
  }

  function handleEditCompany(company: Company) {
    setSelectedCompany(company)
    setIsEditCompanyDialogOpen(true)
  }

  // Estas funciones ya no abren pop-ups, la navegación se maneja en los componentes
  function handleViewPerson(person: Person) {
    // La navegación se maneja directamente en las tablas
  }

  function handleViewCompany(company: Company) {
    // La navegación se maneja directamente en las tablas
  }

  function handleDialogClose() {
    setIsCreatePersonDialogOpen(false)
    setIsEditPersonDialogOpen(false)
    setIsCreateCompanyDialogOpen(false)
    setIsEditCompanyDialogOpen(false)
    setSelectedContact(null)
    setSelectedPerson(null)
    setSelectedCompany(null)
    refetch()
  }

  function handleBulkUploadSuccess() {
    refetch()
  }
}

export default Contacts
