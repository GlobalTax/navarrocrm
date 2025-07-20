
import { useState, useEffect } from 'react'
import { useLogger } from './useLogger'
import { ActiveCase, TeamMember } from '@/types/interfaces'

export const useCollaborationHub = () => {
  const logger = useLogger('useCollaborationHub')
  
  const [activeCases, setActiveCases] = useState<ActiveCase[]>([
    {
      id: '1',
      title: 'Caso Laboral - Despido Improcedente',
      clientName: 'María González',
      clientType: 'particular',
      status: 'activo',
      unreadCount: 3
    },
    {
      id: '2', 
      title: 'Constitución Sociedad Limitada',
      clientName: 'Tech Solutions SL',
      clientType: 'empresa',
      status: 'pendiente',
      unreadCount: 1
    }
  ])

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Ana Martínez',
      role: 'Partner',
      status: 'online',
      avatar: 'AM'
    },
    {
      id: '2',
      name: 'Carlos López', 
      role: 'Senior Associate',
      status: 'busy',
      avatar: 'CL'
    }
  ])

  const shareDocument = (caseId: string, document: { id: string; name: string; type: string }): void => {
    logger.info('Compartiendo documento', { 
      metadata: { 
        caseId, 
        documentId: document.id,
        documentName: document.name,
        documentType: document.type
      }
    })
    
    // Implementar lógica de compartir documento
  }

  const updateCaseStatus = (caseId: string, newStatus: ActiveCase['status']): void => {
    setActiveCases(prev => 
      prev.map(case_ => 
        case_.id === caseId 
          ? { ...case_, status: newStatus }
          : case_
      )
    )
  }

  const updateMemberStatus = (memberId: string, newStatus: TeamMember['status']): void => {
    setTeamMembers(prev =>
      prev.map(member =>
        member.id === memberId
          ? { ...member, status: newStatus }
          : member
      )
    )
  }

  return {
    activeCases,
    teamMembers,
    shareDocument,
    updateCaseStatus,
    updateMemberStatus
  }
}
