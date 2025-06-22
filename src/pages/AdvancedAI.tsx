
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { VoiceAssistant } from '@/components/ai/VoiceAssistant'
import { DocumentAnalyzer } from '@/components/ai/DocumentAnalyzer'
import { TimeOptimizer } from '@/components/ai/TimeOptimizer'
import { ComplianceMonitor } from '@/components/ai/ComplianceMonitor'
import { BusinessIntelligence } from '@/components/ai/BusinessIntelligence'
import { Brain, Mic, FileText, Clock, Shield, TrendingUp } from 'lucide-react'

const AdvancedAI = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IA Avanzada</h1>
          <p className="text-gray-600">
            Herramientas de inteligencia artificial para optimizar tu despacho
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Powered by AI
        </Badge>
      </div>

      <Tabs defaultValue="voice" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Voz
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Tiempo
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Business
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Asistente de Voz Inteligente
              </CardTitle>
              <CardDescription>
                Controla tu despacho con comandos de voz. Crea tareas, busca expedientes, programa citas y más.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoiceAssistant />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Analizador de Documentos IA
              </CardTitle>
              <CardDescription>
                Extrae datos automáticamente, detecta cláusulas problemáticas y clasifica documentos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentAnalyzer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Optimizador de Tiempo IA
              </CardTitle>
              <CardDescription>
                Analiza tus patrones de trabajo y optimiza tu agenda para máxima productividad.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TimeOptimizer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Monitor de Compliance IA
              </CardTitle>
              <CardDescription>
                Monitoreo automático de compliance, detección de riesgos y alertas de vencimientos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComplianceMonitor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Business Intelligence IA
              </CardTitle>
              <CardDescription>
                Análisis predictivo, identificación de oportunidades y insights de negocio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessIntelligence />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdvancedAI
