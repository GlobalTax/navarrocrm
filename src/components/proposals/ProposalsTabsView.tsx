
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Calculator } from 'lucide-react'
import { ProposalCard } from '@/components/proposals/ProposalCard'

interface CategorizedProposals {
  all: any[]
  recurring: any[]
  oneTime: any[]
}

interface ProposalsTabsViewProps {
  proposals: CategorizedProposals
  onStatusChange: (id: string, status: any) => void
  onViewProposal: (proposal: any) => void
  onOpenNewProposal: () => void
  onOpenEnhancedBuilder: () => void
  onOpenProfessionalBuilder: () => void
  onOpenAdvancedProfessionalBuilder: () => void
}

export const ProposalsTabsView = ({
  proposals,
  onStatusChange,
  onViewProposal,
  onOpenNewProposal,
  onOpenEnhancedBuilder,
  onOpenProfessionalBuilder,
  onOpenAdvancedProfessionalBuilder
}: ProposalsTabsViewProps) => {
  const EmptyStateButtons = () => (
    <div className="flex gap-2 justify-center">
      <Button onClick={onOpenNewProposal} variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Propuesta Rápida
      </Button>
      <Button onClick={onOpenEnhancedBuilder} variant="outline">
        <FileText className="h-4 w-4 mr-2" />
        Propuesta Avanzada
      </Button>
      <Button onClick={onOpenProfessionalBuilder} variant="outline">
        <Calculator className="h-4 w-4 mr-2" />
        Propuesta Profesional
      </Button>
      <Button onClick={onOpenAdvancedProfessionalBuilder}>
        <FileText className="h-4 w-4 mr-2" />
        Propuesta Ejecutiva
      </Button>
    </div>
  )

  const ProposalGrid = ({ proposalList }: { proposalList: any[] }) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {proposalList.map(proposal => (
        <ProposalCard
          key={proposal.id}
          proposal={proposal}
          onStatusChange={onStatusChange}
          onView={onViewProposal}
        />
      ))}
    </div>
  )

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList>
        <TabsTrigger value="all">Todas ({proposals.all.length})</TabsTrigger>
        <TabsTrigger value="recurring">Recurrentes ({proposals.recurring.length})</TabsTrigger>
        <TabsTrigger value="onetime">Puntuales ({proposals.oneTime.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        {proposals.all.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              No hay propuestas creadas aún
            </div>
            <EmptyStateButtons />
          </div>
        ) : (
          <ProposalGrid proposalList={proposals.all} />
        )}
      </TabsContent>

      <TabsContent value="recurring" className="space-y-4">
        {proposals.recurring.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              No hay propuestas recurrentes
            </div>
            <Button onClick={onOpenNewProposal}>
              <Plus className="h-4 w-4 mr-2" />
              Crear propuesta recurrente
            </Button>
          </div>
        ) : (
          <ProposalGrid proposalList={proposals.recurring} />
        )}
      </TabsContent>

      <TabsContent value="onetime" className="space-y-4">
        {proposals.oneTime.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              No hay propuestas puntuales
            </div>
            <Button onClick={onOpenNewProposal}>
              <Plus className="h-4 w-4 mr-2" />
              Crear propuesta puntual
            </Button>
          </div>
        ) : (
          <ProposalGrid proposalList={proposals.oneTime} />
        )}
      </TabsContent>
    </Tabs>
  )
}
