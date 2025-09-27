/**
 * Hook para gestión de Employee Profiles
 * Nueva arquitectura post-migración
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApp } from '@/contexts/AppContext'
import { employeeProfilesDAL } from '@/lib/dal/employee-profiles'
import type { 
  Employee, 
  CreateEmployeeProfileData, 
  UpdateEmployeeProfileData, 
  EmployeeFilters,
  EmployeeStats
} from '@/types/core/employee'
import { toast } from 'sonner'

const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  return 'Error desconocido'
}

export const useEmployeeProfiles = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<EmployeeFilters>({
    search: '',
    employment_status: 'all',
    department: 'all',
    contract_type: 'all'
  })

  // Query para obtener empleados con datos de usuario
  const { 
    data: employees = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['employee-profiles', user?.org_id, filters],
    queryFn: async (): Promise<Employee[]> => {
      if (!user?.org_id) return []
      
      // Si hay filtros de búsqueda, usar search
      if (filters.search) {
        const result = await employeeProfilesDAL.searchEmployees(user.org_id, filters.search)
        if (!result.success) {
          throw new Error(getErrorMessage(result.error))
        }
        return result.data
      }
      
      // Sino, obtener todos
      const result = await employeeProfilesDAL.findEmployeesWithUserData(user.org_id)
      if (!result.success) {
        throw new Error(getErrorMessage(result.error))
      }
      return result.data
    },
    enabled: !!user?.org_id,
  })

  // Query para estadísticas
  const { data: stats } = useQuery({
    queryKey: ['employee-stats', user?.org_id],
    queryFn: async (): Promise<EmployeeStats | null> => {
      if (!user?.org_id) return null
      
      const result = await employeeProfilesDAL.getEmployeeStats(user.org_id)
      if (!result.success) return null
      
      return result.data
    },
    enabled: !!user?.org_id,
  })

  // Mutation para crear empleado
  const createEmployee = useMutation({
    mutationFn: async (data: CreateEmployeeProfileData) => {
      if (!user?.org_id) throw new Error('No hay organización')
      
      const result = await employeeProfilesDAL.createEmployee(user.org_id, data)
      if (!result.success) {
        throw new Error(getErrorMessage(result.error))
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-profiles'] })
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] })
      toast.success('Empleado creado correctamente')
    },
    onError: (error: any) => {
      console.error('Error creando empleado:', error)
      toast.error(getErrorMessage(error))
    },
  })

  // Mutation para actualizar empleado
  const updateEmployee = useMutation({
    mutationFn: async (data: UpdateEmployeeProfileData) => {
      const result = await employeeProfilesDAL.updateEmployee(data)
      if (!result.success) {
        throw new Error(getErrorMessage(result.error))
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-profiles'] })
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] })
      toast.success('Empleado actualizado correctamente')
    },
    onError: (error: any) => {
      console.error('Error actualizando empleado:', error)
      toast.error(getErrorMessage(error))
    },
  })

  // Mutation para eliminar empleado
  const deleteEmployee = useMutation({
    mutationFn: async (id: string) => {
      const result = await employeeProfilesDAL.delete(id)
      if (!result.success) {
        throw new Error(getErrorMessage(result.error))
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-profiles'] })
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] })
      toast.success('Empleado eliminado correctamente')
    },
    onError: (error: any) => {
      console.error('Error eliminando empleado:', error)
      toast.error(getErrorMessage(error))
    },
  })

  // Mutation para vincular empleado con usuario
  const linkToUser = useMutation({
    mutationFn: async ({ employeeId, userId }: { employeeId: string, userId: string }) => {
      const result = await employeeProfilesDAL.linkToUser(employeeId, userId)
      if (!result.success) {
        throw new Error(getErrorMessage(result.error))
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-profiles'] })
      toast.success('Empleado vinculado con usuario correctamente')
    },
    onError: (error: any) => {
      console.error('Error vinculando empleado:', error)
      toast.error(getErrorMessage(error))
    },
  })

  // Mutation para desvincular empleado de usuario
  const unlinkFromUser = useMutation({
    mutationFn: async (employeeId: string) => {
      const result = await employeeProfilesDAL.unlinkFromUser(employeeId)
      if (!result.success) {
        throw new Error(getErrorMessage(result.error))
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-profiles'] })
      toast.success('Empleado desvinculado del usuario correctamente')
    },
    onError: (error: any) => {
      console.error('Error desvinculando empleado:', error)
      toast.error(getErrorMessage(error))
    },
  })

  // Filtrar empleados localmente
  const filteredEmployees = employees.filter(employee => {
    const matchesStatus = filters.employment_status === 'all' || employee.employment_status === filters.employment_status
    const matchesDepartment = filters.department === 'all' || employee.department_name === filters.department
    const matchesContract = filters.contract_type === 'all' || employee.contract_type === filters.contract_type
    
    return matchesStatus && matchesDepartment && matchesContract
  })

  // Obtener lista de departamentos únicos
  const departments = Array.from(new Set(employees.map(e => e.department_name).filter(Boolean)))

  // Obtener lista de tipos de contrato únicos
  const contractTypes = Array.from(new Set(employees.map(e => e.contract_type).filter(Boolean)))

  return {
    // Datos
    employees: filteredEmployees,
    allEmployees: employees,
    stats,
    departments,
    contractTypes,
    
    // Estados
    isLoading,
    error,
    filters,
    
    // Acciones
    setFilters,
    refetch,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    linkToUser,
    unlinkFromUser,
    
    // Estados de mutaciones
    isCreating: createEmployee.isPending,
    isUpdating: updateEmployee.isPending,
    isDeleting: deleteEmployee.isPending
  }
}

// Hook de compatibilidad con useSimpleEmployees
export const useSimpleEmployees = () => {
  const result = useEmployeeProfiles()
  
  return {
    // Mapear a estructura anterior para compatibilidad
    employees: result.employees,
    filteredEmployees: result.employees,
    isLoading: result.isLoading,
    isCreating: result.isCreating,
    
    // Funciones de compatibilidad
    createEmployee: result.createEmployee.mutateAsync,
    updateEmployee: (id: string, data: any) => result.updateEmployee.mutateAsync({ id, ...data }),
    deleteEmployee: result.deleteEmployee.mutateAsync,
    filterEmployees: (filters: any) => result.setFilters(filters),
    
    // Stats convertidas
    getEmployeeStats: () => ({
      total: result.stats?.total || 0,
      active: result.stats?.active || 0,
      inactive: result.stats?.inactive || 0,
      terminated: result.stats?.terminated || 0
    })
  }
}