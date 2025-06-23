
import React from 'react'
import { Label } from '@/components/ui/label'
import { PracticeAreaCard } from './PracticeAreaCard'
import { practiceAreasData } from '../data/practiceAreasData'

interface PracticeAreaSelectorProps {
  selectedArea: string
  onAreaSelect: (areaId: string) => void
}

export const PracticeAreaSelector: React.FC<PracticeAreaSelectorProps> = ({
  selectedArea,
  onAreaSelect
}) => {
  const practiceAreasArray = Object.values(practiceAreasData)

  return (
    <div>
      <Label className="text-base font-semibold text-gray-900">Área de Práctica</Label>
      <p className="text-sm text-gray-600 mb-4">
        Selecciona el área jurídica principal para esta propuesta
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {practiceAreasArray.map((area) => (
          <PracticeAreaCard
            key={area.id}
            area={area}
            isSelected={selectedArea === area.id}
            onSelect={onAreaSelect}
          />
        ))}
      </div>
    </div>
  )
}
