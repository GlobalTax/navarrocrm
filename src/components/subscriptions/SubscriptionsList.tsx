import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { MoreHorizontal, Edit, Ban, Trash2, Eye, DollarSign } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SubscriptionForm } from './SubscriptionForm'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import type { Subscription } from '@/types/subscriptions'

interface SubscriptionsListProps {
  subscriptions: Subscription[]
  isLoading: boolean
}

export const SubscriptionsList: React.FC<SubscriptionsListProps> = ({ 
  subscriptions, 
  isLoading 
}) => {
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  
  const { cancelSubscription, deleteSubscription, isCanceling, isDeleting } = useSubscriptions()

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      ACTIVE: { variant: 'default', className: 'bg-green-500 text-white' },
      PAUSED: { variant: 'secondary', className: 'bg-yellow-500 text-white' },
      CANCELED: { variant: 'destructive', className: 'bg-red-500 text-white' },
      EXPIRED: { variant: 'outline', className: 'bg-gray-500 text-white' }
    }
    
    const config = variants[status] || variants.ACTIVE
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const getBillingFrequencyText = (frequency: string) => {
    const texts: Record<string, string> = {
      monthly: 'Mensual',
      quarterly: 'Trimestral',
      yearly: 'Anual'
    }
    return texts[frequency] || frequency
  }

  const handleCancelSubscription = (subscription: Subscription) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta suscripción?')) {
      cancelSubscription.mutate(subscription.id)
    }
  }

  const handleDeleteSubscription = (subscription: Subscription) => {
    deleteSubscription.mutate(subscription.id)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-48"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </div>
              <div className="h-6 bg-muted rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold">No hay suscripciones</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Comienza creando tu primera suscripción.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{subscription.plan_name}</h3>
                    {getStatusBadge(subscription.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Cliente:</span> {subscription.contact?.name}
                      {subscription.contact?.email && (
                        <div className="text-xs">{subscription.contact.email}</div>
                      )}
                    </div>
                    
                    <div>
                      <span className="font-medium">Precio:</span> {formatCurrency(subscription.price)}
                      <div className="text-xs">{getBillingFrequencyText(subscription.billing_frequency)}</div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Próximo pago:</span> {formatDate(subscription.next_payment_due)}
                      <div className="text-xs">
                        Inicio: {formatDate(subscription.start_date)}
                      </div>
                    </div>
                  </div>

                  {subscription.notes && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium">Notas:</span> {subscription.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedSubscription(subscription)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingSubscription(subscription)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      {subscription.status === 'ACTIVE' && (
                        <DropdownMenuItem 
                          onClick={() => handleCancelSubscription(subscription)}
                          disabled={isCanceling}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Cancelar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente la suscripción. 
                              Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSubscription(subscription)}
                              disabled={isDeleting}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para editar suscripción */}
      <Dialog open={!!editingSubscription} onOpenChange={() => setEditingSubscription(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Suscripción</DialogTitle>
          </DialogHeader>
          {editingSubscription && (
            <SubscriptionForm
              subscription={editingSubscription}
              onSuccess={() => setEditingSubscription(null)}
              onCancel={() => setEditingSubscription(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para ver detalles */}
      <Dialog open={!!selectedSubscription} onOpenChange={() => setSelectedSubscription(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de Suscripción</DialogTitle>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Plan</label>
                  <p className="text-sm text-muted-foreground">{selectedSubscription.plan_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <div className="mt-1">{getStatusBadge(selectedSubscription.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Cliente</label>
                  <p className="text-sm text-muted-foreground">{selectedSubscription.contact?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Precio</label>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(selectedSubscription.price)} - {getBillingFrequencyText(selectedSubscription.billing_frequency)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Fecha de inicio</label>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedSubscription.start_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Próximo pago</label>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedSubscription.next_payment_due)}</p>
                </div>
              </div>
              
              {selectedSubscription.notes && (
                <div>
                  <label className="text-sm font-medium">Notas</label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedSubscription.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}