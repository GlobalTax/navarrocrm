
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Bot, Sparkles, BookOpen, Users, Clock, Target } from 'lucide-react'
import { useAICourseGeneration, CourseGenerationRequest } from '@/hooks/useAICourseGeneration'

const aiCourseSchema = z.object({
  topic: z.string().min(5, 'El tema debe tener al menos 5 caracteres'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  category_id: z.string().min(1, 'La categoría es obligatoria'),
  estimated_lessons: z.number().min(3, 'Mínimo 3 lecciones').max(20, 'Máximo 20 lecciones'),
  target_audience: z.string().min(10, 'Describe la audiencia objetivo (mínimo 10 caracteres)')
})

type AICourseFormData = z.infer<typeof aiCourseSchema>

interface AICourseGeneratorDialogProps {
  open: boolean
  onClose: () => void
  categories: Array<{
    id: string
    name: string
  }>
  onCourseGenerated?: (courseId: string) => void
}

export function AICourseGeneratorDialog({ 
  open, 
  onClose, 
  categories, 
  onCourseGenerated 
}: AICourseGeneratorDialogProps) {
  const { generateCourse, isGenerating } = useAICourseGeneration()

  const form = useForm<AICourseFormData>({
    resolver: zodResolver(aiCourseSchema),
    defaultValues: {
      topic: '',
      level: 'beginner',
      category_id: '',
      estimated_lessons: 5,
      target_audience: ''
    }
  })

  const onSubmit = async (data: AICourseFormData) => {
    const courseId = await generateCourse(data as CourseGenerationRequest)
    if (courseId) {
      onCourseGenerated?.(courseId)
      onClose()
      form.reset()
    }
  }

  const suggestedTopics = [
    'Gestión eficiente de expedientes legales',
    'Optimización del time tracking en asesorías',
    'Comunicación efectiva con clientes',
    'Automatización de tareas administrativas',
    'Análisis de rentabilidad por caso',
    'Gestión de documentos digitales'
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Generar Curso con IA
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Beta
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border-0.5 border-blue-200">
            <div className="flex items-start gap-3">
              <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Generación Inteligente</h4>
                <p className="text-sm text-blue-700 mt-1">
                  La IA creará un curso completo con lecciones estructuradas, ejemplos prácticos 
                  y contenido adaptado a las funcionalidades de tu CRM.
                </p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Tema del Curso
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Ej: Gestión avanzada de clientes en asesorías jurídicas..."
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">Sugerencias de temas:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedTopics.map((topic) => (
                          <Badge 
                            key={topic}
                            variant="outline" 
                            className="cursor-pointer hover:bg-gray-100 text-xs"
                            onClick={() => form.setValue('topic', topic)}
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel del Curso</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
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

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona categoría" />
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
              </div>

              <FormField
                control={form.control}
                name="estimated_lessons"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Número de Lecciones
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        min={3}
                        max={20}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_audience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Audiencia Objetivo
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Ej: Abogados junior, administrativos de asesorías, nuevos empleados..."
                        className="min-h-[60px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generando Curso...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generar con IA
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
