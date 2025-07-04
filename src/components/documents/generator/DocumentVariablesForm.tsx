import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DocumentVariable {
  name: string
  label: string
  type: string
  required: boolean
  options?: string[]
  description?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

interface DocumentVariablesFormProps {
  variables: DocumentVariable[]
  formData: Record<string, any>
  onVariableChange: (variableName: string, value: any) => void
  errors?: Record<string, string>
}

export const DocumentVariablesForm = ({
  variables,
  formData,
  onVariableChange,
  errors = {}
}: DocumentVariablesFormProps) => {
  const validateField = (variable: DocumentVariable, value: any): string | null => {
    if (variable.required && (!value || value === '')) {
      return `${variable.label} es obligatorio`
    }
    
    if (variable.validation) {
      const { min, max, pattern } = variable.validation
      
      if (variable.type === 'number') {
        const numValue = Number(value)
        if (min !== undefined && numValue < min) {
          return `${variable.label} debe ser mayor o igual a ${min}`
        }
        if (max !== undefined && numValue > max) {
          return `${variable.label} debe ser menor o igual a ${max}`
        }
      }
      
      if (pattern && value && !new RegExp(pattern).test(value)) {
        return `${variable.label} no tiene el formato correcto`
      }
    }
    
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Variables del Documento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {variables.map((variable) => {
            const error = errors[variable.name] || validateField(variable, formData[variable.name])
            
            return (
              <div key={variable.name} className="space-y-2">
                <Label htmlFor={variable.name} className="flex items-center gap-1">
                  {variable.label}
                  {variable.required && <span className="text-destructive">*</span>}
                </Label>
                
                {variable.description && (
                  <p className="text-xs text-muted-foreground">{variable.description}</p>
                )}
                
                {variable.type === 'text' && (
                  <Input
                    id={variable.name}
                    value={formData[variable.name] || ''}
                    onChange={(e) => onVariableChange(variable.name, e.target.value)}
                    required={variable.required}
                    className={error ? 'border-destructive' : ''}
                    placeholder={`Ingrese ${variable.label.toLowerCase()}...`}
                  />
                )}
                
                {variable.type === 'textarea' && (
                  <Textarea
                    id={variable.name}
                    value={formData[variable.name] || ''}
                    onChange={(e) => onVariableChange(variable.name, e.target.value)}
                    required={variable.required}
                    className={error ? 'border-destructive' : ''}
                    placeholder={`Ingrese ${variable.label.toLowerCase()}...`}
                    rows={3}
                  />
                )}
                
                {variable.type === 'number' && (
                  <Input
                    id={variable.name}
                    type="number"
                    value={formData[variable.name] || ''}
                    onChange={(e) => onVariableChange(variable.name, e.target.value)}
                    required={variable.required}
                    className={error ? 'border-destructive' : ''}
                    min={variable.validation?.min}
                    max={variable.validation?.max}
                  />
                )}
                
                {variable.type === 'date' && (
                  <Input
                    id={variable.name}
                    type="date"
                    value={formData[variable.name] || ''}
                    onChange={(e) => onVariableChange(variable.name, e.target.value)}
                    required={variable.required}
                    className={error ? 'border-destructive' : ''}
                  />
                )}
                
                {variable.type === 'boolean' && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData[variable.name] || false}
                      onCheckedChange={(checked) => onVariableChange(variable.name, checked)}
                    />
                    <span className="text-sm">{formData[variable.name] ? 'Sí' : 'No'}</span>
                  </div>
                )}

                {variable.type === 'select' && (
                  <Select
                    value={formData[variable.name] || ''}
                    onValueChange={(value) => onVariableChange(variable.name, value)}
                  >
                    <SelectTrigger className={error ? 'border-destructive' : ''}>
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
                )}

                {error && (
                  <Alert variant="destructive" className="py-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}