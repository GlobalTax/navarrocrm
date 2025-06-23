
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Mic, FileText, Clock, Shield, TrendingUp } from 'lucide-react'

interface AITool {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado'
  timeToUse: string
  usedBy: number
  category: string
  isPopular?: boolean
  component: React.ComponentType
  useCases: string[]
}

interface AdvancedAIWorkPanelProps {
  aiTools: AITool[]
}

export const AdvancedAIWorkPanel = React.memo<AdvancedAIWorkPanelProps>(({ aiTools }) => {
  return (
    <Tabs defaultValue="voice" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="voice" className="flex items-center gap-2">
          <Mic className="h-4 w-4" />
          <span className="hidden sm:inline">Voz</span>
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Documentos</span>
        </TabsTrigger>
        <TabsTrigger value="time" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Tiempo</span>
        </TabsTrigger>
        <TabsTrigger value="compliance" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Compliance</span>
        </TabsTrigger>
        <TabsTrigger value="business" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span className="hidden sm:inline">Business</span>
        </TabsTrigger>
      </TabsList>

      {aiTools.map((tool) => (
        <TabsContent key={tool.id} value={tool.id} className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <tool.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{tool.title}</h2>
                <p className="text-gray-600">{tool.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="outline">{tool.difficulty}</Badge>
              <Badge variant="secondary">{tool.category}</Badge>
              <span className="text-sm text-gray-600">⏱️ {tool.timeToUse} para dominar</span>
              <span className="text-sm text-gray-600">👥 {tool.usedBy} usuarios activos</span>
            </div>
          </div>
          
          <tool.component />
        </TabsContent>
      ))}
    </Tabs>
  )
})

AdvancedAIWorkPanel.displayName = 'AdvancedAIWorkPanel'
