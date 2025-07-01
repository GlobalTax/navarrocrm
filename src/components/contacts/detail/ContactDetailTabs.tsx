
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ContactOverviewTab } from './ContactOverviewTab'
import { ContactCasesTab } from './ContactCasesTab'
import { ContactCommunicationsTab } from './ContactCommunicationsTab'
import { ContactDocumentsTab } from './ContactDocumentsTab'
import { ContactTimelineTab } from './ContactTimelineTab'
import { Contact } from '@/hooks/useContacts'

interface CaseForContact {
  id: string
  title: string
  description: string | null
  status: 'open' | 'on_hold' | 'closed'
  practice_area: string | null
  created_at: string
}

interface ContactDetailTabsProps {
  contact: Contact
  relatedCases: CaseForContact[]
  casesLoading: boolean
  onCaseClick: (caseId: string) => void
}

export const ContactDetailTabs = ({ 
  contact, 
  relatedCases, 
  casesLoading, 
  onCaseClick 
}: ContactDetailTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid grid-cols-5 w-full max-w-lg">
        <TabsTrigger value="overview">Resumen</TabsTrigger>
        <TabsTrigger value="cases">Casos</TabsTrigger>
        <TabsTrigger value="communications">Comunicaciones</TabsTrigger>
        <TabsTrigger value="documents">Documentos</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <ContactOverviewTab contact={contact} />
      </TabsContent>

      <TabsContent value="cases" className="space-y-6">
        <ContactCasesTab 
          relatedCases={relatedCases}
          casesLoading={casesLoading}
          onCaseClick={onCaseClick}
        />
      </TabsContent>

      <TabsContent value="communications" className="space-y-6">
        <ContactCommunicationsTab contactId={contact.id} />
      </TabsContent>

      <TabsContent value="documents" className="space-y-6">
        <ContactDocumentsTab contactId={contact.id} />
      </TabsContent>

      <TabsContent value="timeline" className="space-y-6">
        <ContactTimelineTab contactId={contact.id} />
      </TabsContent>
    </Tabs>
  )
}
