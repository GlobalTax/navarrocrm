
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DealCard } from './DealCard'
import type { Proposal } from '@/hooks/useProposals'

interface DealsListProps {
  deals: Proposal[]
}

export function DealsList({ deals }: DealsListProps) {
  if (deals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">No hay deals</p>
            <p className="text-sm">Crea tu primera propuesta para comenzar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Deals ({deals.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
