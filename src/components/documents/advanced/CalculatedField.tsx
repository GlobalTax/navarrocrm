import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calculator, RefreshCw } from 'lucide-react'
import { TemplateVariable } from '@/hooks/useDocumentTemplates'

interface CalculatedFieldProps {
  variable: TemplateVariable
  value: any
  onChange: (value: any) => void
}

export const CalculatedField = ({
  variable,
  value,
  onChange
}: CalculatedFieldProps) => {
  const [isManual, setIsManual] = useState(false)
  const [calculatedValue, setCalculatedValue] = useState('')

  useEffect(() => {
    if (!isManual) {
      const calculated = calculateValue()
      setCalculatedValue(calculated)
      onChange(calculated)
    }
  }, [variable, isManual])

  const calculateValue = (): string => {
    const fieldName = variable.name.toLowerCase()

    // Cálculo de fechas
    if (fieldName.includes('vencimiento')) {
      const today = new Date()
      const daysToAdd = fieldName.includes('pago') ? 30 : 15 // 30 días para pagos, 15 para otros
      const vencimiento = new Date(today.getTime() + (daysToAdd * 24 * 60 * 60 * 1000))
      return vencimiento.toISOString().split('T')[0]
    }

    if (fieldName.includes('notificacion')) {
      const today = new Date()
      const notificacion = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000)) // 3 días
      return notificacion.toISOString().split('T')[0]
    }

    // Cálculos financieros
    if (fieldName.includes('iva')) {
      // Buscar base imponible en el contexto (esto sería más sofisticado en la implementación real)
      return '21' // IVA general español
    }

    if (fieldName.includes('total') && fieldName.includes('iva')) {
      // Esto requeriría acceso a otros campos del formulario
      return '1210.00' // Ejemplo: 1000 + 21% IVA
    }

    if (fieldName.includes('interes') && fieldName.includes('demora')) {
      // Interés de demora legal en España
      return '8.00' // 8% anual
    }

    // Números de referencia automáticos
    if (fieldName.includes('numero') || fieldName.includes('referencia')) {
      const year = new Date().getFullYear()
      const month = String(new Date().getMonth() + 1).padStart(2, '0')
      const day = String(new Date().getDate()).padStart(2, '0')
      const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
      return `${year}${month}${day}-${random}`
    }

    return ''
  }

  const handleManualToggle = () => {
    setIsManual(!isManual)
    if (isManual) {
      // Volver al modo automático
      const calculated = calculateValue()
      setCalculatedValue(calculated)
      onChange(calculated)
    }
  }

  const recalculate = () => {
    const calculated = calculateValue()
    setCalculatedValue(calculated)
    onChange(calculated)
  }

  const getCalculationExplanation = () => {
    const fieldName = variable.name.toLowerCase()

    if (fieldName.includes('vencimiento')) {
      return 'Fecha actual + 30 días (pagos) o 15 días (otros)'
    }
    if (fieldName.includes('iva')) {
      return 'IVA general español (21%)'
    }
    if (fieldName.includes('interes')) {
      return 'Interés legal de demora vigente'
    }
    if (fieldName.includes('numero')) {
      return 'Generado automáticamente: AAAAMMDD-XXX'
    }
    return 'Calculado automáticamente'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Input
            value={isManual ? value || '' : calculatedValue}
            onChange={(e) => isManual && onChange(e.target.value)}
            disabled={!isManual}
            className={`${!isManual ? 'bg-muted/50' : ''}`}
          />
          {!isManual && (
            <Calculator className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleManualToggle}
          className="px-3"
        >
          {isManual ? 'Auto' : 'Manual'}
        </Button>
        
        {!isManual && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={recalculate}
            className="px-3"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {isManual ? 'Manual' : 'Automático'}
        </Badge>
        
        {!isManual && (
          <span className="text-xs text-muted-foreground">
            {getCalculationExplanation()}
          </span>
        )}
      </div>

      {/* Ayuda contextual para cálculos específicos */}
      {variable.name.includes('iva') && (
        <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
          <strong>Tipos de IVA en España:</strong>
          <br />• General: 21% • Reducido: 10% • Superreducido: 4%
        </div>
      )}

      {variable.name.includes('interes') && (
        <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
          <strong>Interés de demora:</strong> Tipo legal vigente según BOE
        </div>
      )}
    </div>
  )
}