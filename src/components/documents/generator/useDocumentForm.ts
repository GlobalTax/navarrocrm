
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { 
  DocumentFormData, 
  DocumentTemplate, 
  CaseData, 
  ContactData 
} from '@/types/documents'

interface UseDocumentFormProps {
  template: DocumentTemplate | null
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
      const initialVariables: Record<string, any> = {}
      template.variables.forEach((variable) => {
        initialVariables[variable.name] = variable.default || ''
      })
      
      setFormData(prev => ({
        ...prev,
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        variables: initialVariables
      }))
    }
  }, [template])

  const updateFormData = useCallback((field: keyof DocumentFormData, value: any) => {
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

  const updateVariable = useCallback((variableName: string, value: any) => {
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
    template?.variables.forEach((variable) => {
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
    if (!selectedCase) return

    const updates: Record<string, any> = {}
    template?.variables.forEach((variable) => {
      switch (variable.name) {
        case 'nombre_cliente':
        case 'cliente':
          if (selectedCase.contact_id) {
            const contact = contacts.find(c => c.id === selectedCase.contact_id)
            if (contact) updates[variable.name] = contact.name
          }
          break
        case 'materia_legal':
        case 'materia':
          updates[variable.name] = selectedCase.practice_area || ''
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
          updates[variable.name] = selectedCase.matter_number || ''
          break
      }
    })
    
    setFormData(prev => ({
      ...prev,
      variables: { ...prev.variables, ...updates }
    }))
    
    if (Object.keys(updates).length > 0) {
      toast.success(`Autocompletado ${Object.keys(updates).length} campos desde el expediente`)
    }
  }, [cases, contacts, template])

  const autofillFromContact = useCallback((contactId: string) => {
    const selectedContact = contacts.find(c => c.id === contactId)
    if (!selectedContact) return

    const updates: Record<string, any> = {}
    template?.variables.forEach((variable) => {
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
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Error al generar el documento')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, onSubmit])

  const resetForm = useCallback(() => {
    if (template) {
      const initialVariables: Record<string, any> = {}
      template.variables.forEach((variable) => {
        initialVariables[variable.name] = variable.default || ''
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
