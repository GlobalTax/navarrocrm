import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEmployees } from '@/hooks/useEmployees'
import { 
  FileText, 
  DollarSign, 
  Gift, 
  Calendar,
  Clock,
  MapPin,
  User
} from 'lucide-react'
import type { EmployeeWithContract, EmployeeContract, EmployeeSalary, EmployeeBenefit } from '@/types/employees'

interface EmployeeDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: EmployeeWithContract | null
}

export const EmployeeDetailsDialog = ({ open, onOpenChange, employee }: EmployeeDetailsDialogProps) => {
  const { fetchEmployeeDetails } = useEmployees()
  const [employeeDetails, setEmployeeDetails] = useState<{
    contract: EmployeeContract | null
    salaries: EmployeeSalary[]
    benefits: EmployeeBenefit[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && employee) {
      setIsLoading(true)
      fetchEmployeeDetails(employee.id)
        .then(details => {
          setEmployeeDetails(details)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [open, employee, fetchEmployeeDetails])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const formatSalary = (amount: number, frequency: string) => {
    const formatted = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
    return `${formatted}${frequency === 'monthly' ? '/mes' : '/año'}`
  }

  const getContractTypeColor = (type: string) => {
    switch (type) {
      case 'indefinido': return 'bg-green-100 text-green-800 border-green-200'
      case 'temporal': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'practicas': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'freelance': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'increase': return 'text-green-600'
      case 'decrease': return 'text-red-600'
      case 'bonus': return 'text-blue-600'
      case 'adjustment': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const benefitTypeLabels = {
    health_insurance: 'Seguro Médico',
    dental: 'Seguro Dental',
    transport: 'Transporte',
    meal: 'Comida',
    phone: 'Teléfono',
    education: 'Formación',
    other: 'Otro'
  }

  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Detalles del Empleado - {employee.first_name} {employee.last_name}</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <Tabs defaultValue="contract" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="contract" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Contrato</span>
              </TabsTrigger>
              <TabsTrigger value="salary" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Salarios</span>
              </TabsTrigger>
              <TabsTrigger value="benefits" className="flex items-center space-x-2">
                <Gift className="h-4 w-4" />
                <span>Beneficios</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contract" className="mt-4">
              {employeeDetails?.contract ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Información Contractual
                      <Badge className={getContractTypeColor(employeeDetails.contract.contract_type)}>
                        {employeeDetails.contract.contract_type}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Puesto</p>
                        <p className="font-medium">{employeeDetails.contract.position}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <Badge variant={employeeDetails.contract.status === 'active' ? 'default' : 'secondary'}>
                          {employeeDetails.contract.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
                        <p className="font-medium flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(employeeDetails.contract.start_date)}</span>
                        </p>
                      </div>
                      {employeeDetails.contract.end_date && (
                        <div>
                          <p className="text-sm text-muted-foreground">Fecha de Fin</p>
                          <p className="font-medium flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(employeeDetails.contract.end_date)}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Salario Actual</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatSalary(employeeDetails.contract.salary_amount, employeeDetails.contract.salary_frequency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Horas Semanales</p>
                        <p className="font-medium flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{employeeDetails.contract.working_hours}h</span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Días de Vacaciones</p>
                      <p className="font-medium">{employeeDetails.contract.vacation_days} días/año</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No hay información contractual disponible</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="salary" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Salarios</CardTitle>
                </CardHeader>
                <CardContent>
                  {employeeDetails?.salaries && employeeDetails.salaries.length > 0 ? (
                    <div className="space-y-4">
                      {employeeDetails.salaries.map(salary => (
                        <div key={salary.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {formatSalary(salary.new_salary, salary.salary_frequency)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Efectivo desde {formatDate(salary.effective_date)}
                              </p>
                              {salary.change_reason && (
                                <p className="text-sm mt-1">{salary.change_reason}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge className={getChangeTypeColor(salary.change_type)}>
                                {salary.change_type}
                              </Badge>
                              {salary.previous_salary && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Anterior: {formatSalary(salary.previous_salary, salary.salary_frequency)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No hay historial de salarios</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benefits" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Beneficios Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  {employeeDetails?.benefits && employeeDetails.benefits.length > 0 ? (
                    <div className="space-y-4">
                      {employeeDetails.benefits.map(benefit => (
                        <div key={benefit.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{benefit.benefit_name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {benefitTypeLabels[benefit.benefit_type] || benefit.benefit_type}
                              </p>
                              {benefit.description && (
                                <p className="text-sm mt-1">{benefit.description}</p>
                              )}
                              <p className="text-sm text-muted-foreground mt-1">
                                Desde {formatDate(benefit.start_date)}
                                {benefit.end_date && ` hasta ${formatDate(benefit.end_date)}`}
                              </p>
                            </div>
                            <div className="text-right">
                              {benefit.benefit_value && (
                                <p className="font-medium text-green-600">
                                  {new Intl.NumberFormat('es-ES', {
                                    style: 'currency',
                                    currency: 'EUR'
                                  }).format(benefit.benefit_value)}/mes
                                </p>
                              )}
                              <Badge variant={benefit.is_active ? 'default' : 'secondary'}>
                                {benefit.is_active ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No hay beneficios activos</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}