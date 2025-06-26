
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Proposal } from '@/hooks/useProposals'

interface DealsPipelineProps {
  deals: Proposal[]
}

const stages = [
  { id: 'draft', title: 'Borrador', color: 'bg-gray-100' },
  { id: 'sent', title: 'Enviado', color: 'bg-blue-100' },
  { id: 'won', title: 'Ganado', color: 'bg-green-100' },
  { id: 'lost', title: 'Perdido', color: 'bg-red-100' }
]

export function DealsPipeline({ deals }: DealsPipelineProps) {
  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = deals.filter(deal => deal.status === stage.id)
    return acc
  }, {} as Record<string, Proposal[]>)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stages.map((stage) => (
        <Card key={stage.id} className={stage.color}>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              {stage.title}
              <Badge variant="secondary">
                {dealsByStage[stage.id]?.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 min-h-[200px]">
              {dealsByStage[stage.id]?.map((deal) => (
                <Card
                  key={deal.id}
                  className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm mb-2 line-clamp-2">
                      {deal.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {deal.client?.name || 'Sin cliente'}
                    </p>
                    <p className="text-sm font-medium text-green-600">
                      €{deal.total_amount?.toLocaleString() || '0'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
