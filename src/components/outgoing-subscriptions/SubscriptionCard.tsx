import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  Building2,
  Settings,
  CreditCard,
  AlertTriangle,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useSubscriptionAssignments } from '@/hooks/useSubscriptionAssignments'
import { LicenseManagement } from './LicenseManagement'
import { format, parseISO, isWithinInterval, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import type { OutgoingSubscription } from '@/types/outgoing-subscriptions'

interface SubscriptionCardProps {
  subscription: OutgoingSubscription
  onEdit: (subscription: OutgoingSubscription) => void
  onCancel: (subscriptionId: string) => void
  onDelete: (subscriptionId: string) => void
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onEdit,
  onCancel,
  onDelete
}) => {
  const [showLicenseManagement, setShowLicenseManagement] = useState(false)
  const { assignments } = useSubscriptionAssignments(subscription.id)

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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatSubscriptionDetails = () => {
    const quantity = subscription.quantity || 1
    const unitDesc = subscription.unit_description || 'unidad'
    const unitPrice = subscription.amount
    const totalPrice = quantity * unitPrice
    
    if (quantity === 1) {
      return {
        displayText: `${formatCurrency(unitPrice, subscription.currency)}`,
        detailText: null
      }
    } else {
      return {
        displayText: `${formatCurrency(totalPrice, subscription.currency)}`,
        detailText: `${quantity} ${unitDesc} × ${formatCurrency(unitPrice, subscription.currency)}`
      }
    }
  }

  const activeAssignments = assignments.filter(a => a.status === 'active')
  const licenseUtilization = subscription.quantity > 0 ? (activeAssignments.length / subscription.quantity) * 100 : 0

  const getLicenseStatusColor = () => {
    if (licenseUtilization >= 100) return 'bg-destructive'
    if (licenseUtilization >= 80) return 'bg-warning'
    return 'bg-success'
  }

  return (
    <Card className="bg-white border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {getCategoryIcon(subscription.category)}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
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
                  {/* License status badge */}
                  {subscription.quantity > 1 && (
                    <Badge variant="outline" className="border-0.5 rounded-[10px]">
                      <Users className="h-3 w-3 mr-1" />
                      {activeAssignments.length}/{subscription.quantity} licencias
                    </Badge>
                  )}
                </div>
                {subscription.description && (
                  <p className="text-gray-600 text-sm">{subscription.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <div className="flex flex-col">
                      <span>
                        {formatSubscriptionDetails().displayText}
                        {subscription.billing_cycle === 'MONTHLY' ? '/mes' : '/año'}
                      </span>
                      {formatSubscriptionDetails().detailText && (
                        <span className="text-xs text-gray-400">
                          {formatSubscriptionDetails().detailText}
                        </span>
                      )}
                    </div>
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

                {/* License utilization bar for multi-license subscriptions */}
                {subscription.quantity > 1 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Utilización de licencias</span>
                      <span>{Math.round(licenseUtilization)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${getLicenseStatusColor()}`}
                        style={{ width: `${licenseUtilization}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(subscription)}
                className="border-0.5 border-black rounded-[10px] hover:bg-gray-50"
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              {subscription.status === 'ACTIVE' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(subscription.id)}
                  className="border-0.5 border-orange-500 text-orange-600 rounded-[10px] hover:bg-orange-50"
                >
                  Cancelar
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(subscription.id)}
                className="border-0.5 border-red-500 text-red-600 rounded-[10px] hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* License management toggle for multi-license subscriptions */}
            {subscription.quantity > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLicenseManagement(!showLicenseManagement)}
                className="border-0.5 border-blue-500 text-blue-600 rounded-[10px] hover:bg-blue-50"
              >
                <Users className="h-4 w-4 mr-1" />
                Gestionar Licencias
                {showLicenseManagement ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </Button>
            )}
          </div>
        </div>

        {/* License Management Panel */}
        {showLicenseManagement && subscription.quantity > 1 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <LicenseManagement subscription={subscription} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}