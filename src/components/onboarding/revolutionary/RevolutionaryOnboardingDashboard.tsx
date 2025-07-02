import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  TrendingUp, 
  Target, 
  Clock, 
  Brain, 
  Zap, 
  Award,
  MessageCircle,
  FileCheck,
  BarChart3,
  Route,
  Sparkles
} from 'lucide-react'
import { LegalJourneyVisualizer } from './LegalJourneyVisualizer'
import { SmartFormEngine } from './SmartFormEngine'
import { PredictiveAnalyticsDashboard } from './PredictiveAnalyticsDashboard'
import { CollaborationCenter } from './CollaborationCenter'
import { useIntelligentOnboarding } from '@/hooks/useIntelligentOnboarding'

interface RevolutionaryOnboardingDashboardProps {
  onClose?: () => void
}

export const RevolutionaryOnboardingDashboard: React.FC<RevolutionaryOnboardingDashboardProps> = ({
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedProspect, setSelectedProspect] = useState<any>(null)
  
  const {
    prospects,
    analytics,
    createJourney,
    processProspect,
    isProcessing
  } = useIntelligentOnboarding()

  // Métricas principales
  const metrics = {
    totalProspects: prospects.length,
    hotProspects: prospects.filter(p => p.score > 80).length,
    conversionRate: analytics.conversionRate,
    avgOnboardingTime: analytics.avgCompletionTime,
    aiAccuracy: analytics.predictionAccuracy
  }

  const handleStartJourney = (prospect: any) => {
    setSelectedProspect(prospect)
    setActiveTab('journey')
  }

  const handleStartSmartForm = () => {
    setActiveTab('smart-form')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-blue-50 to-purple-50 p-6">
      {/* Header Revolucionario */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-primary to-blue-600 rounded-[15px] shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Sistema de Onboarding Revolucionario
              </h1>
              <p className="text-gray-600 mt-1">
                La experiencia de onboarding más avanzada del mundo legal
              </p>
            </div>
          </div>
          {onClose && (
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-0.5 border-black rounded-[10px]"
            >
              Cerrar
            </Button>
          )}
        </div>

        {/* Métricas de Alto Nivel */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <Card className="border-0.5 border-black rounded-[10px] bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{metrics.totalProspects}</div>
              <div className="text-xs text-gray-600">Prospectos Totales</div>
            </CardContent>
          </Card>

          <Card className="border-0.5 border-black rounded-[10px] bg-gradient-to-br from-orange-50 to-red-50">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{metrics.hotProspects}</div>
              <div className="text-xs text-gray-600">Hot Prospects</div>
            </CardContent>
          </Card>

          <Card className="border-0.5 border-black rounded-[10px] bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{metrics.conversionRate}%</div>
              <div className="text-xs text-gray-600">Conversión IA</div>
            </CardContent>
          </Card>

          <Card className="border-0.5 border-black rounded-[10px] bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{metrics.avgOnboardingTime}m</div>
              <div className="text-xs text-gray-600">Tiempo Promedio</div>
            </CardContent>
          </Card>

          <Card className="border-0.5 border-black rounded-[10px] bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-4 text-center">
              <Brain className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{metrics.aiAccuracy}%</div>
              <div className="text-xs text-gray-600">Precisión IA</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navegación Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="journey" className="flex items-center gap-2">
            <Route className="h-4 w-4" />
            Journey Legal
          </TabsTrigger>
          <TabsTrigger value="smart-form" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Formulario IA
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Colaboración
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics IA
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Principal */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline de Prospectos */}
            <Card className="border-0.5 border-black rounded-[10px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Pipeline de Conversión IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prospects.slice(0, 5).map((prospect, index) => (
                    <div 
                      key={prospect.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-[10px] hover-lift cursor-pointer"
                      onClick={() => handleStartJourney(prospect)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {prospect.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{prospect.name}</div>
                          <div className="text-sm text-gray-600">{prospect.sector}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={prospect.score > 80 ? "default" : "outline"}
                          className="border-0.5 border-black rounded-[10px]"
                        >
                          {prospect.score}% Score IA
                        </Badge>
                        <Button 
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-white border-0.5 border-black rounded-[10px]"
                        >
                          Iniciar Journey
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Acciones Rápidas */}
            <Card className="border-0.5 border-black rounded-[10px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleStartSmartForm}
                  className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white border-0.5 border-black rounded-[10px] p-6"
                >
                  <div className="flex items-center gap-3">
                    <Brain className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-bold">Formulario Inteligente IA</div>
                      <div className="text-sm opacity-90">Onboarding conversacional adaptativo</div>
                    </div>
                  </div>
                </Button>

                <Button 
                  variant="outline"
                  className="w-full border-0.5 border-black rounded-[10px] p-6 hover-lift"
                  onClick={() => setActiveTab('journey')}
                >
                  <div className="flex items-center gap-3">
                    <Route className="h-6 w-6 text-primary" />
                    <div className="text-left">
                      <div className="font-bold">Journey Visualizer</div>
                      <div className="text-sm text-gray-600">Roadmaps legales interactivos</div>
                    </div>
                  </div>
                </Button>

                <Button 
                  variant="outline"
                  className="w-full border-0.5 border-black rounded-[10px] p-6 hover-lift"
                  onClick={() => setActiveTab('analytics')}
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-6 w-6 text-primary" />
                    <div className="text-left">
                      <div className="font-bold">Analytics Predictivos</div>
                      <div className="text-sm text-gray-600">IA para predicción y optimización</div>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Progreso Global */}
          <Card className="border-0.5 border-black rounded-[10px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Progreso Global del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Conversión Prospectos</span>
                    <span className="text-sm text-gray-600">{metrics.conversionRate}%</span>
                  </div>
                  <Progress value={metrics.conversionRate} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Eficiencia IA</span>
                    <span className="text-sm text-gray-600">{metrics.aiAccuracy}%</span>
                  </div>
                  <Progress value={metrics.aiAccuracy} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Satisfacción Cliente</span>
                    <span className="text-sm text-gray-600">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journey Legal Visual */}
        <TabsContent value="journey">
          <LegalJourneyVisualizer 
            selectedProspect={selectedProspect}
            onProspectChange={setSelectedProspect}
          />
        </TabsContent>

        {/* Formulario Inteligente */}
        <TabsContent value="smart-form">
          <SmartFormEngine />
        </TabsContent>

        {/* Centro de Colaboración */}
        <TabsContent value="collaboration">
          <CollaborationCenter />
        </TabsContent>

        {/* Analytics Predictivos */}
        <TabsContent value="analytics">
          <PredictiveAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}