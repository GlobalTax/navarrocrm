import { useState, useEffect } from 'react'
import { useContacts } from '@/hooks/useContacts'

export interface Prospect {
  id: string
  name: string
  email?: string
  sector: string
  score: number
  stage: string
  lastContact: string
  estimatedValue: number
  source: string
}

export interface OnboardingAnalytics {
  conversionRate: number
  avgCompletionTime: number
  predictionAccuracy: number
  totalProspects: number
  hotProspects: number
}

export const useIntelligentOnboarding = () => {
  const { contacts } = useContacts()
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [analytics, setAnalytics] = useState<OnboardingAnalytics>({
    conversionRate: 78,
    avgCompletionTime: 24,
    predictionAccuracy: 89,
    totalProspects: 0,
    hotProspects: 0
  })

  // Convertir contactos en prospectos con scoring IA
  useEffect(() => {
    const processedProspects: Prospect[] = contacts
      .filter(contact => contact.relationship_type === 'prospecto')
      .map(contact => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        sector: contact.business_sector || 'General',
        score: calculateAIScore(contact),
        stage: determineStage(contact),
        lastContact: contact.last_contact_date || contact.created_at,
        estimatedValue: estimateValue(contact),
        source: contact.how_found_us || 'Directo'
      }))

    setProspects(processedProspects)
    
    // Actualizar analytics
    setAnalytics(prev => ({
      ...prev,
      totalProspects: processedProspects.length,
      hotProspects: processedProspects.filter(p => p.score > 80).length
    }))
  }, [contacts])

  // Algoritmo de scoring IA simplificado
  const calculateAIScore = (contact: any): number => {
    let score = 50 // Base score

    // Factores que aumentan el score
    if (contact.email) score += 15
    if (contact.phone) score += 10
    if (contact.business_sector) score += 10
    if (contact.client_type === 'empresa') score += 5
    if (contact.dni_nif) score += 10

    // Factor temporal
    const daysSinceCreation = contact.created_at ? 
      Math.floor((Date.now() - new Date(contact.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 30
    
    if (daysSinceCreation < 7) score += 10
    else if (daysSinceCreation < 30) score += 5
    else if (daysSinceCreation > 90) score -= 10

    // Factor de contacto reciente
    if (contact.last_contact_date) {
      const daysSinceContact = Math.floor((Date.now() - new Date(contact.last_contact_date).getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceContact < 7) score += 15
      else if (daysSinceContact > 30) score -= 10
    }

    return Math.min(Math.max(score, 0), 100)
  }

  const determineStage = (contact: any): string => {
    const score = calculateAIScore(contact)
    if (score > 80) return 'Hot Lead'
    if (score > 60) return 'Warm Lead'
    if (score > 40) return 'Cold Lead'
    return 'Nuevo'
  }

  const estimateValue = (contact: any): number => {
    // Estimación simple basada en tipo de cliente y sector
    let baseValue = 1500 // Valor base

    if (contact.client_type === 'empresa') {
      baseValue *= 2.5 // Las empresas suelen tener mayor valor
    }

    // Multiplicadores por sector
    const sectorMultipliers: Record<string, number> = {
      'tecnologia': 1.8,
      'construccion': 1.5,
      'inmobiliario': 1.7,
      'finanzas': 2.0,
      'general': 1.0
    }

    const sector = contact.business_sector?.toLowerCase() || 'general'
    const multiplier = sectorMultipliers[sector] || 1.0

    return Math.round(baseValue * multiplier)
  }

  const createJourney = (prospectId: string, journeyType: string) => {
    // Lógica para crear un journey personalizado
    console.log(`Creating ${journeyType} journey for prospect ${prospectId}`)
    
    // Aquí se integraría con el motor de journeys
    return {
      id: `journey_${prospectId}_${Date.now()}`,
      prospectId,
      type: journeyType,
      steps: [], // Se generarían basándose en el tipo
      createdAt: new Date().toISOString()
    }
  }

  const processProspect = async (prospectId: string, action: string) => {
    // Lógica para procesar acciones sobre prospectos
    console.log(`Processing ${action} for prospect ${prospectId}`)
    
    // Simular procesamiento
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ success: true, action, prospectId })
      }, 1000)
    })
  }

  return {
    prospects,
    analytics,
    createJourney,
    processProspect,
    isProcessing: false,
    // Funciones adicionales que se pueden implementar
    generateInsights: () => {
      return prospects.map(p => ({
        prospectId: p.id,
        insight: `${p.name} tiene ${p.score}% probabilidad de conversión`,
        recommendation: p.score > 80 ? 'Contactar inmediatamente' : 'Nutrir con contenido'
      }))
    },
    getTopProspects: (limit = 5) => {
      return prospects
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
    }
  }
}