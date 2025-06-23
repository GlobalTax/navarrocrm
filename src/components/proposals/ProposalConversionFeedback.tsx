
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ArrowRight, DollarSign, Repeat } from 'lucide-react'

interface ProposalConversionFeedbackProps {
  proposalTitle: string
  clientName: string
  recurringAmount: number
  frequency: string
  onViewRecurringFee: () => void
}

export const ProposalConversionFeedback: React.FC<ProposalConversionFeedbackProps> = ({
  proposalTitle,
  clientName,
  recurringAmount,
  frequency,
  onViewRecurringFee
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getFrequencyText = (freq: string) => {
    switch (freq) {
      case 'monthly': return 'mensual'
      case 'quarterly': return 'trimestral'
      case 'yearly': return 'anual'
      default: return freq
    }
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="font-semibold text-green-800">
                ¡Propuesta Convertida Exitosamente!
              </h4>
              <p className="text-sm text-green-700">
                La propuesta se ha convertido automáticamente en cuota recurrente
              </p>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Badge variant="outline" className="bg-white">
                {proposalTitle}
              </Badge>
              <ArrowRight className="h-4 w-4 text-green-600" />
              <Badge variant="outline" className="bg-white">
                Cliente: {clientName}
              </Badge>
              <ArrowRight className="h-4 w-4 text-green-600" />
              <Badge className="bg-green-600 text-white flex items-center gap-1">
                <Repeat className="h-3 w-3" />
                Cuota Recurrente
              </Badge>
            </div>

            <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium">{formatCurrency(recurringAmount)}</span>
                <span className="text-sm text-gray-600">/ {getFrequencyText(frequency)}</span>
              </div>
              
              <button
                onClick={onViewRecurringFee}
                className="ml-auto text-sm text-green-700 hover:text-green-800 font-medium"
              >
                Ver en Cuotas Recurrentes →
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
