
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, RefreshCw } from 'lucide-react'
import { useIntegrationTests } from './test-panel/useIntegrationTests'
import { TestResultCard } from './test-panel/TestResultCard'
import { TestRecommendations } from './test-panel/TestRecommendations'

export const IntegrationTestPanel = () => {
  const { isRunning, testResults, runAllTests } = useIntegrationTests()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Panel de Testing de Integraciones
          </CardTitle>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Ejecutando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Ejecutar Tests
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="results" className="w-full">
          <TabsList>
            <TabsTrigger value="results">Resultados</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="results" className="space-y-4">
            {testResults.length === 0 ? (
              <Alert>
                <AlertDescription>
                  Haz clic en "Ejecutar Tests" para verificar el estado de las integraciones.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <TestResultCard key={index} result={result} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-4">
            <TestRecommendations />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
