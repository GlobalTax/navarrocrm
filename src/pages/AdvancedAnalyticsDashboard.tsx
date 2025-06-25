
import React, { useState } from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RealTimeMetricsChart } from '@/components/analytics/RealTimeMetricsChart'
import { WebVitalsDisplay } from '@/components/analytics/WebVitalsDisplay'
import { ErrorAnalyticsPanel } from '@/components/analytics/ErrorAnalyticsPanel'
import { SessionAnalyticsTimeline } from '@/components/analytics/SessionAnalyticsTimeline'
import { AnalyticsFilters } from '@/components/analytics/AnalyticsFilters'
import { AnalyticsSection } from '@/components/analytics/AnalyticsSection'
import { useRealTimeAnalytics } from '@/hooks/analytics/useRealTimeAnalytics'
import { useCRMAnalytics } from '@/hooks/useCRMAnalytics'
import { DateRange } from 'react-day-picker'

export default function AdvancedAnalyticsDashboard() {
  const { refreshMetrics } = useRealTimeAnalytics()
  const crmAnalytics = useCRMAnalytics()
  
  // Filter state
  const [timeRange, setTimeRange] = useState('24h')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([])
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>([])
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [selectedErrorTypes, setSelectedErrorTypes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Available filter options (these would typically come from API)
  const eventTypes = ['navigation', 'interaction', 'conversion', 'error', 'performance']
  const userTypes = ['authenticated', 'anonymous', 'admin', 'partner']
  const pages = ['/dashboard', '/cases', '/contacts', '/proposals', '/analytics', '/tasks']
  const errorTypes = ['error', 'unhandledrejection', 'resource', 'network']

  const handleReset = () => {
    setTimeRange('24h')
    setDateRange(undefined)
    setSelectedEventTypes([])
    setSelectedUserTypes([])
    setSelectedPages([])
    setSelectedErrorTypes([])
  }

  const handleExport = async () => {
    setIsLoading(true)
    try {
      // Implement export functionality
      crmAnalytics.trackFeatureUsage('analytics', 'export_data', {
        timeRange,
        filters: {
          eventTypes: selectedEventTypes,
          userTypes: selectedUserTypes,
          pages: selectedPages,
          errorTypes: selectedErrorTypes
        }
      })
      
      // Here you would implement the actual export logic
      console.log('Exporting analytics data...')
      
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      await refreshMetrics()
      crmAnalytics.trackFeatureUsage('analytics', 'refresh_data')
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Track page view
  React.useEffect(() => {
    crmAnalytics.trackPageView('/advanced-analytics', 'Advanced Analytics Dashboard')
  }, [crmAnalytics])

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Dashboard Avanzado de Analytics"
        description="Sistema completo de análisis de datos, rendimiento y comportamiento de usuarios"
      />

      <div className="space-y-6">
        {/* Advanced Filters */}
        <AnalyticsFilters
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          eventTypes={eventTypes}
          selectedEventTypes={selectedEventTypes}
          onEventTypesChange={setSelectedEventTypes}
          userTypes={userTypes}
          selectedUserTypes={selectedUserTypes}
          onUserTypesChange={setSelectedUserTypes}
          pages={pages}
          selectedPages={selectedPages}
          onPagesChange={setSelectedPages}
          errorTypes={errorTypes}
          selectedErrorTypes={selectedErrorTypes}
          onErrorTypesChange={setSelectedErrorTypes}
          onReset={handleReset}
          onExport={handleExport}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* Advanced Analytics Tabs */}
        <Tabs defaultValue="realtime" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="realtime">Tiempo Real</TabsTrigger>
            <TabsTrigger value="performance">Web Vitals</TabsTrigger>
            <TabsTrigger value="errors">Errores</TabsTrigger>
            <TabsTrigger value="sessions">Sesiones</TabsTrigger>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
          </TabsList>

          <TabsContent value="realtime" className="space-y-6">
            <RealTimeMetricsChart />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <WebVitalsDisplay />
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <ErrorAnalyticsPanel />
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <SessionAnalyticsTimeline />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <AnalyticsSection />
          </TabsContent>
        </Tabs>
      </div>
    </StandardPageContainer>
  )
}
