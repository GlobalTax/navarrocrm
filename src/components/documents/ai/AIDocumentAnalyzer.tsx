import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Lightbulb,
  Wand2,
  RefreshCw,
  TrendingUp,
  FileText,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { useDocumentAI, DocumentAnalysis, AIFinding, AISuggestion } from '@/hooks/useDocumentAI'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface AIDocumentAnalyzerProps {
  documentId: string
  documentContent: string
  onContentUpdate?: (newContent: string) => void
}

export const AIDocumentAnalyzer = ({
  documentId,
  documentContent,
  onContentUpdate
}: AIDocumentAnalyzerProps) => {
  const { 
    analyzeDocument, 
    isAnalyzing, 
    applySuggestion, 
    isApplyingSuggestion,
    analysis 
  } = useDocumentAI()
  
  const [activeAnalysis, setActiveAnalysis] = useState<DocumentAnalysis | null>(null)
  const [selectedTab, setSelectedTab] = useState('overview')

  const runAnalysis = async (analysisType: string) => {
    try {
      const result = await analyzeDocument.mutateAsync({ documentId, analysisType })
      setActiveAnalysis(result)
      setSelectedTab('findings')
    } catch (error) {
      console.error('Error running analysis:', error)
    }
  }

  const handleApplySuggestion = async (suggestion: AISuggestion) => {
    try {
      const result = await applySuggestion.mutateAsync({
        documentId,
        suggestionId: suggestion.original_text,
        suggestion
      })
      if (onContentUpdate && result.newContent) {
        onContentUpdate(result.newContent)
      }
    } catch (error) {
      console.error('Error applying suggestion:', error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />
      case 'info':
        return <Info className="h-4 w-4 text-primary" />
      case 'suggestion':
        return <Lightbulb className="h-4 w-4 text-primary" />
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-destructive/10 text-destructive-foreground border-destructive/20'
      case 'warning':
        return 'bg-warning/10 text-warning-foreground border-warning/20'
      case 'info':
        return 'bg-primary/10 text-primary-foreground border-primary/20'
      case 'suggestion':
        return 'bg-success/10 text-success-foreground border-success/20'
      default:
        return 'bg-muted/50 text-muted-foreground border-muted'
    }
  }

  const currentAnalysis = activeAnalysis || analysis[0]

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Asistente IA para Documentos
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => runAnalysis('content_quality')}
            disabled={isAnalyzing}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Calidad
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => runAnalysis('legal_review')}
            disabled={isAnalyzing}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Legal
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => runAnalysis('consistency_check')}
            disabled={isAnalyzing}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Consistencia
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => runAnalysis('sentiment_analysis')}
            disabled={isAnalyzing}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Tono
          </Button>
        </div>

        {isAnalyzing && (
          <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm">Analizando documento con IA...</span>
          </div>
        )}

        {currentAnalysis && (
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="findings">Hallazgos</TabsTrigger>
              <TabsTrigger value="suggestions">Sugerencias</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Puntuación de Confianza</span>
                  <Badge variant="outline">
                    {Math.round(currentAnalysis.confidence_score * 100)}%
                  </Badge>
                </div>
                <Progress value={currentAnalysis.confidence_score * 100} className="h-2" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Hallazgos:</span>
                    <div className="font-medium">{currentAnalysis.findings.length}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sugerencias:</span>
                    <div className="font-medium">{currentAnalysis.suggestions.length}</div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Analizado {formatDistanceToNow(new Date(currentAnalysis.created_at), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="findings" className="space-y-4">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {currentAnalysis.findings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No se encontraron problemas</p>
                    </div>
                  ) : (
                    currentAnalysis.findings.map((finding, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded-lg bg-muted/30 border"
                      >
                        <div className="flex items-start gap-3">
                          {getIcon(finding.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getTypeColor(finding.type)}`}
                              >
                                {finding.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(finding.confidence * 100)}% confianza
                              </span>
                            </div>
                            <p className="text-sm text-foreground/90">
                              {finding.message}
                            </p>
                            {finding.auto_fixable && (
                              <Badge variant="secondary" className="text-xs mt-2">
                                Auto-reparable
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {currentAnalysis.suggestions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wand2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No hay sugerencias disponibles</p>
                    </div>
                  ) : (
                    currentAnalysis.suggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded-lg bg-muted/30 border space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {suggestion.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(suggestion.confidence * 100)}% confianza
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Original:</span>
                            <p className="text-sm bg-muted/50 p-2 rounded text-muted-foreground">
                              {suggestion.original_text}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Sugerido:</span>
                            <p className="text-sm bg-primary/5 p-2 rounded">
                              {suggestion.suggested_text}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Razón:</span>
                            <p className="text-xs text-muted-foreground">
                              {suggestion.reason}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs"
                          >
                            <ThumbsDown className="h-3 w-3" />
                            Rechazar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApplySuggestion(suggestion)}
                            disabled={isApplyingSuggestion}
                            className="gap-1 text-xs"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            Aplicar
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}