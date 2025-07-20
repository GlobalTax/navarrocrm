
import type { ProposalData } from '@/types/interfaces'

export interface FormattedProposal {
  id: string
  title: string
  status: string
  statusColor: string
  clientName: string
  formattedDate: string
  formattedAmount?: string
}

export interface ProposalStatusInfo {
  label: string
  color: string
  bgColor: string
  icon: string
}

export const formatProposalStatus = (status: ProposalData['status']): ProposalStatusInfo => {
  const statusMap: Record<ProposalData['status'], ProposalStatusInfo> = {
    draft: {
      label: 'Borrador',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: 'edit'
    },
    sent: {
      label: 'Enviada',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: 'send'
    },
    accepted: {
      label: 'Aceptada',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: 'check'
    },
    rejected: {
      label: 'Rechazada',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: 'x'
    }
  }

  return statusMap[status]
}

export const formatProposalDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatProposalAmount = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export const formatProposalForDisplay = (proposal: ProposalData): FormattedProposal => {
  const statusInfo = formatProposalStatus(proposal.status)
  
  return {
    id: proposal.id,
    title: proposal.title,
    status: statusInfo.label,
    statusColor: statusInfo.color,
    clientName: proposal.client_id, // This would need to be resolved from client data
    formattedDate: formatProposalDate(proposal.created_at)
  }
}

export const getProposalProgressPercentage = (status: ProposalData['status']): number => {
  const progressMap: Record<ProposalData['status'], number> = {
    draft: 25,
    sent: 50,
    accepted: 100,
    rejected: 0
  }

  return progressMap[status]
}
