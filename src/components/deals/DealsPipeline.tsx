
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Proposal } from '@/hooks/useProposals'

interface DealsPipelineProps {
  deals: Proposal[]
}

export function DealsPipeline({ deals }: DealsPipelineProps) {
  const stages = [
    { id: 'draft', name: 'Borrador', deals: deals.filter(d => d.status === 'draft') },
    { id: 'sent', name: 'Enviado', deals: deals.filter(d => d.status === 'sent') },
    { id: 'won', name: 'Ganado', deals: deals.filter(d => d.status === 'won') },
    { id: 'lost', name: 'Perdido', deals: deals.filter(d => d.status === 'lost') }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stages.map((stage) => (
        <Card key={stage.id} className="border-0.5 border-black rounded-[10px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              {stage.name}
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {stage.deals.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stage.deals.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay deals en esta etapa
              </p>
            ) : (
              stage.deals.map((deal) => (
                <div
                  key={deal.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <h4 className="font-medium text-sm">{deal.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {deal.client?.name || 'Sin cliente'}
                  </p>
                  <p className="text-xs font-medium text-green-600 mt-1">
                    €{deal.total_amount?.toLocaleString() || '0'}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
