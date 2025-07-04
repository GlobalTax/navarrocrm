import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Calculator, Calendar } from 'lucide-react'
import { TemplateVariable } from '@/hooks/useDocumentTemplates'
import { CalculatedField } from './CalculatedField'

interface ValidatedFormFieldProps {
  variable: TemplateVariable
  value: any
  onChange: (value: any) => void
  validation?: { valid: boolean; message?: string }
  relatedData?: { cases: any[]; contacts: any[] }
}

export const ValidatedFormField = ({
  variable,
  value,
  onChange,
  validation,
  relatedData
}: ValidatedFormFieldProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isCalculated, setIsCalculated] = useState(false)

  useEffect(() => {
    // Generar sugerencias basadas en el tipo de variable
    generateSuggestions()
    
    // Verificar si es un campo calculado
    setIsCalculated(isCalculatedField(variable.name))
  }, [variable, relatedData])

  const generateSuggestions = () => {
    const suggestions: string[] = []

    if (variable.name.includes('lugar') || variable.name.includes('ciudad')) {
      suggestions.push('Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao')
    }

    if (variable.name.includes('juzgado')) {
      suggestions.push(
        'Juzgado de Primera Instancia nº 1 de Madrid',
        'Juzgado de lo Social nº 3 de Barcelona',
        'Juzgado de lo Penal nº 2 de Valencia'
      )
    }

    if (variable.name.includes('materia') || variable.name.includes('area')) {
      suggestions.push(
        'Derecho Civil',
        'Derecho Laboral',
        'Derecho Penal',
        'Derecho Mercantil',
        'Derecho Administrativo'
      )
    }

    setSuggestions(suggestions.slice(0, 3))
  }

  const isCalculatedField = (fieldName: string) => {
    const calculatedFields = [
      'total', 'subtotal', 'iva_calculado', 'fecha_vencimiento',
      'fecha_notificacion', 'fecha_limite', 'interes_demora'
    ]
    return calculatedFields.some(calc => fieldName.includes(calc))
  }

  const getFieldIcon = () => {
    if (isCalculated) return <Calculator className="h-4 w-4" />
    if (variable.type === 'date') return <Calendar className="h-4 w-4" />
    return null
  }

  const getValidationIcon = () => {
    if (!validation) return null
    return validation.valid ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-destructive" />
    )
  }

  const renderField = () => {
    // Campo calculado
    if (isCalculated) {
      return (
        <CalculatedField
          variable={variable}
          value={value}
          onChange={onChange}
        />
      )
    }

    // Campos normales según tipo
    switch (variable.type) {
      case 'text':
        if (variable.name.includes('descripcion') || variable.name.includes('observaciones')) {
          return (
            <Textarea
              id={variable.name}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              required={variable.required}
              placeholder={getPlaceholder()}
              className={validation && !validation.valid ? 'border-destructive' : ''}
              rows={3}
            />
          )
        }
        return (
          <Input
            id={variable.name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={variable.required}
            placeholder={getPlaceholder()}
            className={validation && !validation.valid ? 'border-destructive' : ''}
          />
        )

      case 'number':
        return (
          <Input
            id={variable.name}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={variable.required}
            placeholder={getPlaceholder()}
            className={validation && !validation.valid ? 'border-destructive' : ''}
            step={variable.name.includes('iva') ? '0.01' : '1'}
            min={variable.name.includes('cantidad') || variable.name.includes('importe') ? '0' : undefined}
          />
        )

      case 'date':
        return (
          <Input
            id={variable.name}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={variable.required}
            className={validation && !validation.valid ? 'border-destructive' : ''}
            min={variable.name.includes('vencimiento') ? new Date().toISOString().split('T')[0] : undefined}
          />
        )

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={variable.name}
              checked={value || false}
              onCheckedChange={onChange}
            />
            <Label htmlFor={variable.name} className="text-sm">
              {value ? 'Sí' : 'No'}
            </Label>
          </div>
        )

      case 'select':
        return (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className={validation && !validation.valid ? 'border-destructive' : ''}>
              <SelectValue placeholder={`Seleccionar ${variable.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {variable.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      default:
        return (
          <Input
            id={variable.name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={variable.required}
            placeholder={getPlaceholder()}
            className={validation && !validation.valid ? 'border-destructive' : ''}
          />
        )
    }
  }

  const getPlaceholder = () => {
    if (variable.name.includes('dni') || variable.name.includes('nif')) {
      return '12345678A'
    }
    if (variable.name.includes('email')) {
      return 'ejemplo@email.com'
    }
    if (variable.name.includes('telefono')) {
      return '+34 600 000 000'
    }
    if (variable.name.includes('importe') || variable.name.includes('precio')) {
      return '1000.00'
    }
    return `Introduzca ${variable.label.toLowerCase()}`
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={variable.name} className="flex items-center gap-2">
        {getFieldIcon()}
        {variable.label}
        {variable.required && <span className="text-destructive">*</span>}
        {isCalculated && (
          <Badge variant="secondary" className="text-xs">
            Calculado
          </Badge>
        )}
        {getValidationIcon()}
      </Label>

      {renderField()}

      {/* Mensaje de validación */}
      {validation && !validation.valid && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {validation.message}
        </p>
      )}

      {/* Sugerencias */}
      {suggestions.length > 0 && !value && (
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-muted-foreground">Sugerencias:</span>
          {suggestions.map((suggestion, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs cursor-pointer hover:bg-muted"
              onClick={() => onChange(suggestion)}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      )}

      {/* Información adicional para campos especiales */}
      {variable.name.includes('dni') && (
        <p className="text-xs text-muted-foreground">
          Formato: 8 dígitos + letra (ej: 12345678A)
        </p>
      )}
    </div>
  )
}