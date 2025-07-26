import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { documentsLogger } from '@/utils/logging'

// Tipos flexibles para compatibilidad temporal
interface DocumentTemplate {
  id: string
  name: string
  variables: DocumentVariable[]
}

interface DocumentVariable {
  name: string
  label: string
  required: boolean
  default_value?: string | number | boolean
}

interface DocumentFormData {
  title: string
  variables: Record<string, string | number | boolean>
  caseId: string
  contactId: string
  useAI: boolean
}

interface CaseData {
  id: string
  title: string
  case_number?: string
  client_id?: string
  case_type?: string
}

interface ContactData {
  id: string
  name: string
  dni_nif?: string | null
  address_street?: string | null
  email?: string | null
  phone?: string | null
  address_city?: string | null
}

interface UseDocumentFormProps {
  template: DocumentTemplate
  cases: CaseData[]
  contacts: ContactData[]
  onSubmit: (data: DocumentFormData) => Promise<void>
}

export const useDocumentForm = ({
  template,
  cases,
  contacts,
  onSubmit
}: UseDocumentFormProps) => {
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    variables: {},
    caseId: '',
    contactId: '',
    useAI: false
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form data when template changes
  useEffect(() => {
    if (template) {
      documentsLogger.info('Inicializando formulario de documento', { 
        templateId: template.id,
        templateName: template.name,
        variablesCount: template.variables.length 
      })
      
      const initialVariables: Record<string, string | number | boolean> = {}
      template.variables.forEach((variable: DocumentVariable) => {
        initialVariables[variable.name] = variable.default_value || ''
      })
      
      setFormData(prev => ({
        ...prev,
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        variables: initialVariables
      }))
    }
  }, [template])

  const updateFormData = useCallback((field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear errors for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  const updateVariable = useCallback((variableName: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      variables: {
        ...prev.variables,
        [variableName]: value
      }
    }))
    
    // Clear errors for this variable
    if (errors[variableName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[variableName]
        return newErrors
      })
    }
  }, [errors])

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio'
    }
    
    // Validate required variables
    template?.variables.forEach((variable: DocumentVariable) => {
      if (variable.required) {
        const value = formData.variables[variable.name]
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors[variable.name] = `${variable.label} es obligatorio`
        }
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, template])

  const autofillFromCase = useCallback((caseId: string) => {
    const selectedCase = cases.find(c => c.id === caseId)
    if (!selectedCase) {
      documentsLogger.warn('Caso no encontrado para autofill', { caseId })
      return
    }

    documentsLogger.info('Autocompletando desde caso', { 
      caseId,
      caseTitle: selectedCase.title 
    })

    const updates: Record<string, string> = {}
    template?.variables.forEach((variable: DocumentVariable) => {
      switch (variable.name) {
        case 'nombre_cliente':
        case 'cliente':
          if (selectedCase.client_id) {
            const contact = contacts.find(c => c.id === selectedCase.client_id)
            if (contact) updates[variable.name] = contact.name
          }
          break
        case 'materia_legal':
        case 'materia':
          updates[variable.name] = selectedCase.case_type || ''
          break
        case 'fecha_contrato':
        case 'fecha':
          updates[variable.name] = new Date().toISOString().split('T')[0]
          break
        case 'ciudad':
        case 'lugar':
          updates[variable.name] = 'Madrid' // Default
          break
        case 'numero_expediente':
        case 'expediente':
          updates[variable.name] = selectedCase.case_number || ''
          break
      }
    })
    
    setFormData(prev => ({
      ...prev,
      variables: { ...prev.variables, ...updates }
    }))
    
    if (Object.keys(updates).length > 0) {
      documentsLogger.info('Campos autocompletados desde caso', { 
        count: Object.keys(updates).length,
        fields: Object.keys(updates) 
      })
      toast.success(`Autocompletado ${Object.keys(updates).length} campos desde el expediente`)
    }
  }, [cases, contacts, template])

  const autofillFromContact = useCallback((contactId: string) => {
    const selectedContact = contacts.find(c => c.id === contactId)
    if (!selectedContact) {
      documentsLogger.warn('Contacto no encontrado para autofill', { contactId })
      return
    }

    documentsLogger.info('Autocompletando desde contacto', { 
      contactId,
      contactName: selectedContact.name 
    })

    const updates: Record<string, string> = {}
    template?.variables.forEach((variable: DocumentVariable) => {
      switch (variable.name) {
        case 'nombre_cliente':
        case 'cliente':
        case 'nombre_destinatario':
          updates[variable.name] = selectedContact.name
          break
        case 'dni_cliente':
        case 'dni':
          updates[variable.name] = selectedContact.dni_nif || ''
          break
        case 'direccion_cliente':
        case 'direccion':
          updates[variable.name] = selectedContact.address_street || ''
          break
        case 'email_cliente':
        case 'email':
          updates[variable.name] = selectedContact.email || ''
          break
        case 'telefono_cliente':
        case 'telefono':
          updates[variable.name] = selectedContact.phone || ''
          break
        case 'ciudad_cliente':
        case 'ciudad':
          updates[variable.name] = selectedContact.address_city || ''
          break
      }
    })
    
    setFormData(prev => ({
      ...prev,
      variables: { ...prev.variables, ...updates }
    }))
    
    if (Object.keys(updates).length > 0) {
      documentsLogger.info('Campos autocompletados desde contacto', { 
        count: Object.keys(updates).length,
        fields: Object.keys(updates) 
      })
      toast.success(`Autocompletado ${Object.keys(updates).length} campos desde el cliente`)
    }
  }, [contacts, template])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario')
      return
    }
    
    setIsSubmitting(true)
    try {
      documentsLogger.info('Enviando formulario de documento', { 
        templateId: template?.id,
        hasVariables: Object.keys(formData.variables).length > 0,
        useAI: formData.useAI 
      })
      await onSubmit(formData)
    } catch (error) {
      documentsLogger.error('Error enviando formulario', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        templateId: template?.id 
      })
      toast.error('Error al generar el documento')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, onSubmit])

  const resetForm = useCallback(() => {
    if (template) {
      documentsLogger.info('Reseteando formulario de documento', { 
        templateId: template.id 
      })
      
      const initialVariables: Record<string, string | number | boolean> = {}
      template.variables.forEach((variable: DocumentVariable) => {
        initialVariables[variable.name] = variable.default_value || ''
      })
      
      setFormData({
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        variables: initialVariables,
        caseId: '',
        contactId: '',
        useAI: false
      })
    }
    setErrors({})
  }, [template])

  return {
    formData,
    errors,
    isSubmitting,
    updateFormData,
    updateVariable,
    autofillFromCase,
    autofillFromContact,
    handleSubmit,
    resetForm,
    validateForm
  }
}