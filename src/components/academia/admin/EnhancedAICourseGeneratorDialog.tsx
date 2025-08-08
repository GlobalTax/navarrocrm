
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sparkles, AlertCircle, CheckCircle } from 'lucide-react'
import type { AcademyCategory } from '@/types/academy'

const aiGenerationSchema = z.object({
  topic: z.string().min(5, 'El tema debe tener al menos 5 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  category_id: z.string().min(1, 'Selecciona una categoría'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  estimated_duration: z.number().min(15, 'Duración mínima: 15 minutos').max(480, 'Duración máxima: 8 horas'),
  lesson_count: z.number().min(3, 'Mínimo 3 lecciones').max(20, 'Máximo 20 lecciones')
})

type AIGenerationFormData = z.infer<typeof aiGenerationSchema>

interface EnhancedAICourseGeneratorDialogProps {
  open: boolean
  onClose: () => void
  categories: AcademyCategory[]
  onCourseGenerated: (courseId: string) => void
  isGenerating: boolean
  onGeneratingChange: (generating: boolean) => void
}

interface GenerationStep {
  id: string
  label: string
  completed: boolean
  error?: string
}

export function EnhancedAICourseGeneratorDialog({
  open,
  onClose,
  categories,
  onCourseGenerated,
  isGenerating,
  onGeneratingChange
}: EnhancedAICourseGeneratorDialogProps) {
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [generatedCourseId, setGeneratedCourseId] = useState<string | null>(null)

  const form = useForm<AIGenerationFormData>({
    resolver: zodResolver(aiGenerationSchema),
    defaultValues: {
      topic: '',
      description: '',
      category_id: '',
      level: 'beginner',
      estimated_duration: 60,
      lesson_count: 5
    }
  })

  const initializeGenerationSteps = (lessonCount: number) => {
    const steps: GenerationStep[] = [
      { id: 'course', label: 'Generando estructura del curso', completed: false },
      { id: 'lessons', label: `Creando ${lessonCount} lecciones`, completed: false },
      { id: 'content', label: 'Generando contenido detallado', completed: false },
      { id: 'finalize', label: 'Finalizando curso', completed: false }
    ]
    setGenerationSteps(steps)
    setCurrentStep(0)
  }

  const updateStepProgress = (stepId: string, completed: boolean, error?: string) => {
    setGenerationSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, completed, error }
        : step
    ))
    
    if (completed && !error) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const simulateAIGeneration = async (data: AIGenerationFormData) => {
    try {
      onGeneratingChange(true)
      setGenerationError(null)
      initializeGenerationSteps(data.lesson_count)

      // Simulate course generation steps
      await new Promise(resolve => setTimeout(resolve, 1500))
      updateStepProgress('course', true)

      await new Promise(resolve => setTimeout(resolve, 2000))
      updateStepProgress('lessons', true)

      await new Promise(resolve => setTimeout(resolve, 1800))
      updateStepProgress('content', true)

      await new Promise(resolve => setTimeout(resolve, 1000))
      updateStepProgress('finalize', true)

      // Simulate successful course creation
      const mockCourseId = 'generated-course-' + Date.now()
      setGeneratedCourseId(mockCourseId)
      
      // Call the actual AI generation function here
      // const result = await generateCourseWithAI(data)
      // onCourseGenerated(result.courseId)

    } catch (error) {
      console.error('Error generating course:', error)
      setGenerationError('Error al generar el curso. Por favor, inténtalo de nuevo.')
      updateStepProgress(generationSteps[currentStep]?.id, false, 'Error en la generación')
    } finally {
      onGeneratingChange(false)
    }
  }

  const onSubmit = async (data: AIGenerationFormData) => {
    await simulateAIGeneration(data)
  }

  const handleClose = () => {
    if (!isGenerating) {
      form.reset()
      setGenerationSteps([])
      setCurrentStep(0)
      setGenerationError(null)
      setGeneratedCourseId(null)
      onClose()
    }
  }

  const handleFinish = () => {
    if (generatedCourseId) {
      onCourseGenerated(generatedCourseId)
    }
    handleClose()
  }

  const progressPercentage = generationSteps.length > 0 
    ? Math.round((generationSteps.filter(step => step.completed).length / generationSteps.length) * 100)
    : 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-academia-intermediate" />
            Generador de Cursos con IA
          </DialogTitle>
        </DialogHeader>

        {!isGenerating && !generatedCourseId && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tema del Curso</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Ej: Gestión avanzada de clientes en asesorías"
                        className="border-0.5 border-black rounded-[10px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción Detallada</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe en detalle qué debe cubrir el curso, objetivos de aprendizaje, público objetivo..."
                        className="min-h-[100px] border-0.5 border-black rounded-[10px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-0.5 border-black rounded-[10px]">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-0.5 border-black rounded-[10px]">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Principiante</SelectItem>
                          <SelectItem value="intermediate">Intermedio</SelectItem>
                          <SelectItem value="advanced">Avanzado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimated_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración Estimada (minutos)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="border-0.5 border-black rounded-[10px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lesson_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Lecciones</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="border-0.5 border-black rounded-[10px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-academia-intermediate text-academia-intermediate-foreground hover:bg-academia-intermediate/90">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar Curso
                </Button>
              </div>
            </form>
          </Form>
        )}

        {isGenerating && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">Generando tu curso...</div>
              <div className="text-sm text-gray-600 mb-4">
                Esto puede tomar unos minutos. Por favor, no cierres esta ventana.
              </div>
              <Progress value={progressPercentage} className="w-full" />
              <div className="text-sm text-gray-500 mt-2">{progressPercentage}% completado</div>
            </div>

            <div className="space-y-3">
              {generationSteps.map((step, index) => (
                <div 
                  key={step.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    step.completed 
                      ? 'bg-academia-success-soft border border-academia-success/20' 
                      : index === currentStep 
                        ? 'bg-academia-info-soft border border-academia/20' 
                        : 'bg-muted border border-border'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5 text-academia-success" />
                  ) : step.error ? (
                    <AlertCircle className="h-5 w-5 text-academia-error" />
                  ) : index === currentStep ? (
                    <div className="h-5 w-5 rounded-full border-2 border-academia border-t-transparent animate-spin" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                  )}
                  
                  <div className="flex-1">
                    <div className={`font-medium ${
                      step.completed ? 'text-academia-success' : 
                      step.error ? 'text-academia-error' : 
                      index === currentStep ? 'text-academia' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </div>
                    {step.error && (
                      <div className="text-sm text-academia-error mt-1">{step.error}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {generationError && (
              <Alert className="border-academia-error/20 bg-academia-error-soft">
                <AlertCircle className="h-4 w-4 text-academia-error" />
                <AlertDescription className="text-academia-error">
                  {generationError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {generatedCourseId && !isGenerating && (
          <div className="space-y-4 text-center">
            <div className="p-6 bg-academia-success-soft rounded-lg border border-academia-success/20">
              <CheckCircle className="h-12 w-12 text-academia-success mx-auto mb-4" />
              <h3 className="text-lg font-medium text-academia-success mb-2">
                ¡Curso Generado Exitosamente!
              </h3>
              <p className="text-academia-success">
                Tu curso ha sido creado con IA y está listo para ser revisado y publicado.
              </p>
            </div>
            
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cerrar
              </Button>
              <Button onClick={handleFinish} className="bg-academia-success text-academia-success-foreground hover:bg-academia-success/90">
                Ver Curso Generado
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
