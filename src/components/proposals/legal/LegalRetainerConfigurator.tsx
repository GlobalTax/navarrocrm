
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Calendar, Euro } from 'lucide-react'

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5 text-blue-600" />
            Configuración Contractual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Configuración de facturación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>

          {/* Duración del contrato */}
          <div>
            <Label htmlFor="contract-duration">Duración del Contrato (meses)</Label>
            <Input
              id="contract-duration"
              type="number"
              value={config.contractDuration}
              onChange={(e) => updateConfig('contractDuration', Number(e.target.value))}
              placeholder="12"
              className="max-w-xs"
            />
          </div>

          {/* Renovación automática */}
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
