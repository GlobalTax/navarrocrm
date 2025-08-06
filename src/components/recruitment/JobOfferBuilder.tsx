import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, ChevronLeft, ChevronRight, Save, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type Candidate } from '@/types/recruitment'
import { cn } from '@/lib/utils'

const jobOfferSchema = z.object({
  candidate_id: z.string().min(1, 'Candidato requerido'),
  title: z.string().min(1, 'Título del puesto requerido'),
  department: z.string().optional(),
  salary_offered: z.number().min(0, 'Salario debe ser mayor a 0'),
  salary_currency: z.string().default('EUR'),
  start_date: z.date({ required_error: 'Fecha de inicio requerida' }),
  contract_type: z.enum(['indefinido', 'temporal', 'practicas', 'freelance']).default('indefinido'),
  work_schedule: z.enum(['full_time', 'part_time', 'flexible']).default('full_time'),
  remote_work: z.enum(['onsite', 'remote', 'hybrid']).default('onsite'),
  benefits: z.string().optional(),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  offer_expiry_date: z.date().optional(),
  notes: z.string().optional(),
})

type JobOfferFormData = z.infer<typeof jobOfferSchema>

const STEPS = [
  { id: 1, title: 'Información General', fields: ['candidate_id', 'title', 'department'] },
  { id: 2, title: 'Compensación', fields: ['salary_offered', 'salary_currency', 'start_date'] },
  { id: 3, title: 'Condiciones', fields: ['contract_type', 'work_schedule', 'remote_work'] },
  { id: 4, title: 'Detalles', fields: ['benefits', 'requirements', 'responsibilities'] },
  { id: 5, title: 'Configuración', fields: ['offer_expiry_date', 'notes'] }
]

interface JobOfferBuilderProps {
  open: boolean
  onClose: () => void
  candidate?: Candidate | null
  candidates?: Candidate[]
  departments?: Array<{ id: string; name: string }>
  onSubmit: (data: JobOfferFormData) => void
  isLoading?: boolean
}

export function JobOfferBuilder({ 
  open, 
  onClose, 
  candidate, 
  candidates = [], 
  departments = [],
  onSubmit,
  isLoading = false
}: JobOfferBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [activeTab, setActiveTab] = useState('form')

  const form = useForm<JobOfferFormData>({
    resolver: zodResolver(jobOfferSchema),
    defaultValues: {
      candidate_id: candidate?.id || '',
      title: '',
      department: '',
      salary_offered: 0,
      salary_currency: 'EUR',
      contract_type: 'indefinido',
      work_schedule: 'full_time',
      remote_work: 'onsite',
      benefits: '',
      requirements: '',
      responsibilities: '',
      notes: '',
    }
  })

  const currentStepData = STEPS.find(step => step.id === currentStep)
  const isLastStep = currentStep === STEPS.length

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId)
  }

  const handleSave = (data: JobOfferFormData) => {
    onSubmit(data)
  }

  const validateCurrentStep = () => {
    const stepFields = currentStepData?.fields || []
    return stepFields.every(field => {
      const value = form.getValues(field as keyof JobOfferFormData)
      return value !== undefined && value !== '' && value !== 0
    })
  }

  const handleClose = () => {
    form.reset()
    setCurrentStep(1)
    setActiveTab('form')
    onClose()
  }

  const formData = form.watch()
  const selectedCandidate = candidates.find(c => c.id === formData.candidate_id) || candidate

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden rounded-[10px] border-0.5 border-foreground">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold">Crear Oferta de Trabajo</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="form" className="rounded-[10px]">Formulario</TabsTrigger>
            <TabsTrigger value="preview" className="rounded-[10px]">Vista Previa</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="flex-1 space-y-0 overflow-hidden">
            <div className="grid grid-cols-12 gap-6 h-[600px]">
              {/* Navegación lateral */}
              <div className="col-span-3 border-r border-border pr-4">
                <div className="space-y-2">
                  {STEPS.map((step) => (
                    <div
                      key={step.id}
                      onClick={() => handleStepClick(step.id)}
                      className={cn(
                        "p-3 rounded-[10px] cursor-pointer transition-all duration-200",
                        "hover:bg-muted/50 hover:-translate-y-1",
                        currentStep === step.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                          currentStep === step.id
                            ? "bg-primary-foreground text-primary"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {step.id}
                        </div>
                        <span className="font-medium">{step.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contenido del formulario */}
              <div className="col-span-9 overflow-y-auto">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
                    {/* Paso 1: Información General */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">Información General</h3>
                          <p className="text-sm text-muted-foreground">
                            Datos básicos del puesto y candidato
                          </p>
                        </div>

                        <FormField
                          control={form.control}
                          name="candidate_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Candidato *</FormLabel>
                              {candidate ? (
                                <div className="p-4 border border-border rounded-[10px] bg-muted/50">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium">
                                      {candidate.first_name[0]}{candidate.last_name[0]}
                                    </div>
                                    <div>
                                      <p className="font-medium">{candidate.first_name} {candidate.last_name}</p>
                                      <p className="text-sm text-muted-foreground">{candidate.email}</p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="rounded-[10px] border-0.5 border-foreground">
                                      <SelectValue placeholder="Seleccionar candidato..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {candidates.map((cand) => (
                                      <SelectItem key={cand.id} value={cand.id}>
                                        {cand.first_name} {cand.last_name} ({cand.email})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título del Puesto *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="ej. Desarrollador Senior Frontend"
                                  className="rounded-[10px] border-0.5 border-foreground" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Departamento</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="rounded-[10px] border-0.5 border-foreground">
                                    <SelectValue placeholder="Seleccionar departamento..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.name}>
                                      {dept.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Paso 2: Compensación */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">Compensación</h3>
                          <p className="text-sm text-muted-foreground">
                            Detalles salariales y fecha de incorporación
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2">
                            <FormField
                              control={form.control}
                              name="salary_offered"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Salario Ofrecido *</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="0"
                                      placeholder="45000"
                                      className="rounded-[10px] border-0.5 border-foreground" 
                                      {...field} 
                                      onChange={e => field.onChange(Number(e.target.value))} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="salary_currency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Moneda</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="rounded-[10px] border-0.5 border-foreground">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="GBP">GBP</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="start_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Fecha de Inicio *</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal rounded-[10px] border-0.5 border-foreground",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Seleccionar fecha</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-[10px] border-0.5 border-foreground" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Paso 3: Condiciones */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">Condiciones de Trabajo</h3>
                          <p className="text-sm text-muted-foreground">
                            Tipo de contrato y modalidad de trabajo
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="contract_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Contrato</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="rounded-[10px] border-0.5 border-foreground">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="indefinido">Indefinido</SelectItem>
                                    <SelectItem value="temporal">Temporal</SelectItem>
                                    <SelectItem value="practicas">Prácticas</SelectItem>
                                    <SelectItem value="freelance">Freelance</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="work_schedule"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jornada</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="rounded-[10px] border-0.5 border-foreground">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="full_time">Tiempo Completo</SelectItem>
                                    <SelectItem value="part_time">Medio Tiempo</SelectItem>
                                    <SelectItem value="flexible">Flexible</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="remote_work"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Modalidad</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="rounded-[10px] border-0.5 border-foreground">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="onsite">Presencial</SelectItem>
                                    <SelectItem value="remote">Remoto</SelectItem>
                                    <SelectItem value="hybrid">Híbrido</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Paso 4: Detalles */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">Detalles del Puesto</h3>
                          <p className="text-sm text-muted-foreground">
                            Beneficios, requisitos y responsabilidades
                          </p>
                        </div>

                        <FormField
                          control={form.control}
                          name="benefits"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Beneficios</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Seguro médico, vacaciones adicionales, formación continua..."
                                  className="rounded-[10px] border-0.5 border-foreground min-h-[80px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="requirements"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Requisitos</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Experiencia en React, conocimientos de TypeScript..."
                                  className="rounded-[10px] border-0.5 border-foreground min-h-[80px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="responsibilities"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Responsabilidades</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Desarrollo de nuevas funcionalidades, mantenimiento del código..."
                                  className="rounded-[10px] border-0.5 border-foreground min-h-[80px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Paso 5: Configuración */}
                    {currentStep === 5 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">Configuración Final</h3>
                          <p className="text-sm text-muted-foreground">
                            Configuraciones adicionales de la oferta
                          </p>
                        </div>

                        <FormField
                          control={form.control}
                          name="offer_expiry_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Fecha de Expiración (Opcional)</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal rounded-[10px] border-0.5 border-foreground",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Seleccionar fecha</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-[10px] border-0.5 border-foreground" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notas Adicionales</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Cualquier información adicional relevante..."
                                  className="rounded-[10px] border-0.5 border-foreground min-h-[100px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Navegación */}
                    <div className="flex justify-between items-center pt-6 border-t border-border">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className="rounded-[10px] border-0.5 border-foreground"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Anterior
                      </Button>

                      <div className="flex items-center space-x-2">
                        {STEPS.map((step) => (
                          <div
                            key={step.id}
                            className={cn(
                              "w-3 h-3 rounded-full",
                              currentStep >= step.id ? "bg-primary" : "bg-muted"
                            )}
                          />
                        ))}
                      </div>

                      {isLastStep ? (
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="rounded-[10px] border-0.5 border-foreground"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isLoading ? 'Guardando...' : 'Crear Oferta'}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="rounded-[10px] border-0.5 border-foreground"
                        >
                          Siguiente
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-y-auto">
            <JobOfferPreview formData={formData} candidate={selectedCandidate} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// Componente de vista previa
function JobOfferPreview({ formData, candidate }: { formData: JobOfferFormData; candidate?: Candidate }) {
  const formatSalary = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const getContractTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      indefinido: 'Indefinido',
      temporal: 'Temporal',
      practicas: 'Prácticas',
      freelance: 'Freelance'
    }
    return labels[type] || type
  }

  const getScheduleLabel = (schedule: string) => {
    const labels: Record<string, string> = {
      full_time: 'Tiempo Completo',
      part_time: 'Medio Tiempo',
      flexible: 'Flexible'
    }
    return labels[schedule] || schedule
  }

  const getRemoteLabel = (remote: string) => {
    const labels: Record<string, string> = {
      onsite: 'Presencial',
      remote: 'Remoto',
      hybrid: 'Híbrido'
    }
    return labels[remote] || remote
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 bg-background">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Oferta de Trabajo</h1>
        <div className="text-lg text-muted-foreground">
          {candidate && (
            <p>Para: <span className="font-medium text-foreground">{candidate.first_name} {candidate.last_name}</span></p>
          )}
        </div>
      </div>

      <Separator />

      {/* Información del puesto */}
      <Card className="border-0.5 border-foreground rounded-[10px]">
        <CardHeader>
          <CardTitle className="text-xl">Información del Puesto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Título</p>
              <p className="text-lg font-medium">{formData.title || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Departamento</p>
              <p className="text-lg font-medium">{formData.department || 'No especificado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compensación */}
      <Card className="border-0.5 border-foreground rounded-[10px]">
        <CardHeader>
          <CardTitle className="text-xl">Compensación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Salario</p>
              <p className="text-2xl font-bold text-green-600">
                {formData.salary_offered > 0 
                  ? formatSalary(formData.salary_offered, formData.salary_currency)
                  : 'A negociar'
                }
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de Inicio</p>
              <p className="text-lg font-medium">
                {formData.start_date ? format(formData.start_date, 'dd/MM/yyyy') : 'No especificada'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Condiciones */}
      <Card className="border-0.5 border-foreground rounded-[10px]">
        <CardHeader>
          <CardTitle className="text-xl">Condiciones de Trabajo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Badge className="mb-2 rounded-[10px] border-0.5 border-foreground">
                {getContractTypeLabel(formData.contract_type)}
              </Badge>
              <p className="text-xs text-muted-foreground">Tipo de Contrato</p>
            </div>
            <div className="text-center">
              <Badge className="mb-2 rounded-[10px] border-0.5 border-foreground">
                {getScheduleLabel(formData.work_schedule)}
              </Badge>
              <p className="text-xs text-muted-foreground">Jornada</p>
            </div>
            <div className="text-center">
              <Badge className="mb-2 rounded-[10px] border-0.5 border-foreground">
                {getRemoteLabel(formData.remote_work)}
              </Badge>
              <p className="text-xs text-muted-foreground">Modalidad</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalles */}
      {(formData.benefits || formData.requirements || formData.responsibilities) && (
        <div className="space-y-6">
          {formData.benefits && (
            <Card className="border-0.5 border-foreground rounded-[10px]">
              <CardHeader>
                <CardTitle className="text-lg">Beneficios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{formData.benefits}</p>
              </CardContent>
            </Card>
          )}

          {formData.requirements && (
            <Card className="border-0.5 border-foreground rounded-[10px]">
              <CardHeader>
                <CardTitle className="text-lg">Requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{formData.requirements}</p>
              </CardContent>
            </Card>
          )}

          {formData.responsibilities && (
            <Card className="border-0.5 border-foreground rounded-[10px]">
              <CardHeader>
                <CardTitle className="text-lg">Responsabilidades</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{formData.responsibilities}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Configuración */}
      {(formData.offer_expiry_date || formData.notes) && (
        <Card className="border-0.5 border-foreground rounded-[10px]">
          <CardHeader>
            <CardTitle className="text-lg">Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.offer_expiry_date && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Validez de la Oferta</p>
                <p>Hasta el {format(formData.offer_expiry_date, 'dd/MM/yyyy')}</p>
              </div>
            )}
            {formData.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notas</p>
                <p className="whitespace-pre-wrap">{formData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}