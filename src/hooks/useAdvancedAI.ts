
import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useToast } from '@/hooks/use-toast'

export interface AIAnalysisResult {
  type: 'document_analysis' | 'time_optimization' | 'compliance_check' | 'business_intelligence'
  result: any
  confidence: number
  suggestions: string[]
}

export const useAdvancedAI = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { user } = useApp()
  const { toast } = useToast()

  const analyzeDocument = useCallback(async (file: File, analysisType: string) => {
    if (!user?.org_id) return null

    setIsAnalyzing(true)
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      const { data, error } = await supabase.functions.invoke('advanced-ai-analysis', {
        body: {
          file: base64,
          analysisType,
          fileName: file.name,
          fileType: file.type,
          orgId: user.org_id
        }
      })

      if (error) throw error

      return data as AIAnalysisResult
    } catch (error) {
      console.error('Error analyzing document:', error)
      toast({
        title: 'Error',
        description: 'No se pudo analizar el documento',
        variant: 'destructive'
      })
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }, [user?.org_id, toast])

  const optimizeSchedule = useCallback(async () => {
    if (!user?.org_id) return null

    setIsAnalyzing(true)
    try {
      const { data, error } = await supabase.functions.invoke('schedule-optimizer', {
        body: {
          orgId: user.org_id,
          userId: user.id
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error optimizing schedule:', error)
      toast({
        title: 'Error',
        description: 'No se pudo optimizar la agenda',
        variant: 'destructive'
      })
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }, [user?.org_id, user?.id, toast])

  const checkCompliance = useCallback(async (caseId?: string) => {
    if (!user?.org_id) return null

    setIsAnalyzing(true)
    try {
      const { data, error } = await supabase.functions.invoke('compliance-checker', {
        body: {
          orgId: user.org_id,
          caseId,
          checkType: 'full_audit'
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error checking compliance:', error)
      toast({
        title: 'Error',
        description: 'No se pudo realizar la auditoría de compliance',
        variant: 'destructive'
      })
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }, [user?.org_id, toast])

  const generateBusinessInsights = useCallback(async (period: string = 'month') => {
    if (!user?.org_id) return null

    setIsAnalyzing(true)
    try {
      const { data, error } = await supabase.functions.invoke('business-intelligence', {
        body: {
          orgId: user.org_id,
          period,
          analysisType: 'comprehensive'
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error generating business insights:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron generar los insights de negocio',
        variant: 'destructive'
      })
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }, [user?.org_id, toast])

  return {
    isAnalyzing,
    analyzeDocument,
    optimizeSchedule,
    checkCompliance,
    generateBusinessInsights
  }
}
