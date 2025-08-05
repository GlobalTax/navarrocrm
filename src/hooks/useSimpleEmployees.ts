import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface SimpleEmployee {
  id: string
  org_id: string
  name: string
  email: string
  phone?: string
  position: string
  department?: string
  hire_date: string
  salary?: number
  status: 'active' | 'inactive' | 'on_leave'
  notes?: string
  created_at: string
  updated_at: string
  created_by?: string
}

export interface CreateEmployeeData {
  name: string
  email: string
  phone?: string
  position: string
  department?: string
  hire_date: string
  salary?: number
  status?: 'active' | 'inactive' | 'on_leave'
  notes?: string
}

export function useSimpleEmployees() {
  const { user } = useApp()
  const [employees, setEmployees] = useState<SimpleEmployee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const orgId = user?.org_id

  const fetchEmployees = async () => {
    if (!orgId) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('simple_employees')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEmployees((data || []) as SimpleEmployee[])
    } catch (error) {
      console.error('Error fetching employees:', error)
      toast.error('Error al cargar empleados')
    } finally {
      setIsLoading(false)
    }
  }

  const createEmployee = async (data: CreateEmployeeData) => {
    if (!orgId || !user?.id) return

    try {
      setIsCreating(true)
      const { data: newEmployee, error } = await supabase
        .from('simple_employees')
        .insert({
          ...data,
          org_id: orgId,
          created_by: user.id,
          status: data.status || 'active'
        })
        .select()
        .single()

      if (error) throw error
      
      setEmployees(prev => [newEmployee as SimpleEmployee, ...prev])
      toast.success('Empleado creado exitosamente')
      return newEmployee
    } catch (error) {
      console.error('Error creating employee:', error)
      toast.error('Error al crear empleado')
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  const updateEmployee = async (id: string, data: Partial<CreateEmployeeData>) => {
    try {
      const { data: updatedEmployee, error } = await supabase
        .from('simple_employees')
        .update(data)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) throw error

      setEmployees(prev => 
        prev.map(emp => emp.id === id ? updatedEmployee as SimpleEmployee : emp)
      )
      toast.success('Empleado actualizado exitosamente')
      return updatedEmployee
    } catch (error) {
      console.error('Error updating employee:', error)
      toast.error('Error al actualizar empleado')
      throw error
    }
  }

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('simple_employees')
        .delete()
        .eq('id', id)
        .eq('org_id', orgId)

      if (error) throw error

      setEmployees(prev => prev.filter(emp => emp.id !== id))
      toast.success('Empleado eliminado exitosamente')
    } catch (error) {
      console.error('Error deleting employee:', error)
      toast.error('Error al eliminar empleado')
      throw error
    }
  }

  const getEmployeeStats = () => {
    const activeEmployees = employees.filter(emp => emp.status === 'active').length
    const onLeaveEmployees = employees.filter(emp => emp.status === 'on_leave').length
    const inactiveEmployees = employees.filter(emp => emp.status === 'inactive').length
    
    return {
      total: employees.length,
      active: activeEmployees,
      onLeave: onLeaveEmployees,
      inactive: inactiveEmployees
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [orgId])

  return {
    employees,
    isLoading,
    isCreating,
    stats: getEmployeeStats(),
    createEmployee,
    updateEmployee,
    deleteEmployee,
    refreshEmployees: fetchEmployees
  }
}