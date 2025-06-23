
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Clock, Euro, Calendar, AlertCircle } from 'lucide-react'

interface RetainerConfig {
  retainerAmount: number
  includedHours: number
  extraHourlyRate: number
  billingFrequency: 'monthly' | 'quarterly' | 'yearly'
  billingDay: number
  autoRenewal: boolean
  contractDuration: number // months
  paymentTerms: number // days
}

interface LegalRetainerConfiguratorProps {
  config: RetainerConfig
  onConfigChange: (config: RetainerConfig) => void
  estimatedMonthlyHours?: number
}

export const LegalRetainerConfigurator: React.FC<LegalRetainerConfiguratorProps> = ({
  config,
  onConfigChange,
  estimatedMonthlyHours = 0
}) => {
  const updateConfig = (field: keyof RetainerConfig, value: any) => {
    onConfigChange({ ...config, [field]: value })
  }

  const getEffectiveHourlyRate = () => {
    if (config.includedHours === 0) return 0
    return config.retainerAmount / config.includedHours
  }

  const getFrequencyMultiplier = () => {
    switch (config.billingFrequency) {
      case 'monthly': return 1
      case 'quarterly': return 3
      case 'yearly': return 12
      default: return 1
    }
  }

  const getTotalIncludedHours = () => {
    return config.includedHours * getFrequencyMultiplier()
  }

  const isHoursDeficient = estimatedMonthlyHours > 0 && 
    (estimatedMonthlyHours * getFrequencyMultiplier()) > getTotalIncludedHours()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5 text-blue-600" />
            Configuración de Honorarios Recurrentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Configuración básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="retainer-amount">Cuota Base (€)</Label>
              <Input
                id="retainer-amount"
                type="number"
                value={config.retainerAmount}
                onChange={(e) => updateConfig('retainerAmount', Number(e.target.value))}
                placeholder="500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Importe fijo {config.billingFrequency === 'monthly' ? 'mensual' : 
                config.billingFrequency === 'quarterly' ? 'trimestral' : 'anual'}
              </p>
            </div>

            <div>
              <Label htmlFor="billing-frequency">Frecuencia de Facturación</Label>
              <Select 
                value={config.billingFrequency} 
                onValueChange={(value: 'monthly' | 'quarterly' | 'yearly') => 
                  updateConfig('billingFrequency', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="included-hours">Horas Incluidas</Label>
              <Input
                id="included-hours"
                type="number"
                value={config.includedHours}
                onChange={(e) => updateConfig('includedHours', Number(e.target.value))}
                placeholder="10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Horas incluidas por período de facturación
              </p>
            </div>

            <div>
              <Label htmlFor="extra-hourly-rate">Tarifa Horas Extra (€/h)</Label>
              <Input
                id="extra-hourly-rate"
                type="number"
                value={config.extraHourlyRate}
                onChange={(e) => updateConfig('extraHourlyRate', Number(e.target.value))}
                placeholder="85"
              />
            </div>
          </div>

          {/* Análisis de tarifas */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Análisis de Tarifas
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-blue-600 font-medium">Tarifa Efectiva</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {getEffectiveHourlyRate().toFixed(0)}€/h
                  </p>
                </div>
                
                <div>
                  <p className="text-blue-600 font-medium">Horas Totales</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {getTotalIncludedHours()}h
                  </p>
                </div>
                
                <div>
                  <p className="text-blue-600 font-medium">Duración</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {getFrequencyMultiplier()} mes{getFrequencyMultiplier() > 1 ? 'es' : ''}
                  </p>
                </div>

                <div>
                  <p className="text-blue-600 font-medium">Extra/Hora</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {config.extraHourlyRate}€/h
                  </p>
                </div>
              </div>

              {isHoursDeficient && (
                <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Atención: Las horas estimadas ({estimatedMonthlyHours * getFrequencyMultiplier()}h) 
                      superan las incluidas ({getTotalIncludedHours()}h)
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuración de facturación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="billing-day">Día de Facturación</Label>
              <Select 
                value={config.billingDay.toString()} 
                onValueChange={(value) => updateConfig('billingDay', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                    <SelectItem key={day} value={day.toString()}>
                      Día {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment-terms">Plazo de Pago (días)</Label>
              <Select 
                value={config.paymentTerms.toString()} 
                onValueChange={(value) => updateConfig('paymentTerms', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 días</SelectItem>
                  <SelectItem value="15">15 días</SelectItem>
                  <SelectItem value="30">30 días</SelectItem>
                  <SelectItem value="60">60 días</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contract-duration">Duración Contrato (meses)</Label>
              <Input
                id="contract-duration"
                type="number"
                value={config.contractDuration}
                onChange={(e) => updateConfig('contractDuration', Number(e.target.value))}
                placeholder="12"
              />
            </div>
          </div>

          {/* Opciones avanzadas */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Renovación Automática</h4>
              <p className="text-sm text-gray-600">
                El contrato se renovará automáticamente al vencer
              </p>
            </div>
            <Switch
              checked={config.autoRenewal}
              onCheckedChange={(checked) => updateConfig('autoRenewal', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
