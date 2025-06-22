
import { ProposalSuggestion } from './types'

export const useProposalSuggestions = () => {
  const generateProposalSuggestions = async (clientId: string, caseType: string): Promise<ProposalSuggestion> => {
    const suggestions: Record<string, ProposalSuggestion> = {
      'fiscal': {
        services: ['Asesoramiento fiscal anual', 'Declaración de la renta', 'Planificación fiscal'],
        estimatedHours: 20,
        suggestedPrice: 1500
      },
      'laboral': {
        services: ['Asesoramiento laboral', 'Gestión de nóminas', 'Resolución de conflictos'],
        estimatedHours: 15,
        suggestedPrice: 1200
      },
      'mercantil': {
        services: ['Constitución de sociedades', 'Modificaciones societarias', 'Due diligence'],
        estimatedHours: 30,
        suggestedPrice: 2500
      }
    }

    return suggestions[caseType] || suggestions.fiscal
  }

  return {
    generateProposalSuggestions
  }
}
