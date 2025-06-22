
import React from 'react'
import { IntelligentDashboard } from '@/components/ai/IntelligentDashboard'
import { SmartNotifications } from '@/components/ai/SmartNotifications'
import { ContextualAssistant } from '@/components/ai/ContextualAssistant'

const IntelligentDashboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IntelligentDashboard />
        </div>
        <div className="space-y-6">
          <ContextualAssistant />
          <SmartNotifications />
        </div>
      </div>
    </div>
  )
}

export default IntelligentDashboardPage
