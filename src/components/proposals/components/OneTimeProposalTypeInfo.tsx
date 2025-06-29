
import React from 'react'
import { Badge } from '@/components/ui/badge'

interface OneTimeProposalTypeInfoProps {
  proposalType: string
}

export const OneTimeProposalTypeInfo: React.FC<OneTimeProposalTypeInfoProps> = ({
  proposalType
}) => {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project': return 'Proyecto'
      case 'service': return 'Servicio'
      default: return 'Consultoría'
    }
  }

  return (
    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
      {getTypeLabel(proposalType)}
    </Badge>
  )
}
