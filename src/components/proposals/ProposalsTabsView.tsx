
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { OneTimeProposalsTable } from './OneTimeProposalsTable'
import { RecurringProposalsTable } from './RecurringProposalsTable'
import { AllProposalsTable } from './AllProposalsTable'
import { ProposalHistoryTable } from './ProposalHistoryTable'
import { Button } from '@/components/ui/button'
import { Plus, Repeat } from 'lucide-react'

interface ProposalsTabsViewProps {
  proposals: {
    all: any[]
    oneTime: any[]
    recurring: any[]
  }
  onStatusChange: (id: string, status: any) => void
  onViewProposal: (proposal: any) => void
  onEditProposal: (proposal: any) => void
  onDuplicateProposal: (proposal: any) => void
  onOpenRecurrentBuilder: () => void
  onOpenSpecificBuilder: () => void
}

export const ProposalsTabsView: React.FC<ProposalsTabsViewProps> = ({
  proposals,
  onStatusChange,
  onViewProposal,
  onEditProposal,
  onDuplicateProposal,
  onOpenRecurrentBuilder,
  onOpenSpecificBuilder
}) => {
  return (
    <Tabs defaultValue="all" className="w-full">
      <div className="flex items-center justify-between mb-6">
        <TabsList className="grid w-fit grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            Todas
            <Badge variant="secondary" className="ml-1">
              {proposals.all.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="one-time" className="flex items-center gap-2">
            Puntuales
            <Badge variant="secondary" className="ml-1">
              {proposals.oneTime.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="recurring" className="flex items-center gap-2">
            Recurrentes
            <Badge variant="secondary" className="ml-1">
              {proposals.recurring.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            📊 Historial
          </TabsTrigger>
        </TabsList>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onOpenRecurrentBuilder}
            className="flex items-center gap-2"
          >
            <Repeat className="w-4 h-4" />
            Nueva Recurrente
          </Button>
          <Button
            onClick={onOpenSpecificBuilder}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Puntual
          </Button>
        </div>
      </div>

      <TabsContent value="all" className="space-y-4">
        <AllProposalsTable
          proposals={proposals.all}
          onStatusChange={onStatusChange}
          onViewProposal={onViewProposal}
          onEditProposal={onEditProposal}
          onDuplicateProposal={onDuplicateProposal}
        />
      </TabsContent>

      <TabsContent value="one-time" className="space-y-4">
        <OneTimeProposalsTable
          proposals={proposals.oneTime}
          onStatusChange={onStatusChange}
          onViewProposal={onViewProposal}
          onEditProposal={onEditProposal}
          onDuplicateProposal={onDuplicateProposal}
        />
      </TabsContent>

      <TabsContent value="recurring" className="space-y-4">
        <RecurringProposalsTable
          proposals={proposals.recurring}
          onStatusChange={onStatusChange}
          onViewProposal={onViewProposal}
          onEditProposal={onEditProposal}
          onDuplicateProposal={onDuplicateProposal}
        />
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        <ProposalHistoryTable showFilters={true} />
      </TabsContent>
    </Tabs>
  )
}
