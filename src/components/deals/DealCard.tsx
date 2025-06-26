
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Calendar, Euro, User, AlertTriangle } from 'lucide-react'
import { Deal } from '@/types/deals'

interface DealCardProps {
  deal: Deal
}

export const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getDealTypeColor = (type: string) => {
    switch (type) {
      case 'acquisition': return 'bg-blue-100 text-blue-800'
      case 'sale': return 'bg-green-100 text-green-800'
      case 'merger': return 'bg-purple-100 text-purple-800'
      case 'joint_venture': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDealTypeLabel = (type: string) => {
    switch (type) {
      case 'acquisition': return 'Adquisición'
      case 'sale': return 'Venta'
      case 'merger': return 'Fusión'
      case 'joint_venture': return 'Joint Venture'
      default: return type
    }
  }

  const isOverdue = new Date(deal.expected_close_date) < new Date()

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header con nombre y tipo */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm leading-tight">{deal.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{deal.company_name}</p>
            </div>
            <Badge className={`text-xs ${getDealTypeColor(deal.deal_type)}`}>
              {getDealTypeLabel(deal.deal_type)}
            </Badge>
          </div>

          {/* Valor y probabilidad */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm font-medium">
              <Euro className="w-3 h-3" />
              {formatCurrency(deal.value)}
            </div>
            <div className="text-xs text-muted-foreground">
              {deal.probability}% prob.
            </div>
          </div>

          {/* Fecha de cierre */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Cierre: {formatDate(deal.expected_close_date)}</span>
            {isOverdue && <AlertTriangle className="w-3 h-3 text-red-500" />}
          </div>

          {/* Asignado a */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{deal.assigned_to}</span>
          </div>

          {/* Due Diligence status si aplica */}
          {deal.stage === 'due_diligence' && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-xs">
                <span>Due Diligence:</span>
                <Badge variant={
                  deal.dd_status === 'completed' ? 'default' :
                  deal.dd_status === 'in_progress' ? 'secondary' :
                  deal.dd_status === 'issues_found' ? 'destructive' : 'outline'
                }>
                  {deal.dd_status === 'in_progress' ? 'En Progreso' :
                   deal.dd_status === 'completed' ? 'Completado' :
                   deal.dd_status === 'issues_found' ? 'Issues' : 'Pendiente'}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
