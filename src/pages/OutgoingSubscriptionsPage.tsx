import React, { useState } from 'react'
import { OutgoingSubscriptionsList } from '@/components/outgoing-subscriptions/OutgoingSubscriptionsList'
import { OutgoingSubscriptionStats } from '@/components/outgoing-subscriptions/OutgoingSubscriptionStats'
import { OutgoingSubscriptionsTable } from '@/components/outgoing-subscriptions/OutgoingSubscriptionsTable'
import { Button } from '@/components/ui/button'
import { LayoutGrid, Table } from 'lucide-react'

const OutgoingSubscriptionsPage = () => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Suscripciones Pagadas</h1>
          <p className="text-muted-foreground">Gestiona todos los gastos recurrentes de tu empresa</p>
        </div>
        
        <div className="flex items-center gap-2 bg-muted p-1 rounded-[10px]">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="rounded-[8px]"
          >
            <Table className="h-4 w-4 mr-2" />
            Tabla
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className="rounded-[8px]"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Cards
          </Button>
        </div>
      </div>

      <OutgoingSubscriptionStats />
      
      {viewMode === 'table' ? (
        <OutgoingSubscriptionsTable />
      ) : (
        <OutgoingSubscriptionsList />
      )}
    </div>
  )
}

export default OutgoingSubscriptionsPage