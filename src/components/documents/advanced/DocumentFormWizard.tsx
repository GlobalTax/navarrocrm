import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronRight, ChevronLeft, AlertTriangle, CheckCircle } from 'lucide-react'
import { DocumentTemplate, TemplateVariable } from '@/hooks/useDocumentTemplates'
import { ValidatedFormField } from './ValidatedFormField'
import { SmartAutofill } from './SmartAutofill'
import { isValidEmail } from '@/lib/security'

interface DocumentFormWizardProps {
  template: DocumentTemplate
  formData: {
    title: string
    variables: Record<string, any>
    caseId: string
    contactId: string
  }
  onDataChange: (data: any) => void
  cases: any[]
  contacts: any[]
}

export const DocumentFormWizard = ({
  template,
  formData,
  onDataChange,
  cases,
  contacts
}: DocumentFormWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [validation, setValidation] = useState<Record<string, { valid: boolean; message?: string }>>({})
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  // Organizar variables en grupos lógicos
  const variableGroups = [
    {
      title: 'Información Básica',
      description: 'Datos fundamentales del documento',
      variables: template.variables.filter(v => 
        ['titulo', 'fecha', 'lugar', 'numero_documento'].includes(v.name) ||
        v.name.includes('basico') || v.name.includes('general')
      )
    },
    {
      title: 'Datos del Cliente',
      description: 'Información personal o empresarial',
      variables: template.variables.filter(v => 
        v.name.includes('cliente') || v.name.includes('destinatario') ||
        ['nombre', 'dni', 'nif', 'direccion', 'email', 'telefono'].includes(v.name)
      )
    },
    {
      title: 'Detalles Legales',
      description: 'Información específica del caso',
      variables: template.variables.filter(v => 
        v.name.includes('legal') || v.name.includes('materia') ||
        v.name.includes('procedimiento') || v.name.includes('juzgado')
      )
    },
    {
      title: 'Aspectos Económicos',
      description: 'Importes, honorarios y condiciones',
      variables: template.variables.filter(v => 
        v.name.includes('importe') || v.name.includes('precio') ||
        v.name.includes('honorario') || v.name.includes('iva') ||
        ['cantidad', 'total', 'subtotal'].includes(v.name)
      )
    }
  ].filter(group => group.variables.length > 0)

  // Si no hay grupos específicos, crear uno general
  const steps = variableGroups.length > 0 ? variableGroups : [{
    title: 'Variables del Documento',
    description: 'Complete todos los campos necesarios',
    variables: template.variables
  }]

  const totalSteps = steps.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  // Validar el paso actual
  useEffect(() => {
    const currentVariables = steps[currentStep]?.variables || []
    const newValidation: Record<string, { valid: boolean; message?: string }> = {}
    let stepValid = true

    currentVariables.forEach(variable => {
      const value = formData.variables[variable.name]
      const result = validateField(variable, value)
      newValidation[variable.name] = result
      if (!result.valid && variable.required) {
        stepValid = false
      }
    })

    setValidation(newValidation)

    // Marcar paso como completado si es válido
    if (stepValid) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
    } else {
      setCompletedSteps(prev => {
        const newSet = new Set(prev)
        newSet.delete(currentStep)
        return newSet
      })
    }
  }, [currentStep, formData.variables, steps])

  const validateField = (variable: TemplateVariable, value: any) => {
    if (variable.required && (!value || value === '')) {
      return { valid: false, message: 'Este campo es obligatorio' }
    }

    // Validaciones específicas por tipo
    switch (variable.type) {
      case 'number':
        if (value && isNaN(Number(value))) {
          return { valid: false, message: 'Debe ser un número válido' }
        }
        break
      case 'date':
        if (value && !isValidDate(value)) {
          return { valid: false, message: 'Fecha no válida' }
        }
        break
    }

    // Validaciones específicas por nombre de variable
    if (variable.name.includes('dni') || variable.name.includes('nif')) {
      if (value && !isValidDNI(value)) {
        return { valid: false, message: 'DNI/NIE no válido' }
      }
    }

    if (variable.name.includes('email')) {
      if (value && !isValidEmail(value)) {
        return { valid: false, message: 'Email no válido' }
      }
    }

    return { valid: true }
  }

  const isValidDate = (dateString: string) => {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  }

  const isValidDNI = (dni: string) => {
    const dniRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i
    return dniRegex.test(dni.replace(/[^a-zA-Z0-9]/g, ''))
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleVariableChange = (variableName: string, value: any) => {
    const updatedVariables = { ...formData.variables, [variableName]: value }
    onDataChange({ ...formData, variables: updatedVariables })
  }

  const canGoNext = () => {
    const currentVariables = steps[currentStep]?.variables || []
    return currentVariables.every(variable => {
      if (!variable.required) return true
      const value = formData.variables[variable.name]
      return value && value !== ''
    })
  }

  const nextStep = () => {
    if (currentStep < totalSteps - 1 && canGoNext()) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const currentStepData = steps[currentStep]

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Paso {currentStep + 1} de {totalSteps}</span>
          <span>{Math.round(progress)}% completado</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${
                index === currentStep
                  ? 'border-primary bg-primary text-primary-foreground'
                  : completedSteps.has(index)
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-muted-foreground bg-background text-muted-foreground'
              }`}
            >
              {completedSteps.has(index) ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                completedSteps.has(index) ? 'bg-green-500' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Autofill suggestions */}
      <SmartAutofill
        template={template}
        formData={formData}
        onDataChange={onDataChange}
        cases={cases}
        contacts={contacts}
        currentStep={currentStep}
      />

      {/* Current step content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStepData.title}
            {!canGoNext() && (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {currentStepData.description}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentStepData.variables.map((variable) => (
              <ValidatedFormField
                key={variable.name}
                variable={variable}
                value={formData.variables[variable.name] || ''}
                onChange={(value) => handleVariableChange(variable.name, value)}
                validation={validation[variable.name]}
                relatedData={{ cases, contacts }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <Button
          onClick={nextStep}
          disabled={currentStep === totalSteps - 1 || !canGoNext()}
          className="gap-2"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
