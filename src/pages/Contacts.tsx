
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Contact, useContacts } from '@/hooks/useContacts'
import { Person } from '@/hooks/usePersons'
import { Company } from '@/hooks/useCompanies'
import { ContactsTabsContent } from '@/components/contacts/ContactsTabsContent'
import { ContactsDialogManager } from '@/components/contacts/ContactsDialogManager'
import { PersonFormDialog } from '@/components/contacts/PersonFormDialog'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'

const Contacts = () => {
  const [isCreatePersonDialogOpen, setIsCreatePersonDialogOpen] = useState(false)
  const [isEditPersonDialogOpen, setIsEditPersonDialogOpen] = useState(false)
  const [isCreateCompanyDialogOpen, setIsCreateCompanyDialogOpen] = useState(false)
  const [isEditCompanyDialogOpen, setIsEditCompanyDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [activeTab, setActiveTab] = useState('persons')

  const { contacts, refetch } = useContacts()

  const handleCreatePerson = () => {
    setSelectedPerson(null)
    setIsCreatePersonDialogOpen(true)
  }

  const handleCreateCompany = () => {
    setSelectedCompany(null)
    setIsCreateCompanyDialogOpen(true)
  }

  const handleEditPerson = (person: Person) => {
    setSelectedPerson(person)
    setIsEditPersonDialogOpen(true)
  }

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company)
    setIsEditCompanyDialogOpen(true)
  }

  const handleViewPerson = (person: Person) => {
    setSelectedContact(person as Contact)
    setIsDetailDialogOpen(true)
  }

  const handleViewCompany = (company: Company) => {
    setSelectedContact(company as Contact)
    setIsDetailDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsCreatePersonDialogOpen(false)
    setIsEditPersonDialogOpen(false)
    setIsCreateCompanyDialogOpen(false)
    setIsEditCompanyDialogOpen(false)
    setIsDetailDialogOpen(false)
    setSelectedContact(null)
    setSelectedPerson(null)
    setSelectedCompany(null)
    refetch()
  }

  const handleBulkUploadSuccess = () => {
    refetch()
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Contactos"
        description="Gestiona personas físicas y empresas de tu cartera"
      />

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

      {/* Diálogos para Empresas - Reutilizamos los existentes */}
      <ContactsDialogManager
        selectedContact={selectedContact}
        isCreateDialogOpen={isCreateCompanyDialogOpen}
        isEditDialogOpen={isEditCompanyDialogOpen}
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
