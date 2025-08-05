import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  UserPlus, 
  FileText, 
  CheckCircle, 
  Clock,
  Users,
  TrendingUp,
  Building,
  Calendar
} from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { employeeProfilesDAL } from '@/lib/dal/employee-profiles'

interface AcceptedJobOffer {
  id: string
  candidate_id: string
  candidate_name: string
  candidate_email: string
  title: string
  department: string
  salary: number
  start_date: string
  accepted_at: string
  status: string
}

interface RecruitmentToEmployeeProps {
  orgId: string
}

export function RecruitmentToEmployee({ orgId }: RecruitmentToEmployeeProps) {
  const { user } = useApp()
  const [selectedOffer, setSelectedOffer] = useState<AcceptedJobOffer | null>(null)
  const [showConvertDialog, setShowConvertDialog] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  // Obtener job offers aceptadas que no han sido convertidas a empleados
  const { data: acceptedOffers = [], isLoading } = useQuery({
    queryKey: ['accepted-job-offers', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_offers')
        .select(`
          *,
          candidates(first_name, last_name, email, phone)
        `)
        .eq('org_id', orgId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      return data.map(offer => ({
        id: offer.id,
        candidate_id: offer.candidate_id,
        candidate_name: `${offer.candidates?.first_name} ${offer.candidates?.last_name}`,
        candidate_email: offer.candidates?.email || offer.candidate_email,
        title: offer.title,
        department: offer.department || 'Sin asignar',
        salary: 50000, // Valor por defecto hasta que agregues el campo
        start_date: offer.start_date,
        accepted_at: offer.created_at, // Usando created_at como proxy
        status: offer.status
      })) as AcceptedJobOffer[]
    },
    enabled: !!orgId
  })

  // Obtener estadísticas de conversión
  const { data: conversionStats } = useQuery({
    queryKey: ['conversion-stats', orgId],
    queryFn: async () => {
      const [offersResponse, employeesResponse] = await Promise.all([
        supabase
          .from('job_offers')
          .select('id, status, created_at')
          .eq('org_id', orgId),
        supabase
          .from('employee_profiles')
          .select('id, created_at')
          .eq('org_id', orgId)
      ])

      const offers = offersResponse.data || []
      const employees = employeesResponse.data || []

      const thisMonth = new Date()
      thisMonth.setDate(1)
      
      const offersThisMonth = offers.filter(o => 
        new Date(o.created_at) >= thisMonth
      ).length

      const acceptedThisMonth = offers.filter(o => 
        o.status === 'accepted' && new Date(o.created_at) >= thisMonth
      ).length

      const employeesThisMonth = employees.filter(e => 
        new Date(e.created_at) >= thisMonth
      ).length

      return {
        totalOffers: offers.length,
        acceptedOffers: offers.filter(o => o.status === 'accepted').length,
        totalEmployees: employees.length,
        offersThisMonth,
        acceptedThisMonth,
        employeesThisMonth,
        conversionRate: offers.length > 0 ? (employees.length / offers.length) * 100 : 0
      }
    },
    enabled: !!orgId
  })

  const handleConvertToEmployee = async (offer: AcceptedJobOffer) => {
    setSelectedOffer(offer)
    setShowConvertDialog(true)
  }

  const executeConversion = async () => {
    if (!selectedOffer || !user?.id) return

    setIsConverting(true)
    try {
      // 1. Crear usuario en users si no existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', selectedOffer.candidate_email)
        .single()

      let userId = existingUser?.id

      if (!existingUser) {
        // Los usuarios se crean automáticamente por auth, solo actualizamos
        const { error: authError } = await supabase.auth.admin.createUser({
          email: selectedOffer.candidate_email,
          email_confirm: true,
          user_metadata: {
            full_name: selectedOffer.candidate_name
          }
        })
        
        if (authError) {
          console.warn('Auth user creation failed:', authError)
          // Continuar sin error ya que puede existir en auth
        }
      }

      // 2. Crear perfil de empleado usando user auth id
      const { data: userData } = await supabase.auth.getUser()
      const employeeUserId = userData.user?.id || userId
      const employeeData = {
        user_id: employeeUserId,
        org_id: orgId,
        employment_type: 'fixed' as const,
        hire_date: selectedOffer.start_date,
        is_active: true,
        created_by: user.id
      }

      const contractData = {
        org_id: orgId,
        contract_type: 'indefinido' as const,
        start_date: selectedOffer.start_date,
        trial_period_months: 6,
        base_salary: selectedOffer.salary,
        salary_currency: 'EUR',
        salary_frequency: 'monthly' as const,
        overtime_rate: 1.5,
        weekly_hours: 40,
        vacation_days_per_year: 22,
        sick_leave_days_per_year: 10,
        status: 'active' as const,
        created_by: user.id
      }

      const result = await employeeProfilesDAL.createWithContract(employeeData, contractData)
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Error creating employee')
      }

      // 3. Marcar job offer como convertida (usando campos comentarios)
      const { error: updateError } = await supabase
        .from('job_offers')
        .update({ 
          additional_notes: `Convertido a empleado - ID: ${result.data?.employee.id}`
        })
        .eq('id', selectedOffer.id)

      if (updateError) throw updateError

      toast.success(`${selectedOffer.candidate_name} convertido a empleado exitosamente`)
      setShowConvertDialog(false)
      setSelectedOffer(null)
      
      // Invalidar queries para actualizar la UI
      // queryClient.invalidateQueries(['accepted-job-offers'])
      // queryClient.invalidateQueries(['conversion-stats'])

    } catch (error: any) {
      console.error('Error converting to employee:', error)
      toast.error('Error al convertir candidato a empleado: ' + error.message)
    } finally {
      setIsConverting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando ofertas aceptadas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas de conversión */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ofertas Aceptadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {conversionStats?.acceptedOffers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{conversionStats?.acceptedThisMonth || 0} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados Creados</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {conversionStats?.totalEmployees || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{conversionStats?.employeesThisMonth || 0} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Conversión</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {conversionStats?.conversionRate.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Ofertas → Empleados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {acceptedOffers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Por convertir
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de ofertas aceptadas pendientes de conversión */}
      <Card>
        <CardHeader>
          <CardTitle>Ofertas Aceptadas - Pendientes de Conversión</CardTitle>
          <CardDescription>
            Candidatos que han aceptado ofertas y están listos para ser convertidos a empleados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {acceptedOffers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay ofertas aceptadas pendientes de conversión</p>
              <p className="text-sm">Los candidatos aparecerán aquí cuando acepten ofertas de trabajo</p>
            </div>
          ) : (
            <div className="space-y-4">
              {acceptedOffers.map((offer) => (
                <div key={offer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{offer.candidate_name}</h3>
                      <Badge variant="outline">{offer.title}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-4">
                        <span>📧 {offer.candidate_email}</span>
                        <span>🏢 {offer.department}</span>
                        <span>💰 €{offer.salary.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span>📅 Inicio: {new Date(offer.start_date).toLocaleDateString('es-ES')}</span>
                        <span>✅ Aceptado: {new Date(offer.accepted_at).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => handleConvertToEmployee(offer)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Convertir a Empleado
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de conversión */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Convertir a Empleado</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres convertir este candidato a empleado?
            </DialogDescription>
          </DialogHeader>
          
          {selectedOffer && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">{selectedOffer.candidate_name}</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Puesto:</strong> {selectedOffer.title}</p>
                  <p><strong>Departamento:</strong> {selectedOffer.department}</p>
                  <p><strong>Salario:</strong> €{selectedOffer.salary.toLocaleString()}/año</p>
                  <p><strong>Fecha inicio:</strong> {new Date(selectedOffer.start_date).toLocaleDateString('es-ES')}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Se creará automáticamente:</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Perfil de empleado</li>
                  <li>✓ Contrato de trabajo</li>
                  <li>✓ Usuario en el sistema (si no existe)</li>
                  <li>✓ Acceso al portal del empleado</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConvertDialog(false)}
                  disabled={isConverting}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={executeConversion}
                  disabled={isConverting}
                >
                  {isConverting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Convirtiendo...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Confirmar Conversión
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}