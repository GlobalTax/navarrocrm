
import React from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { PredictiveAnalyticsDashboard } from '@/components/analytics/PredictiveAnalyticsDashboard'
import { Brain } from 'lucide-react'

const PredictiveAnalytics = () => {
  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Analytics Predictivo"
        description="Insights inteligentes y análisis avanzado basado en IA para optimizar tu despacho"
        icon={<Brain className="h-6 w-6" />}
      />
      
      <PredictiveAnalyticsDashboard />
    </StandardPageContainer>
  )
}

export default PredictiveAnalytics
