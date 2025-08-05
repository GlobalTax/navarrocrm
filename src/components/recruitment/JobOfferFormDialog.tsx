import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { CalendarIcon } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
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
  work_schedule: z.enum(['completa', 'parcial', 'flexible']).default('completa'),
  remote_work: z.enum(['presencial', 'remoto', 'hibrido']).default('presencial'),
  benefits: z.string().optional(),
  requirements: z.string().optional(),
  offer_expiry_date: z.date().optional(),
  notes: z.string().optional(),
})

type JobOfferFormData = z.infer<typeof jobOfferSchema>

interface JobOfferFormDialogProps {
  open: boolean
  onClose: () => void
  candidate?: Candidate | null
}

export function JobOfferFormDialog({ open, onClose, candidate }: JobOfferFormDialogProps) {
  const { user } = useApp()
  const queryClient = useQueryClient()

  // Query para obtener candidatos (si no se proporciona uno específico)
  const { data: candidates = [], isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidates-for-offer', user?.org_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('id, first_name, last_name, email, status')
        .eq('org_id', user?.org_id)
        .in('status', ['interviewing', 'screening'])
        .order('first_name')
      
      if (error) throw error
      return data as Candidate[]
    },
    enabled: !!user?.org_id && open && !candidate
  })

  // Query para obtener departamentos
  const { data: departments = [] } = useQuery({
    queryKey: ['departments', user?.org_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .eq('org_id', user?.org_id)
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      return data
    },
    enabled: !!user?.org_id && open
  })

  const form = useForm<JobOfferFormData>({
    resolver: zodResolver(jobOfferSchema),
    defaultValues: {
      candidate_id: candidate?.id || '',
      title: '',
      department: '',
      salary_offered: 0,
      salary_currency: 'EUR',
      contract_type: 'indefinido',
      work_schedule: 'completa',
      remote_work: 'presencial',
      benefits: '',
      requirements: '',
      notes: '',
    }
  })

  const createJobOfferMutation = useMutation({
    mutationFn: async (data: JobOfferFormData) => {
      // Primero crear la oferta
      const { data: jobOffer, error: offerError } = await supabase
        .from('job_offers')
        .insert({
          org_id: user?.org_id,
          candidate_id: data.candidate_id,
          candidate_email: candidates.find(c => c.id === data.candidate_id)?.email || candidate?.email,
          candidate_name: `${candidates.find(c => c.id === data.candidate_id)?.first_name || candidate?.first_name} ${candidates.find(c => c.id === data.candidate_id)?.last_name || candidate?.last_name}`,
          title: data.title,
          department: data.department || null,
          salary_amount: data.salary_offered,
          salary_currency: data.salary_currency,
          start_date: data.start_date.toISOString().split('T')[0],
          work_schedule: data.work_schedule,
          work_location: data.remote_work,
          remote_work_allowed: data.remote_work !== 'presencial',
          benefits: data.benefits ? JSON.parse(`["${data.benefits}"]`) : null,
          requirements: data.requirements ? JSON.parse(`["${data.requirements}"]`) : null,
          expires_at: data.offer_expiry_date?.toISOString() || null,
          additional_notes: data.notes || null,
          status: 'draft',
          created_by: user?.id
        })
        .select()
        .single()
      
      if (offerError) throw offerError

      // Actualizar estado del candidato a "offer_sent"
      const { error: candidateError } = await supabase
        .from('candidates')
        .update({ status: 'offer_sent' })
        .eq('id', data.candidate_id)

      if (candidateError) throw candidateError

      return jobOffer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['recruitment-stats'] })
      queryClient.invalidateQueries({ queryKey: ['job-offers'] })
      toast.success('Oferta creada correctamente')
      onClose()
      form.reset()
    },
    onError: (error) => {
      toast.error('No se pudo crear la oferta de trabajo')
      console.error(error)
    }
  })

  const onSubmit = (data: JobOfferFormData) => {
    createJobOfferMutation.mutate(data)
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[10px] border-0.5 border-foreground">
        <DialogHeader>
          <DialogTitle>Crear Oferta de Trabajo</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Candidato */}
            <FormField
              control={form.control}
              name="candidate_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Candidato *</FormLabel>
                  {candidate ? (
                    <div className="p-3 border border-border rounded-[10px] bg-muted">
                      <span className="font-medium">{candidate.first_name} {candidate.last_name}</span>
                      <span className="text-sm text-muted-foreground ml-2">({candidate.email})</span>
                    </div>
                  ) : (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-[10px] border-0.5 border-foreground">
                          <SelectValue placeholder="Seleccionar candidato..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {candidatesLoading ? (
                          <SelectItem value="" disabled>Cargando...</SelectItem>
                        ) : candidates.length > 0 ? (
                          candidates.map((cand) => (
                            <SelectItem key={cand.id} value={cand.id}>
                              {cand.first_name} {cand.last_name} ({cand.email})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>No hay candidatos disponibles</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Título y departamento */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del Puesto *</FormLabel>
                    <FormControl>
                      <Input className="rounded-[10px] border-0.5 border-foreground" {...field} />
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

            {/* Descripción - Removido ya que no existe en la tabla */}

            {/* Salario */}
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

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
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
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="offer_expiry_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Expiración</FormLabel>
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
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Condiciones */}
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
                        <SelectItem value="completa">Completa</SelectItem>
                        <SelectItem value="parcial">Parcial</SelectItem>
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
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="remoto">Remoto</SelectItem>
                        <SelectItem value="hibrido">Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Beneficios */}
            <FormField
              control={form.control}
              name="benefits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beneficios</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="rounded-[10px] border-0.5 border-foreground" 
                      rows={3}
                      placeholder="Seguro médico, formación, teletrabajo, etc..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Requisitos */}
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requisitos</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="rounded-[10px] border-0.5 border-foreground" 
                      rows={3}
                      placeholder="Experiencia, formación, idiomas, etc..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Internas</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="rounded-[10px] border-0.5 border-foreground" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="rounded-[10px] border-0.5 border-foreground">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createJobOfferMutation.isPending}
                className="rounded-[10px]"
              >
                Crear Oferta
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}