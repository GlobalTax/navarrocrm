import React, { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SubscriptionStats } from '@/components/subscriptions/SubscriptionStats'
import { SubscriptionsList } from '@/components/subscriptions/SubscriptionsList'
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useSubscriptions, useSubscriptionStats } from '@/hooks/useSubscriptions'

const SubscriptionsPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { subscriptions, isLoading } = useSubscriptions()
  const { data: stats } = useSubscriptionStats()

  // Filtrar suscripciones
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Suscripciones</h1>
            <p className="text-muted-foreground mt-2">
              Administra las suscripciones mensuales de tus clientes
            </p>
          </div>

          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nueva Suscripción
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nueva Suscripción</DialogTitle>
              </DialogHeader>
              <SubscriptionForm 
                onSuccess={() => setShowCreateForm(false)}
                onCancel={() => setShowCreateForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Estadísticas */}
        {stats && <SubscriptionStats stats={stats} />}

        {/* Filtros y búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle>Suscripciones Activas</CardTitle>
            <CardDescription>
              Lista completa de suscripciones de clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por cliente, plan o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="all">Todos los estados</option>
                  <option value="ACTIVE">Activas</option>
                  <option value="PAUSED">Pausadas</option>
                  <option value="CANCELED">Canceladas</option>
                  <option value="EXPIRED">Expiradas</option>
                </select>
              </div>
            </div>

            <SubscriptionsList 
              subscriptions={filteredSubscriptions}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SubscriptionsPage