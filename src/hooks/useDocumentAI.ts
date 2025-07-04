import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface DocumentAnalysis {
  id: string
  document_id: string
  analysis_type: 'content_quality' | 'consistency_check' | 'legal_review' | 'sentiment_analysis'
  findings: AIFinding[]
  suggestions: AISuggestion[]
  confidence_score: number
  analysis_data: Record<string, any>
  created_at: string
  org_id: string
}

export interface AIFinding {
  type: 'error' | 'warning' | 'info' | 'suggestion'
  category: string
  message: string
  line_number?: number
  confidence: number
  auto_fixable: boolean
}

export interface AISuggestion {
  type: 'content_improvement' | 'legal_compliance' | 'structure' | 'clarity'
  original_text: string
  suggested_text: string
  reason: string
  confidence: number
  position?: { start: number; end: number }
}

export interface DocumentEnhancement {
  enhanced_content: string
  improvements: Array<{
    type: string
    description: string
    original: string
    enhanced: string
  }>
  metadata: {
    enhancement_type: string
    processing_time: number
    ai_model: string
  }
}

export const useDocumentAI = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  // Analizar documento con IA
  const analyzeDocument = useMutation({
    mutationFn: async ({ documentId, analysisType }: { documentId: string; analysisType: string }) => {
      const { data, error } = await supabase.functions.invoke('analyze-document-ai', {
        body: { 
          documentId, 
          analysisType,
          orgId: user?.org_id 
        }
      })

      if (error) throw error
      return data as DocumentAnalysis
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['document-analysis'] })
      toast.success('Análisis completado exitosamente')
    },
    onError: (error: any) => {
      toast.error('Error en el análisis: ' + error.message)
    }
  })

  // Mejorar contenido con IA
  const enhanceContent = useMutation({
    mutationFn: async ({ 
      content, 
      documentType, 
      enhancementType,
      context = {}
    }: { 
      content: string
      documentType: string
      enhancementType: 'grammar' | 'clarity' | 'legal_language' | 'professional_tone'
      context?: Record<string, any>
    }) => {
      const { data, error } = await supabase.functions.invoke('enhance-document-content', {
        body: { 
          content, 
          documentType, 
          enhancementType,
          context,
          orgId: user?.org_id 
        }
      })

      if (error) throw error
      return data as DocumentEnhancement
    },
    onSuccess: () => {
      toast.success('Contenido mejorado exitosamente')
    },
    onError: (error: any) => {
      toast.error('Error mejorando el contenido: ' + error.message)
    }
  })

  // Generar contenido automáticamente
  const generateContent = useMutation({
    mutationFn: async ({ 
      prompt, 
      documentType, 
      templateId,
      variables = {},
      tone = 'professional'
    }: { 
      prompt: string
      documentType: string
      templateId?: string
      variables?: Record<string, any>
      tone?: 'professional' | 'formal' | 'friendly' | 'legal'
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-document-content', {
        body: { 
          prompt, 
          documentType, 
          templateId,
          variables,
          tone,
          orgId: user?.org_id 
        }
      })

      if (error) throw error
      return data as { content: string; metadata: Record<string, any> }
    },
    onSuccess: () => {
      toast.success('Contenido generado exitosamente')
    },
    onError: (error: any) => {
      toast.error('Error generando contenido: ' + error.message)
    }
  })

  // Obtener sugerencias en tiempo real
  const getSuggestions = useMutation({
    mutationFn: async ({ 
      text, 
      cursorPosition, 
      documentContext 
    }: { 
      text: string
      cursorPosition: number
      documentContext: Record<string, any>
    }) => {
      const { data, error } = await supabase.functions.invoke('get-content-suggestions', {
        body: { 
          text, 
          cursorPosition, 
          documentContext,
          orgId: user?.org_id 
        }
      })

      if (error) throw error
      return data as { suggestions: string[]; completions: string[] }
    }
  })

  // Detectar inconsistencias
  const detectInconsistencies = useMutation({
    mutationFn: async ({ 
      documentId, 
      referenceDocuments = []
    }: { 
      documentId: string
      referenceDocuments?: string[]
    }) => {
      const { data, error } = await supabase.functions.invoke('detect-inconsistencies', {
        body: { 
          documentId, 
          referenceDocuments,
          orgId: user?.org_id 
        }
      })

      if (error) throw error
      return data as { inconsistencies: AIFinding[]; confidence: number }
    },
    onSuccess: () => {
      toast.success('Análisis de consistencia completado')
    },
    onError: (error: any) => {
      toast.error('Error detectando inconsistencias: ' + error.message)
    }
  })

  // Obtener análisis de un documento
  const analysisQuery = useQuery({
    queryKey: ['document-analysis', user?.org_id],
    queryFn: async (): Promise<DocumentAnalysis[]> => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('document_analysis')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(item => ({
        ...item,
        analysis_type: item.analysis_type as 'content_quality' | 'consistency_check' | 'legal_review' | 'sentiment_analysis',
        findings: Array.isArray(item.findings) ? item.findings as unknown as AIFinding[] : [],
        suggestions: Array.isArray(item.suggestions) ? item.suggestions as unknown as AISuggestion[] : [],
        analysis_data: typeof item.analysis_data === 'object' ? item.analysis_data as Record<string, any> : {}
      }))
    },
    enabled: !!user?.org_id,
  })

  // Auto-aplicar sugerencias
  const applySuggestion = useMutation({
    mutationFn: async ({ 
      documentId, 
      suggestionId, 
      suggestion 
    }: { 
      documentId: string
      suggestionId: string
      suggestion: AISuggestion
    }) => {
      // Obtener el documento actual
      const { data: doc, error: docError } = await supabase
        .from('generated_documents')
        .select('content')
        .eq('id', documentId)
        .single()

      if (docError) throw docError

      // Aplicar la sugerencia
      let newContent = doc.content
      if (suggestion.position) {
        newContent = 
          newContent.slice(0, suggestion.position.start) +
          suggestion.suggested_text +
          newContent.slice(suggestion.position.end)
      } else {
        newContent = newContent.replace(suggestion.original_text, suggestion.suggested_text)
      }

      // Actualizar el documento
      const { error: updateError } = await supabase
        .from('generated_documents')
        .update({ content: newContent })
        .eq('id', documentId)

      if (updateError) throw updateError

      return { newContent }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-documents'] })
      toast.success('Sugerencia aplicada exitosamente')
    },
    onError: (error: any) => {
      toast.error('Error aplicando sugerencia: ' + error.message)
    }
  })

  return {
    // Análisis
    analyzeDocument,
    analysis: analysisQuery.data || [],
    isAnalyzing: analyzeDocument.isPending,
    
    // Mejora de contenido
    enhanceContent,
    isEnhancing: enhanceContent.isPending,
    
    // Generación de contenido
    generateContent,
    isGenerating: generateContent.isPending,
    
    // Sugerencias en tiempo real
    getSuggestions,
    isGettingSuggestions: getSuggestions.isPending,
    
    // Detección de inconsistencias
    detectInconsistencies,
    isDetectingInconsistencies: detectInconsistencies.isPending,
    
    // Aplicar sugerencias
    applySuggestion,
    isApplyingSuggestion: applySuggestion.isPending,
    
    // Estado general
    isLoading: analysisQuery.isLoading,
    error: analysisQuery.error
  }
}