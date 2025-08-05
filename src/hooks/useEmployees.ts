import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  employeeProfilesDAL, 
  employmentContractsDAL, 
  salaryHistoryDAL,
  employeeEducationDAL,
  autonomousCollaboratorsDAL,
  timeAttendanceDAL,
  leaveRequestsDAL,
  type EmployeeProfile,
  type EmploymentContract,
  type SalaryHistory,
  type EmployeeEducation,
  type AutonomousCollaborator,
  type TimeAttendance,
  type LeaveRequest
} from '@/lib/dal'
import { toast } from 'sonner'

export const useEmployees = (orgId: string) => {
  const queryClient = useQueryClient()

  // Query para obtener todos los empleados activos
  const employeesQuery = useQuery({
    queryKey: ['employees', orgId],
    queryFn: async () => {
      const result = await employeeProfilesDAL.findActiveEmployees(orgId)
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al cargar empleados')
      }
      return result
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  // Query para empleados por tipo
  const employeesByTypeQuery = (employmentType: string) => useQuery({
    queryKey: ['employees', 'by-type', orgId, employmentType],
    queryFn: async () => {
      const result = await employeeProfilesDAL.findByEmploymentType(orgId, employmentType)
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al cargar empleados')
      }
      return result
    },
    enabled: !!orgId && !!employmentType
  })

  // Query para estadísticas de empleados
  const employeeStatsQuery = useQuery({
    queryKey: ['employee-stats', orgId],
    queryFn: async () => {
      const result = await employeeProfilesDAL.getEmployeeStats(orgId)
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al cargar estadísticas')
      }
      return result
    },
    enabled: !!orgId
  })

  // Mutation para crear empleado con contrato
  const createEmployeeMutation = useMutation({
    mutationFn: async (data: { 
      employee: Partial<EmployeeProfile>; 
      contract: Partial<EmploymentContract> 
    }) => {
      const result = await employeeProfilesDAL.createWithContract(
        data.employee, 
        data.contract
      )
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al crear empleado')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] })
      toast.success('Empleado creado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear empleado')
    }
  })

  // Mutation para actualizar empleado
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EmployeeProfile> }) => {
      const result = await employeeProfilesDAL.update(id, data)
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al actualizar empleado')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Empleado actualizado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar empleado')
    }
  })

  // Mutation para eliminar empleado
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await employeeProfilesDAL.delete(id)
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al eliminar empleado')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] })
      toast.success('Empleado eliminado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar empleado')
    }
  })

  return {
    // Data
    employees: employeesQuery.data?.data || [],
    employeeStats: employeeStatsQuery.data?.data,
    isLoading: employeesQuery.isLoading,
    error: employeesQuery.error,
    
    // Queries
    employeesByType: employeesByTypeQuery,
    
    // Actions
    createEmployee: createEmployeeMutation.mutate,
    updateEmployee: updateEmployeeMutation.mutate,
    deleteEmployee: deleteEmployeeMutation.mutate,
    
    // Status
    isCreating: createEmployeeMutation.isPending,
    isUpdating: updateEmployeeMutation.isPending,
    isDeleting: deleteEmployeeMutation.isPending,
    
    // Utils
    refetch: employeesQuery.refetch
  }
}

// Hook específico para contratos
export const useEmploymentContracts = (employeeProfileId?: string) => {
  const queryClient = useQueryClient()

  const contractsQuery = useQuery({
    queryKey: ['employment-contracts', employeeProfileId],
    queryFn: async () => {
      if (!employeeProfileId) return { data: [], error: null, success: true }
      const result = await employmentContractsDAL.findByEmployeeProfile(employeeProfileId)
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al cargar contratos')
      }
      return result
    },
    enabled: !!employeeProfileId
  })

  const createContractMutation = useMutation({
    mutationFn: async (data: Partial<EmploymentContract>) => {
      const result = await employmentContractsDAL.create(data)
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al crear contrato')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-contracts'] })
      toast.success('Contrato creado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear contrato')
    }
  })

  return {
    contracts: contractsQuery.data?.data || [],
    isLoading: contractsQuery.isLoading,
    createContract: createContractMutation.mutate,
    isCreating: createContractMutation.isPending
  }
}

// Hook para historial salarial
export const useSalaryHistory = (employeeProfileId?: string) => {
  const queryClient = useQueryClient()

  const salaryHistoryQuery = useQuery({
    queryKey: ['salary-history', employeeProfileId],
    queryFn: async () => {
      if (!employeeProfileId) return { data: [], error: null, success: true }
      const result = await salaryHistoryDAL.findByEmployeeProfile(employeeProfileId)
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al cargar historial salarial')
      }
      return result
    },
    enabled: !!employeeProfileId
  })

  const currentSalaryQuery = useQuery({
    queryKey: ['current-salary', employeeProfileId],
    queryFn: async () => {
      if (!employeeProfileId) return { data: null, error: null, success: true }
      const result = await salaryHistoryDAL.getCurrentSalary(employeeProfileId)
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al cargar salario actual')
      }
      return result
    },
    enabled: !!employeeProfileId
  })

  const createSalaryChangeMutation = useMutation({
    mutationFn: async (data: {
      employeeProfileId: string
      newSalary: number
      changeType: SalaryHistory['change_type']
      reason?: string
      effectiveDate?: string
    }) => {
      const result = await salaryHistoryDAL.createSalaryChange(
        data.employeeProfileId,
        data.newSalary,
        data.changeType,
        data.reason,
        data.effectiveDate
      )
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al crear cambio salarial')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-history'] })
      queryClient.invalidateQueries({ queryKey: ['current-salary'] })
      toast.success('Cambio salarial registrado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al registrar cambio salarial')
    }
  })

  return {
    salaryHistory: salaryHistoryQuery.data?.data || [],
    currentSalary: currentSalaryQuery.data?.data,
    isLoading: salaryHistoryQuery.isLoading,
    createSalaryChange: createSalaryChangeMutation.mutate,
    isCreating: createSalaryChangeMutation.isPending
  }
}

// Hook para solicitudes de permisos
export const useLeaveRequests = (orgId: string, employeeProfileId?: string) => {
  const queryClient = useQueryClient()

  const leaveRequestsQuery = useQuery({
    queryKey: ['leave-requests', employeeProfileId || orgId],
    queryFn: async () => {
      if (employeeProfileId) {
        const result = await leaveRequestsDAL.findByEmployeeProfile(employeeProfileId)
        if (!result.success) {
          throw new Error(result.error?.message || 'Error al cargar solicitudes')
        }
        return result
      } else {
        const result = await leaveRequestsDAL.findPendingRequests(orgId)
        if (!result.success) {
          throw new Error(result.error?.message || 'Error al cargar solicitudes pendientes')
        }
        return result
      }
    },
    enabled: !!(employeeProfileId || orgId)
  })

  const createLeaveRequestMutation = useMutation({
    mutationFn: async (data: Partial<LeaveRequest>) => {
      // Calcular días automáticamente
      if (data.start_date && data.end_date) {
        data.total_days = leaveRequestsDAL.calculateLeaveDays(data.start_date, data.end_date)
      }
      
      const result = await leaveRequestsDAL.create(data)
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al crear solicitud de permiso')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
      toast.success('Solicitud de permiso creada exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear solicitud de permiso')
    }
  })

  const approveRequestMutation = useMutation({
    mutationFn: async (data: { 
      requestId: string; 
      reviewedBy: string; 
      reviewNotes?: string 
    }) => {
      const result = await leaveRequestsDAL.approveRequest(
        data.requestId, 
        data.reviewedBy, 
        data.reviewNotes
      )
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al aprobar solicitud')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
      toast.success('Solicitud aprobada exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al aprobar solicitud')
    }
  })

  const rejectRequestMutation = useMutation({
    mutationFn: async (data: { 
      requestId: string; 
      reviewedBy: string; 
      reviewNotes: string 
    }) => {
      const result = await leaveRequestsDAL.rejectRequest(
        data.requestId, 
        data.reviewedBy, 
        data.reviewNotes
      )
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al rechazar solicitud')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
      toast.success('Solicitud rechazada')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al rechazar solicitud')
    }
  })

  return {
    leaveRequests: leaveRequestsQuery.data?.data || [],
    isLoading: leaveRequestsQuery.isLoading,
    createLeaveRequest: createLeaveRequestMutation.mutate,
    approveRequest: approveRequestMutation.mutate,
    rejectRequest: rejectRequestMutation.mutate,
    isCreating: createLeaveRequestMutation.isPending,
    isApproving: approveRequestMutation.isPending,
    isRejecting: rejectRequestMutation.isPending
  }
}