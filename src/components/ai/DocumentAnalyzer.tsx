
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { useAdvancedAI } from '@/hooks/useAdvancedAI'

interface AnalysisResult {
  documentType: string
  extractedData: Record<string, any>
  riskLevel: 'low' | 'medium' | 'high'
  issues: Array<{
    type: 'warning' | 'error' | 'info'
    message: string
    location?: string
  }>
  suggestions: string[]
  confidence: number
}

export const DocumentAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const { isAnalyzing, analyzeDocument } = useAdvancedAI()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setAnalysisResult(null)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return

    const result = await analyzeDocument(selectedFile, 'comprehensive')
    if (result) {
      setAnalysisResult(result.result as AnalysisResult)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <Info className="h-4 w-4 text-blue-500" />
      default: return <Info className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Analizador de Documentos IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              id="document-upload"
            />
            <label htmlFor="document-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900">
                Seleccionar documento
              </p>
              <p className="text-sm text-gray-500">
                PDF, DOC, DOCX, TXT hasta 10MB
              </p>
            </label>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <Badge variant="outline">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Badge>
              </div>
              <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? 'Analizando...' : 'Analizar'}
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-center text-gray-600">
                Analizando documento con IA...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {analysisResult && (
        <div className="space-y-4">
          {/* Resumen del análisis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Resultado del Análisis
                <Badge className={getRiskColor(analysisResult.riskLevel)}>
                  Riesgo: {analysisResult.riskLevel.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tipo de Documento</p>
                  <p className="text-lg">{analysisResult.documentType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Confianza</p>
                  <div className="flex items-center gap-2">
                    <Progress value={analysisResult.confidence} className="w-20" />
                    <span>{analysisResult.confidence}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datos extraídos */}
          {analysisResult.extractedData && Object.keys(analysisResult.extractedData).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Datos Extraídos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(analysisResult.extractedData).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm font-medium text-gray-600 capitalize">
                        {key.replace('_', ' ')}
                      </p>
                      <p className="text-sm">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Issues encontrados */}
          {analysisResult.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Issues Detectados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysisResult.issues.map((issue, index) => (
                  <Alert key={index} className="flex items-start gap-3">
                    {getIssueIcon(issue.type)}
                    <div>
                      <AlertDescription>
                        {issue.message}
                        {issue.location && (
                          <span className="text-xs text-gray-500 block mt-1">
                            Ubicación: {issue.location}
                          </span>
                        )}
                      </AlertDescription>
                    </div>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Sugerencias */}
          {analysisResult.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
