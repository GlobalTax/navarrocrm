
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { practiceAreasData } from '../data/practiceAreasData'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { useServiceCatalog } from '@/hooks/useServiceCatalog'

interface PracticeAreaSelectorProps {
  selectedArea: string
  onAreaSelect: (areaId: string) => void
}

export const PracticeAreaSelector: React.FC<PracticeAreaSelectorProps> = ({
  selectedArea,
  onAreaSelect
}) => {
  const { practiceAreas, isLoading: isLoadingAreas } = usePracticeAreas()
  const { services, isLoading: isLoadingServices } = useServiceCatalog()

  // Combinar datos estáticos con datos de la base de datos
  const availableAreas = React.useMemo(() => {
    // Empezar con las áreas estáticas
    const staticAreas = Object.values(practiceAreasData)
    
    // Si tenemos áreas de la base de datos, usar esas en su lugar cuando coincidan
    if (practiceAreas.length > 0) {
      return staticAreas.map(staticArea => {
        const dbArea = practiceAreas.find(area => 
          area.name.toLowerCase().includes(staticArea.name.toLowerCase().split(' ')[0]) ||
          staticArea.name.toLowerCase().includes(area.name.toLowerCase().split(' ')[0])
        )
        
        return {
          ...staticArea,
          // Usar datos de la DB si están disponibles
          name: dbArea?.name || staticArea.name,
          description: dbArea?.description || staticArea.description,
          // Contar servicios reales de la DB
          serviceCount: services.filter(service => 
            service.practice_area?.name === (dbArea?.name || staticArea.name)
          ).length || staticArea.services.length
        }
      })
    }
    
    return staticAreas.map(area => ({
      ...area,
      serviceCount: area.services.length
    }))
  }, [practiceAreas, services])

  if (isLoadingAreas || isLoadingServices) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Selecciona un Área de Práctica</h3>
        <Badge variant="outline">
          {availableAreas.length} áreas disponibles
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableAreas.map((area) => {
          const Icon = area.icon
          const isSelected = selectedArea === area.id
          
          return (
            <Card
              key={area.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-lg hover:-translate-y-1'
              }`}
              onClick={() => onAreaSelect(area.id)}
            >
              <CardContent className="p-4 relative">
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3 mb-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${area.color}15`, color: area.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm leading-tight">
                      {area.name}
                    </h4>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {area.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                    style={{ 
                      backgroundColor: `${area.color}10`, 
                      color: area.color,
                      border: `1px solid ${area.color}30`
                    }}
                  >
                    {area.serviceCount} servicios
                  </Badge>
                  
                  {isSelected && (
                    <Badge variant="default" className="text-xs bg-blue-500">
                      Seleccionada
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
