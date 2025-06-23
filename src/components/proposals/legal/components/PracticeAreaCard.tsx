
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LegalPracticeArea } from '../data/practiceAreasData'

interface PracticeAreaCardProps {
  area: LegalPracticeArea
  isSelected: boolean
  onSelect: (areaId: string) => void
}

export const PracticeAreaCard: React.FC<PracticeAreaCardProps> = ({
  area,
  isSelected,
  onSelect
}) => {
  const Icon = area.icon

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected 
          ? area.color + ' shadow-md' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect(area.id)}
    >
      <CardContent className="p-4 text-center">
        <Icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
        <h3 className="font-medium text-sm">{area.name}</h3>
      </CardContent>
    </Card>
  )
}
