
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DEAL_STAGES, Deal } from '@/types/deals'
import { DealCard } from './DealCard'

export const DealsPipeline = () => {
  // Datos mock - en producción vendrían de la API
  const mockDeals: Deal[] = [
    {
      id: '1',
      name: 'Adquisición TechCorp',
      company_name: 'TechCorp Solutions',
      deal_type: 'acquisition',
      stage: 'due_diligence',
      value: 5000000,
      currency: 'EUR',
      probability: 75,
      expected_close_date: '2025-03-15',
      assigned_to: 'Maria García',
      created_at: '2025-01-15',
      updated_at: '2025-01-20',
      org_id: 'org1',
      target_company: 'TechCorp Solutions',
      acquirer_company: 'Global Industries',
      industry: 'Technology',
      geography: 'Spain',
      deal_structure: 'stock',
      financing_type: 'mixed',
      dd_status: 'in_progress',
      dd_deadline: '2025-02-28',
      lead_advisor: 'Carlos López',
      deal_team: ['Maria García', 'Juan Pérez', 'Ana Martín'],
      key_documents: []
    },
    {
      id: '2',
      name: 'Venta Manufacturing Inc',
      company_name: 'Manufacturing Inc',
      deal_type: 'sale',
      stage: 'loi_negotiation',
      value: 12000000,
      currency: 'EUR',
      probability: 60,
      expected_close_date: '2025-04-30',
      assigned_to: 'Carlos López',
      created_at: '2025-01-10',
      updated_at: '2025-01-22',
      org_id: 'org1',
      target_company: 'Manufacturing Inc',
      industry: 'Manufacturing',
      geography: 'Europe',
      deal_structure: 'asset',
      financing_type: 'cash',
      dd_status: 'not_started',
      lead_advisor: 'María García',
      deal_team: ['Carlos López', 'Elena Ruiz'],
      key_documents: []
    }
  ]

  const getDealsByStage = (stage: string) => {
    return mockDeals.filter(deal => deal.stage === stage)
  }

  const getStageValue = (stage: string) => {
    const deals = getDealsByStage(stage)
    return deals.reduce((total, deal) => total + deal.value, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex overflow-x-auto gap-4 pb-4">
        {DEAL_STAGES.filter(stage => stage.value !== 'lost').map((stage) => {
          const stageDeals = getDealsByStage(stage.value)
          const stageValue = getStageValue(stage.value)
          
          return (
            <div key={stage.value} className="flex-shrink-0 w-80">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                      {stage.label}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {stageDeals.length}
                    </Badge>
                  </div>
                  {stageValue > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(stageValue)}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {stageDeals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No hay deals en esta etapa
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} />
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
