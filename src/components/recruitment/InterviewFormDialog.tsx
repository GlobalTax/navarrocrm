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
import { type Candidate, type CreateInterviewData, INTERVIEW_TYPE_LABELS } from '@/types/recruitment'
import { cn } from '@/lib/utils'

const interviewSchema = z.object({
  candidate_id: z.string().min(1, 'Candidato requerido'),
  interview_type: z.enum(['technical', 'cultural', 'management', 'hr']),
  scheduled_at: z.date({ required_error: 'Fecha y hora requerida' }),
  duration_minutes: z.number().min(15, 'Mínimo 15 minutos').max(480, 'Máximo 8 horas'),
  interviewer_id: z.string().min(1, 'Entrevistador requerido'),
  location: z.string().optional(),
  meeting_url: z.string().url('URL inválida').optional().or(z.literal('')),
  interview_round: z.number().min(1, 'Mínimo ronda 1').default(1),
})

type InterviewFormData = z.infer<typeof interviewSchema>

interface InterviewFormDialogProps {
  open: boolean
  onClose: () => void
  candidate?: Candidate | null
}

export function InterviewFormDialog({ open, onClose, candidate }: InterviewFormDialogProps) {
  const { user } = useApp()
  const queryClient = useQueryClient()

  // Query para obtener usuarios que pueden ser entrevistadores
  const { data: interviewers = [], isLoading: interviewersLoading } = useQuery({
    queryKey: ['interviewers', user?.org_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('org_id', user?.org_id)
        .in('role', ['partner', 'area_manager', 'senior', 'junior'])
        .order('email')
      
      if (error) {
        console.error('Error fetching interviewers:', error)
        throw error
      }
      return data || []
    },
    enabled: !!user?.org_id && open
  })

  // Query para obtener candidatos (si no se proporciona uno específico)
  const { data: candidates = [], isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidates-for-interview', user?.org_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('id, first_name, last_name, email, status')
        .eq('org_id', user?.org_id)
        .in('status', ['new', 'screening', 'interviewing'])
        .order('first_name')
      
      if (error) throw error
      return data as Candidate[]
    },
    enabled: !!user?.org_id && open && !candidate
  })

  const form = useForm<InterviewFormData>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      candidate_id: candidate?.id || '',
      interview_type: 'technical',
      duration_minutes: 60,
      interview_round: 1,
      location: '',
      meeting_url: '',
    }
  })

  const createInterviewMutation = useMutation({
    mutationFn: async (data: CreateInterviewData) => {
      const { error } = await supabase
        .from('interviews')
        .insert({
          ...data,
          org_id: user?.org_id,
          status: 'scheduled',
          created_by: user?.id
        })
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-interviews'] })
      queryClient.invalidateQueries({ queryKey: ['candidate-interviews'] })
      queryClient.invalidateQueries({ queryKey: ['recruitment-stats'] })
      toast.success('Entrevista programada correctamente')
      onClose()
      form.reset()
    },
    onError: (error) => {
      toast.error('No se pudo programar la entrevista')
      console.error(error)
    }
  })

  const onSubmit = (data: InterviewFormData) => {
    createInterviewMutation.mutate({
      candidate_id: data.candidate_id,
      interview_type: data.interview_type,
      scheduled_at: data.scheduled_at.toISOString(),
      duration_minutes: data.duration_minutes,
      interviewer_id: data.interviewer_id,
      location: data.location || undefined,
      meeting_url: data.meeting_url || undefined,
      interview_round: data.interview_round,
    })
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl rounded-[10px] border-0.5 border-foreground">
        <DialogHeader>
          <DialogTitle>Programar Entrevista</DialogTitle>
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
                           <SelectItem value="loading" disabled>Cargando...</SelectItem>
                         ) : candidates.length > 0 ? (
                           candidates.map((cand) => (
                             <SelectItem key={cand.id} value={cand.id}>
                               {cand.first_name} {cand.last_name} ({cand.email})
                             </SelectItem>
                           ))
                         ) : (
                           <SelectItem value="no-candidates" disabled>No hay candidatos disponibles</SelectItem>
                         )}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de entrevista y entrevistador */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interview_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Entrevista *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-[10px] border-0.5 border-foreground">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(INTERVIEW_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
                name="interviewer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entrevistador *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-[10px] border-0.5 border-foreground">
                          <SelectValue placeholder="Seleccionar entrevistador..." />
                        </SelectTrigger>
                      </FormControl>
                       <SelectContent>
                         {interviewersLoading ? (
                           <SelectItem value="loading" disabled>Cargando...</SelectItem>
                           ) : interviewers.length > 0 ? (
                             interviewers.map((interviewer) => (
                               <SelectItem key={interviewer.id} value={interviewer.id}>
                                 {interviewer.email} - {interviewer.role}
                               </SelectItem>
                             ))
                           ) : (
                             <SelectItem value="no-interviewers" disabled>No hay entrevistadores disponibles</SelectItem>
                           )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fecha y duración */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduled_at"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha y Hora *</FormLabel>
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
                              format(field.value, "PPP p")
                            ) : (
                              <span>Seleccionar fecha y hora</span>
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
                        <div className="p-3 border-t">
                          <Input
                            type="time"
                            value={field.value ? format(field.value, "HH:mm") : ""}
                            onChange={(e) => {
                              if (field.value && e.target.value) {
                                const [hours, minutes] = e.target.value.split(':')
                                const newDate = new Date(field.value)
                                newDate.setHours(parseInt(hours), parseInt(minutes))
                                field.onChange(newDate)
                              }
                            }}
                            className="rounded-[10px] border-0.5 border-foreground"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (minutos) *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="rounded-[10px] border-0.5 border-foreground">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="90">1.5 horas</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                        <SelectItem value="180">3 horas</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ronda y ubicación */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interview_round"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ronda de Entrevista</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="10"
                        className="rounded-[10px] border-0.5 border-foreground" 
                        {...field} 
                        onChange={e => field.onChange(Number(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Sala de reuniones, oficina..."
                        className="rounded-[10px] border-0.5 border-foreground" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* URL de reunión */}
            <FormField
              control={form.control}
              name="meeting_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de Reunión Virtual</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://meet.google.com/..."
                      className="rounded-[10px] border-0.5 border-foreground" 
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
                disabled={createInterviewMutation.isPending}
                className="rounded-[10px]"
              >
                Programar Entrevista
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}