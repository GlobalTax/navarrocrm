
import { ProposalsTable } from './ProposalsTable'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Repeat, FileText, Euro } from 'lucide-react'

interface CategorizedProposals {
  all: any[]
  recurring: any[]
  oneTime: any[]
}

interface ProposalsTableViewProps {
  proposals: CategorizedProposals
  onStatusChange: (id: string, status: any) => void
  onViewProposal: (proposal: any) => void
}

export const ProposalsTableView = ({
  proposals,
  onStatusChange,
  onViewProposal
}: ProposalsTableViewProps) => {
  const recurrentRevenue = proposals.recurring.reduce((sum, p) => sum + (p.total_amount || 0), 0)
  const specificRevenue = proposals.oneTime.reduce((sum, p) => sum + (p.total_amount || 0), 0)
  const totalRevenue = recurrentRevenue + specificRevenue

  return (
    <div className="space-y-8">
      {/* Métricas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {proposals.all.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">propuestas</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Repeat className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Recurrentes</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {proposals.recurring.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {recurrentRevenue.toFixed(2)} € total
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Puntuales</span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {proposals.oneTime.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {specificRevenue.toFixed(2)} € total
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Euro className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Valor Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {totalRevenue.toFixed(2)} €
          </div>
          <div className="text-xs text-green-600 mt-1">
            +{((recurrentRevenue / totalRevenue) * 100).toFixed(0)}% recurrente
          </div>
        </div>
      </div>

      {/* Información de tipos */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          <Repeat className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Recurrentes</span>
          <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-100">
            {proposals.recurring.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <FileText className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-900">Puntuales</span>
          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-100">
            {proposals.oneTime.length}
          </Badge>
        </div>
      </div>

      {/* Tabla de propuestas */}
      <ProposalsTable
        proposals={proposals.all}
        onStatusChange={onStatusChange}
        onViewProposal={onViewProposal}
      />
    </div>
  )
}
