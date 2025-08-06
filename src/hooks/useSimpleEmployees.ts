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
  // Nuevos campos Fase 1
  employee_number?: string
  birth_date?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  address_country?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  dni_nie?: string
  social_security_number?: string
  bank_account?: string
  contract_type?: string
  working_hours_per_week?: number
  avatar_url?: string
  skills?: string[]
  languages?: string[]
  education_level?: string
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
  // Nuevos campos opcionales Fase 1
  birth_date?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  address_country?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  dni_nie?: string
  social_security_number?: string
  bank_account?: string
  contract_type?: string
  working_hours_per_week?: number
  avatar_url?: string
  skills?: string[]
  languages?: string[]
  education_level?: string
}

export function useSimpleEmployees() {
  const { user } = useApp()
  const [employees, setEmployees] = useState<SimpleEmployee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<SimpleEmployee[]>([])
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
      const employeeData = (data || []) as SimpleEmployee[]
      setEmployees(employeeData)
      setFilteredEmployees(employeeData)
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
      
      const updatedEmployees = [newEmployee as SimpleEmployee, ...employees]
      setEmployees(updatedEmployees)
      setFilteredEmployees(updatedEmployees)
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

      const updatedEmployees = employees.map(emp => 
        emp.id === id ? updatedEmployee as SimpleEmployee : emp
      )
      setEmployees(updatedEmployees)
      setFilteredEmployees(updatedEmployees)
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

      const updatedEmployees = employees.filter(emp => emp.id !== id)
      setEmployees(updatedEmployees)
      setFilteredEmployees(updatedEmployees)
      toast.success('Empleado eliminado exitosamente')
    } catch (error) {
      console.error('Error deleting employee:', error)
      toast.error('Error al eliminar empleado')
      throw error
    }
  }

  const getEmployeeStats = () => {
    const activeEmployees = filteredEmployees.filter(emp => emp.status === 'active').length
    const onLeaveEmployees = filteredEmployees.filter(emp => emp.status === 'on_leave').length
    const inactiveEmployees = filteredEmployees.filter(emp => emp.status === 'inactive').length
    
    return {
      total: filteredEmployees.length,
      active: activeEmployees,
      onLeave: onLeaveEmployees,
      inactive: inactiveEmployees
    }
  }

  const filterEmployees = (filters: any) => {
    let filtered = [...employees]

    // Búsqueda general
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(search) ||
        emp.email.toLowerCase().includes(search) ||
        emp.position.toLowerCase().includes(search) ||
        emp.employee_number?.toLowerCase().includes(search)
      )
    }

    // Filtro por departamento
    if (filters.department && filters.department !== 'all') {
      if (filters.department === 'none') {
        filtered = filtered.filter(emp => !emp.department)
      } else {
        filtered = filtered.filter(emp => emp.department === filters.department)
      }
    }

    // Filtro por estado
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(emp => emp.status === filters.status)
    }

    // Filtro por tipo de contrato
    if (filters.contract_type && filters.contract_type !== 'all') {
      filtered = filtered.filter(emp => emp.contract_type === filters.contract_type)
    }

    // Filtro por posición
    if (filters.position) {
      filtered = filtered.filter(emp => 
        emp.position.toLowerCase().includes(filters.position.toLowerCase())
      )
    }

    // Filtro por nivel de educación
    if (filters.education_level && filters.education_level !== 'all') {
      filtered = filtered.filter(emp => emp.education_level === filters.education_level)
    }

    // Filtro por fecha de contratación
    if (filters.hire_date_from) {
      filtered = filtered.filter(emp => emp.hire_date >= filters.hire_date_from)
    }
    if (filters.hire_date_to) {
      filtered = filtered.filter(emp => emp.hire_date <= filters.hire_date_to)
    }

    setFilteredEmployees(filtered)
  }

  useEffect(() => {
    fetchEmployees()
  }, [orgId])

  return {
    employees: filteredEmployees,
    allEmployees: employees,
    isLoading,
    isCreating,
    stats: getEmployeeStats(),
    createEmployee,
    updateEmployee,
    deleteEmployee,
    refreshEmployees: fetchEmployees,
    filterEmployees
  }
}