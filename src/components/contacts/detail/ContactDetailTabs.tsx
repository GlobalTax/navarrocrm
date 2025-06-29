
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ContactOverviewTab } from './ContactOverviewTab'
import { ContactCasesTab } from './ContactCasesTab'
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

      <TabsContent value="communications">
        <Card>
          <CardHeader>
            <CardTitle>Comunicaciones</CardTitle>
            <CardDescription>
              Historial de comunicaciones con este contacto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>Funcionalidad de comunicaciones en desarrollo</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="documents">
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
            <CardDescription>
              Documentos asociados a este contacto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>Gestión de documentos en desarrollo</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="timeline">
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>
              Cronología de actividades y eventos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>Timeline de actividades en desarrollo</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
