
import { Button } from '@/components/ui/button'
import { TabsContent } from '@/components/ui/tabs'
import { Upload, Download, UserPlus, Building2 } from 'lucide-react'
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
  onEditPerson: (person: Person) => void
  onEditCompany: (company: Company) => void
}

export const ContactsTabsContent = ({
  contacts,
  onBulkUpload,
  onExport,
  onCreatePerson,
  onCreateCompany,
  onEditPerson,
  onEditCompany
}: ContactsTabsContentProps) => {
  return (
    <>
      <TabsContent value="persons" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={onCreatePerson}
              className="bg-slate-700 hover:bg-slate-800 text-white border-slate-700"
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
          onEditPerson={onEditPerson}
        />
      </TabsContent>

      <TabsContent value="companies" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={onCreateCompany}
              className="bg-slate-700 hover:bg-slate-800 text-white border-slate-700"
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
          onEditCompany={onEditCompany}
        />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <ContactMetricsDashboard contacts={contacts} />
      </TabsContent>
    </>
  )
}
