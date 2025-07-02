import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  MessageCircle, 
  Sparkles, 
  CheckCircle, 
  ArrowRight,
  FileCheck,
  User,
  Building,
  Zap,
  Target
} from 'lucide-react'
import { useSmartFormEngine } from '@/hooks/useSmartFormEngine'

export const SmartFormEngine: React.FC = () => {
  const [isConversationalMode, setIsConversationalMode] = useState(true)
  
  const {
    currentStep,
    progress,
    formData,
    aiSuggestions,
    isProcessing,
    nextQuestion,
    updateField,
    submitAnswer,
    completeOnboarding,
    switchToTraditionalForm
  } = useSmartFormEngine()

  const [userMessage, setUserMessage] = useState('')

  const handleSubmitMessage = () => {
    if (userMessage.trim()) {
      submitAnswer(userMessage)
      setUserMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setUserMessage(suggestion)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0.5 border-black rounded-[10px] bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-[10px]">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-xl">Formulario Inteligente con IA</div>
              <div className="text-sm font-normal text-gray-600">
                Onboarding conversacional que se adapta a cada cliente
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <Button
                variant={isConversationalMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsConversationalMode(true)}
                className="border-0.5 border-black rounded-[10px]"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Conversacional
              </Button>
              <Button
                variant={!isConversationalMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setIsConversationalMode(false)
                  switchToTraditionalForm()
                }}
                className="border-0.5 border-black rounded-[10px]"
              >
                <FileCheck className="h-4 w-4 mr-2" />
                Tradicional
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Progreso: {progress}% completado
            </div>
            <Badge 
              variant="outline" 
              className="border-0.5 border-purple-400 text-purple-600 rounded-[10px]"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              IA Activa
            </Badge>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardContent>
      </Card>

      {isConversationalMode ? (
        /* Modo Conversacional */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Principal */}
          <div className="lg:col-span-2">
            <Card className="border-0.5 border-black rounded-[10px] h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Chat Inteligente con IA
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Área de chat */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {/* Mensaje inicial de IA */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-[10px] p-3">
                        <p className="text-gray-800">
                          ¡Hola! Soy tu asistente de onboarding inteligente. Te voy a guiar paso a paso para conocerte mejor y crear la propuesta legal perfecta para ti.
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">IA • Ahora</div>
                    </div>
                  </div>

                  {/* Pregunta actual */}
                  {nextQuestion && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-[10px] p-3">
                          <p className="text-gray-800">{nextQuestion.text}</p>
                          {nextQuestion.context && (
                            <p className="text-gray-600 text-sm mt-2">{nextQuestion.context}</p>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">IA • Ahora</div>
                      </div>
                    </div>
                  )}

                  {/* Respuestas del usuario */}
                  {formData.responses && formData.responses.map((response, index) => (
                    <div key={index} className="flex gap-3 justify-end">
                      <div className="flex-1 max-w-md">
                        <div className="bg-primary text-white rounded-[10px] p-3 ml-auto">
                          <p>{response.answer}</p>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-right">Tú • {response.timestamp}</div>
                      </div>
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  ))}

                  {/* Indicador de escritura */}
                  {isProcessing && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Brain className="h-4 w-4 text-white animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-[10px] p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                            <span className="text-gray-600 ml-2">IA está analizando...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input del chat */}
                <div className="space-y-3">
                  {/* Sugerencias de IA */}
                  {aiSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500">Sugerencias de IA:</div>
                      <div className="flex flex-wrap gap-2">
                        {aiSuggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="border-0.5 border-purple-300 text-purple-600 rounded-[10px] text-xs"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Textarea
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe tu respuesta aquí..."
                      className="flex-1 border-0.5 border-black rounded-[10px] resize-none"
                      rows={2}
                    />
                    <Button
                      onClick={handleSubmitMessage}
                      disabled={!userMessage.trim() || isProcessing}
                      className="bg-primary hover:bg-primary/90 text-white border-0.5 border-black rounded-[10px]"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel de información */}
          <div className="space-y-6">
            {/* Datos extraídos */}
            <Card className="border-0.5 border-black rounded-[10px]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Datos Extraídos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {formData.extractedData && Object.keys(formData.extractedData).length > 0 ? (
                  Object.entries(formData.extractedData).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded-[8px]">
                      <span className="text-sm font-medium capitalize">{key}:</span>
                      <span className="text-sm text-gray-600">{String(value)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Los datos se extraerán automáticamente mientras conversamos</p>
                )}
              </CardContent>
            </Card>

            {/* Análisis de IA */}
            <Card className="border-0.5 border-black rounded-[10px]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Análisis de IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Completitud de datos:</span>
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                
                {formData.aiAnalysis && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Insights:</div>
                    <ul className="space-y-1">
                      {formData.aiAnalysis.insights?.map((insight, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Acciones */}
            <Card className="border-0.5 border-black rounded-[10px]">
              <CardContent className="p-4 space-y-3">
                <Button 
                  onClick={completeOnboarding}
                  disabled={progress < 80}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0.5 border-black rounded-[10px]"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completar Onboarding
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full border-0.5 border-black rounded-[10px]"
                >
                  Guardar y Continuar Después
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Modo Tradicional */
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              Formulario Tradicional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre/Razón Social *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="border-0.5 border-black rounded-[10px]"
                    placeholder="Introduce el nombre..."
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="border-0.5 border-black rounded-[10px]"
                    placeholder="email@ejemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="border-0.5 border-black rounded-[10px]"
                    placeholder="+34 600 000 000"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="client_type">Tipo de Cliente</Label>
                  <Select 
                    value={formData.client_type || ''} 
                    onValueChange={(value) => updateField('client_type', value)}
                  >
                    <SelectTrigger className="border-0.5 border-black rounded-[10px]">
                      <SelectValue placeholder="Selecciona tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="particular">Particular</SelectItem>
                      <SelectItem value="empresa">Empresa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="business_sector">Sector (si es empresa)</Label>
                  <Input
                    id="business_sector"
                    value={formData.business_sector || ''}
                    onChange={(e) => updateField('business_sector', e.target.value)}
                    className="border-0.5 border-black rounded-[10px]"
                    placeholder="Ej: Tecnología, Construcción..."
                  />
                </div>

                <div>
                  <Label htmlFor="legal_matter">Asunto Legal</Label>
                  <Textarea
                    id="legal_matter"
                    value={formData.legal_matter || ''}
                    onChange={(e) => updateField('legal_matter', e.target.value)}
                    className="border-0.5 border-black rounded-[10px]"
                    placeholder="Describe brevemente tu caso..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={completeOnboarding}
                className="bg-primary hover:bg-primary/90 text-white border-0.5 border-black rounded-[10px]"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Completar Formulario
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}