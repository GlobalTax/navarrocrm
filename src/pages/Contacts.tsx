
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { Contact, useContacts } from '@/hooks/useContacts'
import { Person } from '@/hooks/usePersons'
import { Company } from '@/hooks/useCompanies'
import { ContactsTabsContent } from '@/components/contacts/ContactsTabsContent'
import { ContactsDialogManager } from '@/components/contacts/ContactsDialogManager'
import { PersonFormDialog } from '@/components/contacts/PersonFormDialog'
import { ContactQuickMetrics } from '@/components/contacts/ContactQuickMetrics'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { useOnboarding } from '@/components/onboarding'
import { ImprovedClientOnboarding } from '@/components/onboarding/ImprovedClientOnboarding'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const Contacts = () => {
  const [isCreatePersonDialogOpen, setIsCreatePersonDialogOpen] = useState(false)
  const [isEditPersonDialogOpen, setIsEditPersonDialogOpen] = useState(false)
  const [isCreateCompanyDialogOpen, setIsCreateCompanyDialogOpen] = useState(false)
  const [isEditCompanyDialogOpen, setIsEditCompanyDialogOpen] = useState(false)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isImprovedOnboardingOpen, setIsImprovedOnboardingOpen] = useState(false)
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [activeTab, setActiveTab] = useState('persons')

  const { contacts, refetch } = useContacts()
  const { startOnboarding } = useOnboarding()

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

  const handleDialogClose = () => {
    setIsCreatePersonDialogOpen(false)
    setIsEditPersonDialogOpen(false)
    setIsCreateCompanyDialogOpen(false)
    setIsEditCompanyDialogOpen(false)
    setSelectedContact(null)
    setSelectedPerson(null)
    setSelectedCompany(null)
    refetch()
  }

  const handleBulkUploadSuccess = () => {
    refetch()
  }

  const handleStartImprovedOnboarding = () => {
    setIsImprovedOnboardingOpen(true)
  }

  const handleCloseImprovedOnboarding = () => {
    setIsImprovedOnboardingOpen(false)
    refetch() // Refrescar datos después del onboarding
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Contactos"
        description="Gestiona personas físicas y empresas de tu cartera"
      />
      
      {/* Botones de Onboarding */}
      <div className="mb-6 flex gap-3">
        <Button 
          onClick={handleStartImprovedOnboarding}
          className="border-0.5 border-black rounded-[10px] bg-primary text-white hover:bg-primary/90"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Onboarding Inteligente
        </Button>
      </div>

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
          onEditPerson={handleEditPerson}
          onEditCompany={handleEditCompany}
        />
      </Tabs>

      {/* Diálogos para Personas Físicas */}
      <PersonFormDialog
        person={selectedPerson}
        open={isCreatePersonDialogOpen || isEditPersonDialogOpen}
        onClose={handleDialogClose}
      />

      {/* Diálogos para Empresas */}
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

      {/* Diálogo de Onboarding Mejorado */}
      <Dialog open={isImprovedOnboardingOpen} onOpenChange={setIsImprovedOnboardingOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden border-0.5 border-black rounded-[10px]">
          <DialogHeader className="px-6 py-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-semibold">
              Onboarding Inteligente de Clientes
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <ImprovedClientOnboarding onClose={handleCloseImprovedOnboarding} />
          </div>
        </DialogContent>
      </Dialog>

    </StandardPageContainer>
  )
}

export default Contacts
