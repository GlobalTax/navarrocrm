import React, { useState } from 'react'
import { OutgoingSubscriptionsList } from '@/components/outgoing-subscriptions/OutgoingSubscriptionsList'
import { OutgoingSubscriptionStats } from '@/components/outgoing-subscriptions/OutgoingSubscriptionStats'
import { OutgoingSubscriptionsTable } from '@/components/outgoing-subscriptions/OutgoingSubscriptionsTable'
import { UpcomingRenewalsDashboard } from '@/components/outgoing-subscriptions/UpcomingRenewalsDashboard'
import { UpcomingRenewalsCalendar } from '@/components/outgoing-subscriptions/UpcomingRenewalsCalendar'
import { OutgoingSubscriptionAlert } from '@/components/outgoing-subscriptions/OutgoingSubscriptionAlert'
import { OutgoingSubscriptionAnalytics } from '@/components/outgoing-subscriptions/OutgoingSubscriptionAnalytics'
import { Button } from '@/components/ui/button'
import { LayoutGrid, Table, Calendar, BarChart3 } from 'lucide-react'

const OutgoingSubscriptionsPage = () => {
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'calendar' | 'analytics'>('table')

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold">Suscripciones Pagadas</h1>
            <p className="text-muted-foreground">Gestiona todos los gastos recurrentes de tu empresa</p>
          </div>
          <OutgoingSubscriptionAlert size="lg" />
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
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="rounded-[8px]"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendario
          </Button>
          <Button
            variant={viewMode === 'analytics' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('analytics')}
            className="rounded-[8px]"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analítica
          </Button>
        </div>
      </div>

      <OutgoingSubscriptionStats />
      
      {/* Dashboard de próximas renovaciones */}
      <UpcomingRenewalsDashboard />
      
      {viewMode === 'table' ? (
        <OutgoingSubscriptionsTable />
      ) : viewMode === 'calendar' ? (
        <UpcomingRenewalsCalendar />
      ) : viewMode === 'analytics' ? (
        <OutgoingSubscriptionAnalytics />
      ) : (
        <OutgoingSubscriptionsList />
      )}
    </div>
  )
}

export default OutgoingSubscriptionsPage