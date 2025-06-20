
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Case } from '@/hooks/useCases'
import { useToast } from '@/hooks/use-toast'

const caseSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'pending', 'closed']),
  client_id: z.string().min(1, 'Debe seleccionar un cliente'),
})

type CaseFormData = z.infer<typeof caseSchema>

interface CaseFormDialogProps {
  case_: Case | null
  open: boolean
  onClose: () => void
}

export const CaseFormDialog = ({ case_, open, onClose }: CaseFormDialogProps) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'open',
      client_id: '',
    },
  })

  const { data: clients = [] } = useQuery({
    queryKey: ['clients-for-cases', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('status', 'activo')
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id && open,
  })

  useEffect(() => {
    if (case_) {
      form.reset({
        title: case_.title,
        description: case_.description || '',
        status: case_.status as 'open' | 'in_progress' | 'pending' | 'closed',
        client_id: case_.client_id,
      })
    } else {
      form.reset({
        title: '',
        description: '',
        status: 'open',
        client_id: '',
      })
    }
  }, [case_, form])

  const createCaseMutation = useMutation({
    mutationFn: async (data: CaseFormData) => {
      const { error } = await supabase
        .from('cases')
        .insert({
          ...data,
          org_id: user?.org_id!,
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      queryClient.invalidateQueries({ queryKey: ['client-cases'] })
      toast({
        title: 'Caso creado',
        description: 'El caso se ha creado correctamente.',
      })
      onClose()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo crear el caso. Inténtalo de nuevo.',
        variant: 'destructive',
      })
      console.error('Error creating case:', error)
    },
  })

  const updateCaseMutation = useMutation({
    mutationFn: async (data: CaseFormData) => {
      const { error } = await supabase
        .from('cases')
        .update(data)
        .eq('id', case_!.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      queryClient.invalidateQueries({ queryKey: ['client-cases'] })
      toast({
        title: 'Caso actualizado',
        description: 'El caso se ha actualizado correctamente.',
      })
      onClose()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el caso. Inténtalo de nuevo.',
        variant: 'destructive',
      })
      console.error('Error updating case:', error)
    },
  })

  const onSubmit = async (data: CaseFormData) => {
    setIsSubmitting(true)
    
    try {
      if (case_) {
        await updateCaseMutation.mutateAsync(data)
      } else {
        await createCaseMutation.mutateAsync(data)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusOptions = [
    { value: 'open', label: 'Abierto' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'closed', label: 'Cerrado' },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {case_ ? 'Editar Caso' : 'Nuevo Caso'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del Caso *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Declaración de la Renta 2024" {...field} />
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
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción detallada del caso..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : (case_ ? 'Actualizar' : 'Crear Caso')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
