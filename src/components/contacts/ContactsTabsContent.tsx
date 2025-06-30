
import { Button } from '@/components/ui/button'
import { TabsContent } from '@/components/ui/tabs'
import { Grid, List, Upload, Download, UserPlus, Building2 } from 'lucide-react'
import { Contact } from '@/hooks/useContacts'
import { Person } from '@/hooks/usePersons'
import { Company } from '@/hooks/useCompanies'
import { PersonsList } from './PersonsList'
import { CompaniesList } from './CompaniesList'
import { ContactMetricsDashboard } from './ContactMetricsDashboard'

interface ContactsTabsContentProps {
  contacts: Contact[]
  onBulkUpload: () => void
  onExport: () => void
  onCreatePerson: () => void
  onCreateCompany: () => void
  onViewPerson: (person: Person) => void
  onEditPerson: (person: Person) => void
  onViewCompany: (company: Company) => void
  onEditCompany: (company: Company) => void
}

export const ContactsTabsContent = ({
  contacts,
  onBulkUpload,
  onExport,
  onCreatePerson,
  onCreateCompany,
  onViewPerson,
  onEditPerson,
  onViewCompany,
  onEditCompany
}: ContactsTabsContentProps) => {
  return (
    <>
      <TabsContent value="persons" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={onCreatePerson}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nueva Persona
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

        <PersonsList
          onCreatePerson={onCreatePerson}
          onViewPerson={onViewPerson}
          onEditPerson={onEditPerson}
        />
      </TabsContent>

      <TabsContent value="companies" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={onCreateCompany}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Nueva Empresa
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

        <CompaniesList
          onCreateCompany={onCreateCompany}
          onViewCompany={onViewCompany}
          onEditCompany={onEditCompany}
        />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <ContactMetricsDashboard contacts={contacts} />
      </TabsContent>
    </>
  )
}
