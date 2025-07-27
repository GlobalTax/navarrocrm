import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  Building2,
  Settings,
  CreditCard,
  AlertTriangle
} from 'lucide-react'
import { useOutgoingSubscriptions } from '@/hooks/useOutgoingSubscriptions'
import { OutgoingSubscriptionForm } from './OutgoingSubscriptionForm'
import { SUBSCRIPTION_CATEGORIES } from '@/types/outgoing-subscriptions'
import { format, parseISO, isWithinInterval, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

export const OutgoingSubscriptionsList = () => {
  const { subscriptions, isLoading, cancelSubscription, deleteSubscription } = useOutgoingSubscriptions()
  const [showForm, setShowForm] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SOFTWARE': return <Settings className="h-4 w-4" />
      case 'MARKETING': return <Building2 className="h-4 w-4" />
      case 'SERVICIOS_LEGALES': return <Building2 className="h-4 w-4" />
      case 'INFRAESTRUCTURA': return <Settings className="h-4 w-4" />
      case 'DISENO': return <Edit className="h-4 w-4" />
      case 'COMUNICACION': return <Building2 className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default'
      case 'CANCELLED': return 'secondary'
      default: return 'outline'
    }
  }

  const isRenewalSoon = (renewalDate: string) => {
    const renewal = parseISO(renewalDate)
    const today = new Date()
    const sevenDaysFromNow = addDays(today, 7)
    return isWithinInterval(renewal, { start: today, end: sevenDaysFromNow })
  }

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.provider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || subscription.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleEdit = (subscription: any) => {
    setEditingSubscription(subscription)
    setShowForm(true)
  }

  const handleCancel = async (subscriptionId: string) => {
    if (confirm('¿Estás seguro de que quieres cancelar esta suscripción?')) {
      await cancelSubscription.mutateAsync(subscriptionId)
    }
  }

  const handleDelete = async (subscriptionId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta suscripción? Esta acción no se puede deshacer.')) {
      await deleteSubscription.mutateAsync(subscriptionId)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  if (showForm) {
    return (
      <OutgoingSubscriptionForm
        subscription={editingSubscription}
        onClose={() => {
          setShowForm(false)
          setEditingSubscription(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold">Suscripciones Externas</h1>
          <p className="text-gray-600">Gestiona los gastos recurrentes de tu empresa</p>
        </div>
        
        <Button
          onClick={() => setShowForm(true)}
          className="bg-black text-white border-0.5 border-black rounded-[10px] hover:bg-gray-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Suscripción
        </Button>
      </div>

      {/* Filtros */}
      <Card className="bg-white border-0.5 border-black rounded-[10px] shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por proveedor o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-0.5 border-black rounded-[10px]"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48 border-0.5 border-black rounded-[10px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACTIVE">Activa</SelectItem>
                <SelectItem value="CANCELLED">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-48 border-0.5 border-black rounded-[10px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {SUBSCRIPTION_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de suscripciones */}
      {isLoading ? (
        <div className="text-center py-8">
          <p>Cargando suscripciones...</p>
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <Card className="bg-white border-0.5 border-black rounded-[10px] shadow-sm">
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No hay suscripciones</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No se encontraron suscripciones con los filtros aplicados'
                : 'Comienza agregando tu primera suscripción externa'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-black text-white border-0.5 border-black rounded-[10px] hover:bg-gray-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Suscripción
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSubscriptions.map((subscription) => (
            <Card 
              key={subscription.id} 
              className="bg-white border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getCategoryIcon(subscription.category)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{subscription.provider_name}</h3>
                          <Badge 
                            variant={getStatusColor(subscription.status)}
                            className="border-0.5 rounded-[10px]"
                          >
                            {subscription.status === 'ACTIVE' ? 'Activa' : 'Cancelada'}
                          </Badge>
                          {isRenewalSoon(subscription.next_renewal_date) && subscription.status === 'ACTIVE' && (
                            <Badge variant="destructive" className="border-0.5 rounded-[10px]">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Renovación próxima
                            </Badge>
                          )}
                        </div>
                        {subscription.description && (
                          <p className="text-gray-600 text-sm">{subscription.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(subscription.amount, subscription.currency)}
                            {subscription.billing_cycle === 'MONTHLY' ? '/mes' : '/año'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Próxima renovación: {format(parseISO(subscription.next_renewal_date), 'dd MMM yyyy', { locale: es })}
                          </span>
                          {subscription.payment_method && (
                            <span className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              {subscription.payment_method}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(subscription)}
                      className="border-0.5 border-black rounded-[10px] hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {subscription.status === 'ACTIVE' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(subscription.id)}
                        className="border-0.5 border-orange-500 text-orange-600 rounded-[10px] hover:bg-orange-50"
                      >
                        Cancelar
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(subscription.id)}
                      className="border-0.5 border-red-500 text-red-600 rounded-[10px] hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}