import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface DocumentTemplate {
  id: string
  org_id: string
  name: string
  description: string | null
  document_type: 'contract' | 'communication' | 'procedural'
  category: string | null
  practice_area: string | null
  template_content: string
  variables: TemplateVariable[]
  is_active: boolean
  is_ai_enhanced: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface TemplateVariable {
  name: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select'
  required: boolean
  label: string
  default?: string
  options?: string[] // para tipo select
}

export interface GeneratedDocument {
  id: string
  org_id: string
  template_id: string
  case_id: string | null
  contact_id: string | null
  title: string
  content: string
  variables_data: Record<string, any>
  file_path: string | null
  status: 'draft' | 'finalized' | 'sent'
  generated_by: string
  created_at: string
  updated_at: string
}

export const useDocumentTemplates = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const templatesQuery = useQuery({
    queryKey: ['document-templates', user?.org_id],
    queryFn: async (): Promise<DocumentTemplate[]> => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return (data || []).map(item => ({
        ...item,
        document_type: item.document_type as 'contract' | 'communication' | 'procedural',
        variables: Array.isArray(item.variables) ? item.variables as unknown as TemplateVariable[] : []
      }))
    },
    enabled: !!user?.org_id,
  })

  const generatedDocumentsQuery = useQuery({
    queryKey: ['generated-documents', user?.org_id],
    queryFn: async (): Promise<GeneratedDocument[]> => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(item => ({
        ...item,
        status: item.status as 'draft' | 'finalized' | 'sent',
        variables_data: typeof item.variables_data === 'object' ? item.variables_data as Record<string, any> : {}
      }))
    },
    enabled: !!user?.org_id,
  })

  const createTemplate = useMutation({
    mutationFn: async (template: Omit<DocumentTemplate, 'id' | 'org_id' | 'created_by' | 'created_at' | 'updated_at'>) => {
      if (!user?.org_id) throw new Error('No organization found')

      const { data, error } = await supabase
        .from('document_templates')
        .insert({
          ...template,
          org_id: user.org_id,
          created_by: user.id,
          variables: template.variables as any
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] })
      toast.success('Plantilla creada exitosamente')
    },
    onError: (error: any) => {
      toast.error('Error creando la plantilla: ' + error.message)
    },
  })

  const updateTemplate = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DocumentTemplate> }) => {
      const { data, error } = await supabase
        .from('document_templates')
        .update({
          ...updates,
          variables: updates.variables as any
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] })
      toast.success('Plantilla actualizada exitosamente')
    },
    onError: (error: any) => {
      toast.error('Error actualizando la plantilla: ' + error.message)
    },
  })

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('document_templates')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] })
      toast.success('Plantilla eliminada exitosamente')
    },
    onError: (error: any) => {
      toast.error('Error eliminando la plantilla: ' + error.message)
    },
  })

  const generateDocument = useMutation({
    mutationFn: async (params: {
      templateId: string
      title: string
      variablesData: Record<string, any>
      caseId?: string
      contactId?: string
    }) => {
      if (!user?.org_id) throw new Error('No organization found')

      // Obtener la plantilla
      const { data: template, error: templateError } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', params.templateId)
        .single()

      if (templateError) throw templateError

      // Reemplazar variables en el contenido
      let content = template.template_content
      Object.entries(params.variablesData).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        content = content.replace(regex, String(value))
      })

      // Guardar documento generado
      const { data, error } = await supabase
        .from('generated_documents')
        .insert({
          org_id: user.org_id,
          template_id: params.templateId,
          case_id: params.caseId || null,
          contact_id: params.contactId || null,
          title: params.title,
          content,
          variables_data: params.variablesData,
          generated_by: user.id
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-documents'] })
      toast.success('Documento generado exitosamente')
    },
    onError: (error: any) => {
      toast.error('Error generando el documento: ' + error.message)
    },
  })

  const updateDocumentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'draft' | 'finalized' | 'sent' }) => {
      const { data, error } = await supabase
        .from('generated_documents')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-documents'] })
      toast.success('Estado del documento actualizado')
    },
    onError: (error: any) => {
      toast.error('Error actualizando el estado: ' + error.message)
    },
  })

  const duplicateTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      if (!user?.org_id) throw new Error('No organization found')

      // Obtener la plantilla original
      const { data: originalTemplate, error: fetchError } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (fetchError) throw fetchError

      // Crear copia con nuevo nombre
      const { data, error } = await supabase
        .from('document_templates')
        .insert({
          org_id: user.org_id,
          created_by: user.id,
          name: `${originalTemplate.name} (Copia)`,
          description: originalTemplate.description,
          document_type: originalTemplate.document_type,
          category: originalTemplate.category,
          practice_area: originalTemplate.practice_area,
          template_content: originalTemplate.template_content,
          variables: originalTemplate.variables,
          is_ai_enhanced: originalTemplate.is_ai_enhanced
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] })
      toast.success('Plantilla duplicada exitosamente')
    },
    onError: (error: any) => {
      toast.error('Error duplicando la plantilla: ' + error.message)
    },
  })

  return {
    templates: templatesQuery.data || [],
    generatedDocuments: generatedDocumentsQuery.data || [],
    isLoading: templatesQuery.isLoading || generatedDocumentsQuery.isLoading,
    error: templatesQuery.error || generatedDocumentsQuery.error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    generateDocument,
    updateDocumentStatus,
    duplicateTemplate
  }
}