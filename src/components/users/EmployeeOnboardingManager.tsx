import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { UserPlus, Mail, Clock, CheckCircle, XCircle, Copy, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface EmployeeOnboardingForm {
  email: string
  position_title: string
  department_id: string
  salary: string
  start_date: string
  schedule: string
  notes: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-chart-4/10 text-chart-4 border-chart-4/20'
    case 'in_progress':
      return 'bg-chart-1/10 text-chart-1 border-chart-1/20'
    case 'completed':
      return 'bg-chart-2/10 text-chart-2 border-chart-2/20'
    case 'expired':
      return 'bg-destructive/10 text-destructive border-destructive/20'
    default:
      return 'bg-muted/50 text-muted-foreground border-border'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendiente'
    case 'in_progress':
      return 'En Progreso'
    case 'completed':
      return 'Completado'
    case 'expired':
      return 'Expirado'
    default:
      return status
  }
}

export const EmployeeOnboardingManager = () => {
  const { user } = useApp()
  // Using toast from sonner
  const queryClient = useQueryClient()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState<EmployeeOnboardingForm>({
    email: '',
    position_title: '',
    department_id: '',
    salary: '',
    start_date: '',
    schedule: '',
    notes: ''
  })

  // Obtener departamentos
  const { data: departments = [] } = useQuery({
    queryKey: ['departments', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      return data
    },
    enabled: !!user?.org_id
  })

  // Obtener onboardings
  const { data: onboardings = [], isLoading } = useQuery({
    queryKey: ['employee-onboardings', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      const { data, error } = await supabase
        .from('employee_onboarding')
        .select(`
          *,
          department:departments(name),
          created_by_user:users!employee_onboarding_created_by_fkey(email)
        `)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!user?.org_id
  })

  // Crear onboarding
  const createOnboarding = useMutation({
    mutationFn: async (data: EmployeeOnboardingForm) => {
      if (!user?.org_id) throw new Error('No org_id')
      
      const token = await supabase.rpc('generate_onboarding_token')
      if (!token.data) throw new Error('Error generando token')

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // Expira en 7 días

      const { error } = await supabase
        .from('employee_onboarding')
        .insert({
          org_id: user.org_id,
          token: token.data,
          email: data.email,
          position_title: data.position_title,
          department_id: data.department_id || null,
          job_data: {
            salary: data.salary,
            start_date: data.start_date,
            schedule: data.schedule,
            notes: data.notes
          },
          expires_at: expiresAt.toISOString(),
          created_by: user.id
        })

      if (error) throw error

      return { token: token.data }
    },
    onSuccess: (data) => {
      toast.success("Invitación creada", {
        description: "Se ha generado el enlace de onboarding"
      })
      queryClient.invalidateQueries({ queryKey: ['employee-onboardings'] })
      setIsCreateDialogOpen(false)
      setFormData({
        email: '',
        position_title: '',
        department_id: '',
        salary: '',
        start_date: '',
        schedule: '',
        notes: ''
      })

      // Copiar enlace al portapapeles
      const link = `${window.location.origin}/employee-onboarding?token=${data.token}`
      navigator.clipboard.writeText(link)
      toast.success("Enlace copiado", {
        description: "El enlace de onboarding se ha copiado al portapapeles"
      })
    },
    onError: (error: any) => {
      toast.error("Error", {
        description: error.message
      })
    }
  })

  const copyOnboardingLink = (token: string) => {
    const link = `${window.location.origin}/employee-onboarding?token=${token}`
    navigator.clipboard.writeText(link)
    toast.success("Enlace copiado", {
      description: "El enlace de onboarding se ha copiado al portapapeles"
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createOnboarding.mutate(formData)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Onboarding de Empleados
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gestiona el proceso de incorporación de nuevos empleados
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Nueva Invitación
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Invitación de Onboarding</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email del Empleado *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="position_title">Puesto de Trabajo *</Label>
                      <Input
                        id="position_title"
                        value={formData.position_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, position_title: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department_id">Departamento</Label>
                      <Select
                        value={formData.department_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, department_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="salary">Salario Bruto Anual</Label>
                      <Input
                        id="salary"
                        value={formData.salary}
                        onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                        placeholder="€30,000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Fecha de Inicio</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="schedule">Horario</Label>
                      <Input
                        id="schedule"
                        value={formData.schedule}
                        onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                        placeholder="L-V 9:00-18:00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notas Adicionales</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Información adicional sobre el puesto o proceso"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createOnboarding.isPending}
                    >
                      {createOnboarding.isPending ? 'Creando...' : 'Crear Invitación'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de onboardings */}
      <Card>
        <CardHeader>
          <CardTitle>Procesos de Onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          {onboardings.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">No hay procesos de onboarding activos</p>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
                Crear primera invitación
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {onboardings.map((onboarding) => (
                <div key={onboarding.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{onboarding.email}</h3>
                        <Badge variant="outline" className={getStatusColor(onboarding.status)}>
                          {getStatusLabel(onboarding.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{onboarding.position_title}</p>
                      {onboarding.department && (
                        <p className="text-sm text-muted-foreground">
                          Departamento: {onboarding.department.name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Creado: {format(new Date(onboarding.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expira: {format(new Date(onboarding.expires_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {onboarding.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyOnboardingLink(onboarding.token)}
                          className="gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copiar Enlace
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}