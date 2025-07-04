import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wand2, User, Building, FileText, Clock } from 'lucide-react'
import { DocumentTemplate } from '@/hooks/useDocumentTemplates'

interface SmartAutofillProps {
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
  currentStep: number
}

export const SmartAutofill = ({
  template,
  formData,
  onDataChange,
  cases,
  contacts,
  currentStep
}: SmartAutofillProps) => {
  const [suggestions, setSuggestions] = useState<{
    type: string
    label: string
    icon: any
    action: () => void
    variables: string[]
  }[]>([])

  useEffect(() => {
    generateSmartSuggestions()
  }, [formData, currentStep, cases, contacts])

  const generateSmartSuggestions = () => {
    const newSuggestions: any[] = []

    // Autocompletar desde caso seleccionado
    if (formData.caseId) {
      const selectedCase = cases.find(c => c.id === formData.caseId)
      if (selectedCase) {
        const caseVariables = getUnfilledCaseVariables(selectedCase)
        if (caseVariables.length > 0) {
          newSuggestions.push({
            type: 'case',
            label: `Completar desde expediente: ${selectedCase.matter_number}`,
            icon: FileText,
            action: () => autofillFromCase(selectedCase),
            variables: caseVariables
          })
        }
      }
    }

    // Autocompletar desde contacto seleccionado
    if (formData.contactId) {
      const selectedContact = contacts.find(c => c.id === formData.contactId)
      if (selectedContact) {
        const contactVariables = getUnfilledContactVariables(selectedContact)
        if (contactVariables.length > 0) {
          newSuggestions.push({
            type: 'contact',
            label: `Completar desde cliente: ${selectedContact.name}`,
            icon: User,
            action: () => autofillFromContact(selectedContact),
            variables: contactVariables
          })
        }
      }
    }

    // Autocompletar datos de organización
    const orgVariables = getUnfilledOrgVariables()
    if (orgVariables.length > 0) {
      newSuggestions.push({
        type: 'organization',
        label: 'Completar datos del despacho',
        icon: Building,
        action: () => autofillFromOrganization(),
        variables: orgVariables
      })
    }

    // Autocompletar fechas comunes
    const dateVariables = getUnfilledDateVariables()
    if (dateVariables.length > 0) {
      newSuggestions.push({
        type: 'dates',
        label: 'Completar fechas automáticas',
        icon: Clock,
        action: () => autofillCommonDates(),
        variables: dateVariables
      })
    }

    setSuggestions(newSuggestions)
  }

  const getUnfilledCaseVariables = (case_: any) => {
    return template.variables
      .filter(v => {
        const value = formData.variables[v.name]
        if (value && value !== '') return false
        
        return ['materia', 'expediente', 'numero_expediente', 'asunto', 'procedimiento']
          .some(pattern => v.name.includes(pattern))
      })
      .map(v => v.name)
  }

  const getUnfilledContactVariables = (contact: any) => {
    return template.variables
      .filter(v => {
        const value = formData.variables[v.name]
        if (value && value !== '') return false
        
        return ['nombre', 'cliente', 'destinatario', 'dni', 'nif', 'direccion', 'email', 'telefono']
          .some(pattern => v.name.includes(pattern))
      })
      .map(v => v.name)
  }

  const getUnfilledOrgVariables = () => {
    return template.variables
      .filter(v => {
        const value = formData.variables[v.name]
        if (value && value !== '') return false
        
        return ['despacho', 'bufete', 'abogado', 'letrado', 'colegiado', 'direccion_despacho']
          .some(pattern => v.name.includes(pattern))
      })
      .map(v => v.name)
  }

  const getUnfilledDateVariables = () => {
    return template.variables
      .filter(v => {
        const value = formData.variables[v.name]
        if (value && value !== '') return false
        
        return v.type === 'date' || ['fecha', 'dia', 'vencimiento'].some(pattern => v.name.includes(pattern))
      })
      .map(v => v.name)
  }

  const autofillFromCase = (case_: any) => {
    const updates: Record<string, any> = {}
    
    template.variables.forEach(variable => {
      if (formData.variables[variable.name]) return // No sobrescribir campos ya completados
      
      switch (true) {
        case variable.name.includes('materia'):
          updates[variable.name] = case_.practice_area || ''
          break
        case variable.name.includes('expediente') || variable.name.includes('numero_expediente'):
          updates[variable.name] = case_.matter_number || ''
          break
        case variable.name.includes('asunto'):
          updates[variable.name] = case_.title || ''
          break
        case variable.name.includes('descripcion_caso'):
          updates[variable.name] = case_.description || ''
          break
      }
    })

    updateFormData(updates)
  }

  const autofillFromContact = (contact: any) => {
    const updates: Record<string, any> = {}
    
    template.variables.forEach(variable => {
      if (formData.variables[variable.name]) return
      
      switch (true) {
        case ['nombre_cliente', 'cliente', 'destinatario', 'nombre_destinatario'].includes(variable.name):
          updates[variable.name] = contact.name
          break
        case ['dni_cliente', 'dni', 'nif_cliente', 'nif'].includes(variable.name):
          updates[variable.name] = contact.dni_nif || ''
          break
        case ['direccion_cliente', 'direccion', 'domicilio'].includes(variable.name):
          const address = [
            contact.address_street,
            contact.address_city,
            contact.address_postal_code
          ].filter(Boolean).join(', ')
          updates[variable.name] = address
          break
        case ['email_cliente', 'email', 'correo'].includes(variable.name):
          updates[variable.name] = contact.email || ''
          break
        case ['telefono_cliente', 'telefono', 'movil'].includes(variable.name):
          updates[variable.name] = contact.phone || ''
          break
        case variable.name.includes('tipo_cliente'):
          updates[variable.name] = contact.client_type === 'empresa' ? 'Empresa' : 'Particular'
          break
      }
    })

    updateFormData(updates)
  }

  const autofillFromOrganization = () => {
    const updates: Record<string, any> = {}
    
    // Datos ficticios del despacho - en la implementación real vendría de la configuración
    const orgData = {
      name: 'Bufete Legal Ejemplo S.L.',
      address: 'Calle Gran Vía, 1, 28001 Madrid',
      phone: '+34 91 000 00 00',
      email: 'info@bufetejemplo.com',
      colegiado: 'ICAM 12345'
    }
    
    template.variables.forEach(variable => {
      if (formData.variables[variable.name]) return
      
      switch (true) {
        case ['despacho', 'bufete', 'empresa_legal'].includes(variable.name):
          updates[variable.name] = orgData.name
          break
        case variable.name.includes('direccion_despacho'):
          updates[variable.name] = orgData.address
          break
        case ['telefono_despacho', 'telefono_bufete'].includes(variable.name):
          updates[variable.name] = orgData.phone
          break
        case variable.name.includes('email_despacho'):
          updates[variable.name] = orgData.email
          break
        case variable.name.includes('colegiado'):
          updates[variable.name] = orgData.colegiado
          break
        case variable.name.includes('letrado') || variable.name.includes('abogado'):
          updates[variable.name] = 'María García López'
          break
      }
    })

    updateFormData(updates)
  }

  const autofillCommonDates = () => {
    const updates: Record<string, any> = {}
    const today = new Date()
    
    template.variables.forEach(variable => {
      if (formData.variables[variable.name]) return
      
      if (variable.type === 'date' || variable.name.includes('fecha')) {
        switch (true) {
          case variable.name.includes('firma') || variable.name.includes('suscripcion'):
            updates[variable.name] = today.toISOString().split('T')[0]
            break
          case variable.name.includes('vencimiento'):
            const vencimiento = new Date(today)
            vencimiento.setDate(vencimiento.getDate() + 30)
            updates[variable.name] = vencimiento.toISOString().split('T')[0]
            break
          case variable.name.includes('inicio'):
            updates[variable.name] = today.toISOString().split('T')[0]
            break
          case variable.name.includes('fin') || variable.name.includes('final'):
            const fin = new Date(today)
            fin.setFullYear(fin.getFullYear() + 1)
            updates[variable.name] = fin.toISOString().split('T')[0]
            break
        }
      }
    })

    updateFormData(updates)
  }

  const updateFormData = (updates: Record<string, any>) => {
    onDataChange({
      ...formData,
      variables: { ...formData.variables, ...updates }
    })
  }

  if (suggestions.length === 0) return null

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          Autocompletado Inteligente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border">
            <div className="flex items-center gap-3">
              <suggestion.icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{suggestion.label}</p>
                <div className="flex gap-1 mt-1">
                  {suggestion.variables.slice(0, 3).map((variable) => (
                    <Badge key={variable} variant="outline" className="text-xs">
                      {variable}
                    </Badge>
                  ))}
                  {suggestion.variables.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{suggestion.variables.length - 3} más
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={suggestion.action}
              className="gap-2"
            >
              <Wand2 className="h-3 w-3" />
              Aplicar
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}