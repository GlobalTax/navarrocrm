
import React, { lazy } from 'react'
import { LazyChart } from './LazyChart'

const PerformanceChartComponent = lazy(() => 
  import('../dashboard/EnhancedPerformanceChart').then(module => ({
    default: module.EnhancedPerformanceChart
  }))
)

export const LazyPerformanceChart = () => {
  return (
    <LazyChart 
      title="Rendimiento Mensual" 
      height={200}
      fallbackHeight={200}
    >
      <PerformanceChartComponent />
    </LazyChart>
  )
}
