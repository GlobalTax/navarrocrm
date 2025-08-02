import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useEmployees } from '@/hooks/useEmployees'
import { EmployeeContractDialog } from './EmployeeContractDialog'
import { EmployeeSalaryDialog } from './EmployeeSalaryDialog'
import { EmployeeBenefitsDialog } from './EmployeeBenefitsDialog'
import { EmployeeDetailsDialog } from './EmployeeDetailsDialog'
import { 
  Search, 
  Plus, 
  FileText, 
  DollarSign, 
  Gift, 
  Eye,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react'
import type { EmployeeWithContract } from '@/types/employees'

export const EmployeeManagement = () => {
  const { employees, isLoading } = useEmployees()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithContract | null>(null)
  const [showContractDialog, setShowContractDialog] = useState(false)
  const [showSalaryDialog, setShowSalaryDialog] = useState(false)
  const [showBenefitsDialog, setShowBenefitsDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const filteredEmployees = employees.filter(employee => 
    employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.contract?.position?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U'
  }

  const getContractTypeColor = (type?: string) => {
    switch (type) {
      case 'indefinido': return 'bg-green-100 text-green-800 border-green-200'
      case 'temporal': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'practicas': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'freelance': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatSalary = (amount?: number, frequency?: string) => {
    if (!amount) return 'No definido'
    const formatted = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
    return `${formatted}${frequency === 'monthly' ? '/mes' : '/año'}`
  }

  const handleCreateContract = (employee: EmployeeWithContract) => {
    setSelectedEmployee(employee)
    setShowContractDialog(true)
  }

  const handleManageSalary = (employee: EmployeeWithContract) => {
    setSelectedEmployee(employee)
    setShowSalaryDialog(true)
  }

  const handleManageBenefits = (employee: EmployeeWithContract) => {
    setSelectedEmployee(employee)
    setShowBenefitsDialog(true)
  }

  const handleViewDetails = (employee: EmployeeWithContract) => {
    setSelectedEmployee(employee)
    setShowDetailsDialog(true)
  }

  // Calculate statistics
  const activeContracts = employees.filter(e => e.contract?.status === 'active').length
  const totalSalaryBudget = employees.reduce((sum, e) => {
    if (e.contract?.salary_amount && e.contract.salary_frequency === 'monthly') {
      return sum + (e.contract.salary_amount * 12)
    }
    return sum + (e.contract?.salary_amount || 0)
  }, 0)
  const avgSalary = activeContracts > 0 ? totalSalaryBudget / activeContracts : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Empleados Activos</p>
                <p className="text-2xl font-bold">{activeContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Presupuesto Anual</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0
                  }).format(totalSalaryBudget)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Salario Promedio</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0
                  }).format(avgSalary)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Empleados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar empleados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Employee List */}
          <div className="space-y-4">
            {filteredEmployees.map(employee => (
              <Card key={employee.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(employee.first_name, employee.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {employee.first_name} {employee.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                        {employee.contract && (
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getContractTypeColor(employee.contract.contract_type)}>
                              {employee.contract.contract_type}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {employee.contract.position}
                            </span>
                            <span className="text-sm font-medium">
                              {formatSalary(employee.contract.salary_amount, employee.contract.salary_frequency)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {employee.contract ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(employee)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detalles
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManageSalary(employee)}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Salario
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManageBenefits(employee)}
                          >
                            <Gift className="h-4 w-4 mr-1" />
                            Beneficios
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleCreateContract(employee)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Crear Contrato
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron empleados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EmployeeContractDialog
        open={showContractDialog}
        onOpenChange={setShowContractDialog}
        employee={selectedEmployee}
      />
      
      <EmployeeSalaryDialog
        open={showSalaryDialog}
        onOpenChange={setShowSalaryDialog}
        employee={selectedEmployee}
      />
      
      <EmployeeBenefitsDialog
        open={showBenefitsDialog}
        onOpenChange={setShowBenefitsDialog}
        employee={selectedEmployee}
      />
      
      <EmployeeDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        employee={selectedEmployee}
      />
    </div>
  )
}