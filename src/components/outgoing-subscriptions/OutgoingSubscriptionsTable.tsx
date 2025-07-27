import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
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
  AlertTriangle,
  ArrowUpDown,
  Filter,
  X,
  MoreHorizontal,
  Users,
  FileText
} from 'lucide-react'
import { useOutgoingSubscriptions } from '@/hooks/useOutgoingSubscriptions'
import { useApp } from '@/contexts/AppContext'
import { OutgoingSubscriptionForm } from './OutgoingSubscriptionForm'
import { OutgoingSubscriptionDocuments } from './OutgoingSubscriptionDocuments'
import { SUBSCRIPTION_CATEGORIES } from '@/types/outgoing-subscriptions'
import { format, parseISO, isWithinInterval, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { OutgoingSubscription } from '@/types/outgoing-subscriptions'

export const OutgoingSubscriptionsTable = () => {
  const { user } = useApp()
  const { subscriptions, isLoading, cancelSubscription, deleteSubscription } = useOutgoingSubscriptions()
  const [showForm, setShowForm] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<OutgoingSubscription | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showDocuments, setShowDocuments] = useState<string | null>(null)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [responsibleFilter, setResponsibleFilter] = useState('all')
  const [amountRange, setAmountRange] = useState({ min: '', max: '' })
  const [showFilters, setShowFilters] = useState(false)
  
  // Ordenamiento
  const [sortBy, setSortBy] = useState<keyof OutgoingSubscription>('next_renewal_date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Tags helpers
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800 border-green-200 rounded-[10px]">Activa</Badge>
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 rounded-[10px]">Cancelada</Badge>
      default:
        return <Badge variant="outline" className="rounded-[10px]">{status}</Badge>
    }
  }

  const getBillingCycleTag = (cycle: string) => {
    switch (cycle) {
      case 'MONTHLY':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 rounded-[10px]">Mensual</Badge>
      case 'YEARLY':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200 rounded-[10px]">Anual</Badge>
      case 'OTHER':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200 rounded-[10px]">Otro</Badge>
      default:
        return <Badge variant="outline" className="rounded-[10px]">{cycle}</Badge>
    }
  }

  const getCategoryTag = (category: string) => {
    const categoryData = SUBSCRIPTION_CATEGORIES.find(c => c.value === category)
    const colors = {
      SOFTWARE: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      MARKETING: 'bg-pink-100 text-pink-800 border-pink-200',
      SERVICIOS_LEGALES: 'bg-amber-100 text-amber-800 border-amber-200',
      INFRAESTRUCTURA: 'bg-slate-100 text-slate-800 border-slate-200',
      DISENO: 'bg-rose-100 text-rose-800 border-rose-200',
      COMUNICACION: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      OTROS: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    
    return (
      <Badge className={`${colors[category as keyof typeof colors] || colors.OTROS} rounded-[10px]`}>
        {categoryData?.label || category}
      </Badge>
    )
  }

  const getPriceRangeTag = (amount: number) => {
    if (amount < 50) return <Badge className="bg-green-100 text-green-800 border-green-200 rounded-[10px]">Bajo</Badge>
    if (amount < 200) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 rounded-[10px]">Medio</Badge>
    return <Badge className="bg-red-100 text-red-800 border-red-200 rounded-[10px]">Alto</Badge>
  }

  // Función para obtener badge de urgencia
  const getRenewalUrgencyBadge = (renewalDate: string) => {
    const days = Math.ceil((new Date(renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (days <= 0) return { variant: 'destructive' as const, text: 'Vencido', icon: '🚨' }
    if (days <= 1) return { variant: 'destructive' as const, text: days === 0 ? 'Hoy' : 'Mañana', icon: '⚠️' }
    if (days <= 3) return { variant: 'secondary' as const, text: `${days} días`, icon: '⏰' }
    if (days <= 7) return { variant: 'outline' as const, text: `${days} días`, icon: '📅' }
    return { variant: 'outline' as const, text: `${days} días`, icon: '' }
  }

  // Filtrado y ordenamiento
  const filteredSubscriptions = useMemo(() => {
    let filtered = subscriptions.filter(subscription => {
      const matchesSearch = subscription.provider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           subscription.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || subscription.category === categoryFilter
      const matchesResponsible = responsibleFilter === 'all' || subscription.responsible_user_id === responsibleFilter
      const matchesAmountMin = !amountRange.min || subscription.amount >= parseFloat(amountRange.min)
      const matchesAmountMax = !amountRange.max || subscription.amount <= parseFloat(amountRange.max)
      
      return matchesSearch && matchesStatus && matchesCategory && matchesResponsible && 
             matchesAmountMin && matchesAmountMax
    })

    // Ordenamiento
    filtered.sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (aValue === bValue) return 0
      
      const comparison = aValue < bValue ? -1 : 1
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [subscriptions, searchTerm, statusFilter, categoryFilter, responsibleFilter, amountRange, sortBy, sortOrder])

  const handleSort = (field: keyof OutgoingSubscription) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleEdit = (subscription: OutgoingSubscription) => {
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

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setCategoryFilter('all')
    setResponsibleFilter('all')
    setAmountRange({ min: '', max: '' })
  }

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || 
                         responsibleFilter !== 'all' || amountRange.min || amountRange.max

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
      <Card className="bg-background border-0.5 border-border rounded-[10px] shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por proveedor o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0.5 border-border rounded-[10px]"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-0.5 border-border rounded-[10px]"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <Badge className="ml-2 bg-primary text-primary-foreground rounded-[6px] text-xs">
                    {[searchTerm, statusFilter !== 'all', categoryFilter !== 'all', 
                      responsibleFilter !== 'all', amountRange.min, amountRange.max]
                      .filter(Boolean).length}
                  </Badge>
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
            
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary text-primary-foreground border-0.5 border-primary rounded-[10px] hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Suscripción
            </Button>
          </div>

          {/* Filtros expandibles */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-0.5 border-border rounded-[10px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="ACTIVE">Activa</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="border-0.5 border-border rounded-[10px]">
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

              <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
                <SelectTrigger className="border-0.5 border-border rounded-[10px]">
                  <SelectValue placeholder="Responsable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los responsables</SelectItem>
                  <SelectItem value={user?.id || ''}>Yo</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input
                  placeholder="Min €"
                  type="number"
                  value={amountRange.min}
                  onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                  className="border-0.5 border-border rounded-[10px]"
                />
                <Input
                  placeholder="Max €"
                  type="number"
                  value={amountRange.max}
                  onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                  className="border-0.5 border-border rounded-[10px]"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card className="bg-background border-0.5 border-border rounded-[10px] shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8">
              <p>Cargando suscripciones...</p>
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No hay suscripciones</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? 'No se encontraron suscripciones con los filtros aplicados'
                  : 'Comienza agregando tu primera suscripción externa'
                }
              </p>
              {!hasActiveFilters && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-primary text-primary-foreground border-0.5 border-primary rounded-[10px] hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Suscripción
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedItems.length === filteredSubscriptions.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedItems(filteredSubscriptions.map(s => s.id))
                          } else {
                            setSelectedItems([])
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 rounded-[8px]"
                      onClick={() => handleSort('provider_name')}
                    >
                      <div className="flex items-center gap-2">
                        Proveedor
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 rounded-[8px]"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center gap-2">
                        Monto
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Frecuencia</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 rounded-[8px]"
                      onClick={() => handleSort('next_renewal_date')}
                    >
                      <div className="flex items-center gap-2">
                        Próxima Renovación
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow 
                      key={subscription.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(subscription.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedItems([...selectedItems, subscription.id])
                            } else {
                              setSelectedItems(selectedItems.filter(id => id !== subscription.id))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            {subscription.provider_name}
                            {subscription.next_renewal_date && subscription.status === 'ACTIVE' && (() => {
                              const urgencyBadge = getRenewalUrgencyBadge(subscription.next_renewal_date)
                              return (
                                <Badge 
                                  variant={urgencyBadge.variant}
                                  className="border-0.5 rounded-[10px] text-xs animate-pulse"
                                >
                                  {urgencyBadge.icon} {urgencyBadge.text}
                                </Badge>
                              )
                            })()}
                          </div>
                          {subscription.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {subscription.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusTag(subscription.status)}
                      </TableCell>
                      <TableCell>
                        {getCategoryTag(subscription.category)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatCurrency(subscription.amount, subscription.currency)}
                          </div>
                          <div className="flex gap-1">
                            {getPriceRangeTag(subscription.amount)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getBillingCycleTag(subscription.billing_cycle)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {format(parseISO(subscription.next_renewal_date), 'dd MMM yyyy', { locale: es })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Math.ceil((parseISO(subscription.next_renewal_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background border-0.5 border-border rounded-[10px]">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setShowDocuments(subscription.id)}
                              className="cursor-pointer"
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Ver Documentos
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(subscription as OutgoingSubscription)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {subscription.status === 'ACTIVE' && (
                              <DropdownMenuItem 
                                onClick={() => handleCancel(subscription.id)}
                                className="text-orange-600"
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(subscription.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Acciones masivas */}
          {selectedItems.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-muted/30 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {selectedItems.length} suscripción{selectedItems.length > 1 ? 'es' : ''} seleccionada{selectedItems.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItems([])}
                  className="border-0.5 border-border rounded-[10px]"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm(`¿Estás seguro de que quieres eliminar ${selectedItems.length} suscripción${selectedItems.length > 1 ? 'es' : ''}?`)) {
                      selectedItems.forEach(id => handleDelete(id))
                      setSelectedItems([])
                    }
                  }}
                  className="rounded-[10px]"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar seleccionadas
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de documentos */}
      {showDocuments && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[10px] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Documentos - {subscriptions?.find(s => s.id === showDocuments)?.provider_name}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDocuments(null)}
                  className="h-8 w-8 p-0 rounded-[6px]"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <OutgoingSubscriptionDocuments
                subscriptionId={showDocuments}
                subscriptionName={subscriptions?.find(s => s.id === showDocuments)?.provider_name || ''}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}