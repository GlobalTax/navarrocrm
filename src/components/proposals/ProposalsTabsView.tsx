
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Repeat, FileText, BarChart3 } from 'lucide-react'
import { ProposalCard } from '@/components/proposals/ProposalCard'
import { RecurringProposalsTable } from '@/components/proposals/RecurringProposalsTable'
import { RecurringProposalsMetrics } from '@/components/proposals/RecurringProposalsMetrics'
import { Badge } from '@/components/ui/badge'

interface CategorizedProposals {
  all: any[]
  recurring: any[]
  oneTime: any[]
}

interface ProposalsTabsViewProps {
  proposals: CategorizedProposals
  onStatusChange: (id: string, status: any) => void
  onViewProposal: (proposal: any) => void
  onOpenRecurrentBuilder: () => void
  onOpenSpecificBuilder: () => void
}

export const ProposalsTabsView = ({
  proposals,
  onStatusChange,
  onViewProposal,
  onOpenRecurrentBuilder,
  onOpenSpecificBuilder
}: ProposalsTabsViewProps) => {
  const EmptyStateButtons = ({ type }: { type: 'recurrent' | 'specific' | 'general' }) => (
    <div className="flex gap-3 justify-center">
      {(type === 'recurrent' || type === 'general') && (
        <Button onClick={onOpenRecurrentBuilder} variant="outline" className="flex-col h-auto p-4">
          <Repeat className="h-6 w-6 mb-2 text-blue-600" />
          <div className="text-center">
            <div className="font-semibold">Propuesta Recurrente</div>
            <div className="text-xs text-gray-500 mt-1">Fiscal, Contabilidad, Laboral</div>
          </div>
        </Button>
      )}
      {(type === 'specific' || type === 'general') && (
        <Button onClick={onOpenSpecificBuilder} className="flex-col h-auto p-4">
          <FileText className="h-6 w-6 mb-2" />
          <div className="text-center">
            <div className="font-semibold">Propuesta Puntual</div>
            <div className="text-xs text-white/80 mt-1">Proyectos específicos</div>
          </div>
        </Button>
      )}
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

  const MetricsBanner = ({ type, count, revenue }: { type: string, count: number, revenue: number }) => (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Resumen {type}</h3>
            <p className="text-sm text-gray-600">{count} propuestas activas</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">{revenue.toFixed(2)} €</div>
          <div className="text-sm text-gray-500">Valor total</div>
        </div>
      </div>
    </div>
  )

  const recurrentRevenue = proposals.recurring.reduce((sum, p) => sum + (p.total_amount || 0), 0)
  const specificRevenue = proposals.oneTime.reduce((sum, p) => sum + (p.total_amount || 0), 0)

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Todas 
          <Badge variant="secondary" className="ml-1">{proposals.all.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="recurring" className="flex items-center gap-2">
          <Repeat className="h-4 w-4" />
          Recurrentes
          <Badge variant="secondary" className="ml-1">{proposals.recurring.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="specific" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Puntuales
          <Badge variant="secondary" className="ml-1">{proposals.oneTime.length}</Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        {proposals.all.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              No hay propuestas creadas
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Comienza creando tu primera propuesta comercial
            </p>
            <EmptyStateButtons type="general" />
          </div>
        ) : (
          <>
            <MetricsBanner 
              type="General" 
              count={proposals.all.length} 
              revenue={recurrentRevenue + specificRevenue} 
            />
            <ProposalGrid proposalList={proposals.all} />
          </>
        )}
      </TabsContent>

      <TabsContent value="recurring" className="space-y-4">
        {proposals.recurring.length === 0 ? (
          <div className="text-center py-12">
            <Repeat className="h-12 w-12 text-blue-300 mx-auto mb-4" />
            <div className="text-gray-500 text-lg mb-2">
              No hay propuestas recurrentes
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Crea propuestas para servicios continuos como fiscal, contabilidad o laboral
            </p>
            <EmptyStateButtons type="recurrent" />
          </div>
        ) : (
          <>
            <RecurringProposalsMetrics proposals={proposals.recurring} />
            <RecurringProposalsTable
              proposals={proposals.recurring}
              onStatusChange={onStatusChange}
              onViewProposal={onViewProposal}
            />
          </>
        )}
      </TabsContent>

      <TabsContent value="specific" className="space-y-4">
        {proposals.oneTime.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-green-300 mx-auto mb-4" />
            <div className="text-gray-500 text-lg mb-2">
              No hay propuestas puntuales
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Crea propuestas para proyectos específicos y servicios únicos
            </p>
            <EmptyStateButtons type="specific" />
          </div>
        ) : (
          <>
            <MetricsBanner 
              type="Puntual" 
              count={proposals.oneTime.length} 
              revenue={specificRevenue} 
            />
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-900">Propuestas Puntuales</span>
              </div>
              <p className="text-sm text-green-700">
                Estas propuestas generan <strong>Expedientes</strong> cuando son aceptadas.
                Ideales para proyectos específicos, consultoría y servicios únicos.
              </p>
            </div>
            <ProposalGrid proposalList={proposals.oneTime} />
          </>
        )}
      </TabsContent>
    </Tabs>
  )
}
