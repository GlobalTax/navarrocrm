import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Sparkles, 
  Wand2, 
  RefreshCw, 
  Copy, 
  Check,
  Lightbulb,
  Brain,
  FileText,
  MessageSquare
} from 'lucide-react'
import { useDocumentAI } from '@/hooks/useDocumentAI'
import { toast } from 'sonner'

interface AIContentGeneratorProps {
  onContentGenerated?: (content: string) => void
  documentType?: string
  templateId?: string
  initialVariables?: Record<string, any>
}

export const AIContentGenerator = ({
  onContentGenerated,
  documentType = 'contract',
  templateId,
  initialVariables = {}
}: AIContentGeneratorProps) => {
  const { generateContent, enhanceContent, getSuggestions, isGenerating, isEnhancing } = useDocumentAI()
  
  const [prompt, setPrompt] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [enhancementType, setEnhancementType] = useState<'grammar' | 'clarity' | 'legal_language' | 'professional_tone'>('clarity')
  const [tone, setTone] = useState<'professional' | 'formal' | 'friendly' | 'legal'>('professional')
  const [autoSuggest, setAutoSuggest] = useState(true)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-sugerencias mientras el usuario escribe
  useEffect(() => {
    if (!autoSuggest || !prompt) return

    const timeoutId = setTimeout(async () => {
      try {
        const result = await getSuggestions.mutateAsync({
          text: prompt,
          cursorPosition: prompt.length,
          documentContext: { documentType, variables: initialVariables }
        })
        setSuggestions(result.suggestions || [])
      } catch (error) {
        // Silently fail para no molestar al usuario
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [prompt, autoSuggest, documentType, initialVariables, getSuggestions])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor, describe qué tipo de contenido quieres generar')
      return
    }

    try {
      const result = await generateContent.mutateAsync({
        prompt,
        documentType,
        templateId,
        variables: initialVariables,
        tone
      })
      
      setGeneratedContent(result.content)
      if (onContentGenerated) {
        onContentGenerated(result.content)
      }
    } catch (error) {
      console.error('Error generating content:', error)
    }
  }

  const handleEnhance = async () => {
    if (!generatedContent.trim()) {
      toast.error('No hay contenido para mejorar')
      return
    }

    try {
      const result = await enhanceContent.mutateAsync({
        content: generatedContent,
        documentType,
        enhancementType,
        context: initialVariables
      })
      
      setGeneratedContent(result.enhanced_content)
      if (onContentGenerated) {
        onContentGenerated(result.enhanced_content)
      }
      
      toast.success(`Contenido mejorado: ${result.improvements.length} mejoras aplicadas`)
    } catch (error) {
      console.error('Error enhancing content:', error)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent)
      setCopied(true)
      toast.success('Contenido copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Error copiando el contenido')
    }
  }

  const applySuggestion = (suggestion: string) => {
    setPrompt(prev => prev + ' ' + suggestion)
    setSuggestions([])
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Generador de Contenido IA
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tone">Tono del Documento</Label>
            <Select value={tone} onValueChange={(value: any) => setTone(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Profesional</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="friendly">Amigable</SelectItem>
                <SelectItem value="legal">Jurídico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="enhancement">Tipo de Mejora</Label>
            <Select value={enhancementType} onValueChange={(value: any) => setEnhancementType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clarity">Claridad</SelectItem>
                <SelectItem value="grammar">Gramática</SelectItem>
                <SelectItem value="legal_language">Lenguaje Legal</SelectItem>
                <SelectItem value="professional_tone">Tono Profesional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Auto-suggestions toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-suggest"
            checked={autoSuggest}
            onCheckedChange={setAutoSuggest}
          />
          <Label htmlFor="auto-suggest" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Sugerencias Automáticas
          </Label>
        </div>

        {/* Prompt input */}
        <div className="space-y-3">
          <Label htmlFor="prompt">Describe el contenido que quieres generar</Label>
          <div className="relative">
            <Textarea
              ref={textareaRef}
              id="prompt"
              placeholder="Ej: Genera una cláusula de confidencialidad para un contrato de trabajo, que incluya protección de datos personales y secretos comerciales..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-20 resize-none"
              rows={3}
            />
            
            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-md shadow-lg">
                <div className="p-2 border-b">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" />
                    Sugerencias IA
                  </span>
                </div>
                <div className="max-h-32 overflow-y-auto">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => applySuggestion(suggestion)}
                      className="w-full text-left p-2 text-xs hover:bg-muted/50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {isGenerating ? 'Generando...' : 'Generar Contenido'}
          </Button>
        </div>

        {/* Generated content */}
        {generatedContent && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Contenido Generado
              </Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleEnhance}
                  disabled={isEnhancing}
                  className="gap-1"
                >
                  {isEnhancing ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  Mejorar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="gap-1"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  Copiar
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <Textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                className="min-h-40 font-mono text-sm"
                rows={8}
              />
              
              {/* Quality indicator */}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {generatedContent.split(' ').length} palabras
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Quick templates */}
        <div className="space-y-2">
          <Label className="text-sm">Plantillas Rápidas</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPrompt('Genera una introducción profesional para un contrato de servicios')}
              className="justify-start text-xs"
            >
              Introducción Contrato
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPrompt('Redacta una cláusula de confidencialidad estándar')}
              className="justify-start text-xs"
            >
              Cláusula Confidencialidad
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPrompt('Crea una cláusula de terminación de contrato')}
              className="justify-start text-xs"
            >
              Terminación
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPrompt('Genera una cláusula de responsabilidades y obligaciones')}
              className="justify-start text-xs"
            >
              Responsabilidades
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}