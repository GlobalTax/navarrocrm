import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { Employee } from '@/types/core/employee'

export interface SimpleEmployee {
  id: string
  org_id: string
  name: string
  email?: string
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
  // Campos de acceso al sistema
  user_id?: string | null
  is_user?: boolean
  role?: string
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
  email?: string
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
        .from('employee_profiles')
        .select(`
          *,
          users(id, email, role, is_active)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Mapear los datos a SimpleEmployee
      const employeeData: SimpleEmployee[] = (data || []).map(profile => ({
        id: profile.id,
        org_id: profile.org_id,
        name: profile.name,
        email: profile.email || profile.users?.email,
        phone: '', // Campo no disponible en employee_profiles
        position: profile.position_title || '',
        department: profile.department_name,
        hire_date: profile.hire_date,
        salary: profile.salary,
        status: profile.employment_status === 'active' ? 'active' : 
                profile.employment_status === 'on_leave' ? 'on_leave' : 'inactive',
        notes: profile.notes,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        created_by: profile.created_by,
        user_id: profile.user_id,
        is_user: profile.is_user,
        role: profile.users?.role,
        employee_number: profile.employee_number,
        birth_date: profile.birth_date,
        address_street: profile.address_street,
        address_city: profile.address_city,
        address_postal_code: profile.address_postal_code,
        address_country: profile.address_country,
        emergency_contact_name: profile.emergency_contact_name,
        emergency_contact_phone: profile.emergency_contact_phone,
        dni_nie: profile.dni_nie,
        social_security_number: profile.social_security_number,
        bank_account: profile.bank_account,
        contract_type: profile.contract_type,
        working_hours_per_week: profile.working_hours_per_week,
        avatar_url: '', // Campo no disponible en employee_profiles
        skills: profile.skills,
        languages: profile.languages,
        education_level: profile.education_level,
      }))
      
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
        .from('employee_profiles')
        .insert({
          name: data.name,
          email: data.email,
          position_title: data.position,
          department_name: data.department,
          hire_date: data.hire_date,
          salary: data.salary,
          employment_status: data.status || 'active',
          notes: data.notes,
          birth_date: data.birth_date,
          address_street: data.address_street,
          address_city: data.address_city,
          address_postal_code: data.address_postal_code,
          address_country: data.address_country || 'España',
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          dni_nie: data.dni_nie,
          social_security_number: data.social_security_number,
          bank_account: data.bank_account,
          contract_type: data.contract_type || 'indefinido',
          working_hours_per_week: data.working_hours_per_week,
          skills: data.skills,
          languages: data.languages,
          education_level: data.education_level,
          is_user: false,
          currency: 'EUR',
          org_id: orgId,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error
      
      // Mapear a SimpleEmployee
      const mappedEmployee: SimpleEmployee = {
        id: newEmployee.id,
        org_id: newEmployee.org_id,
        name: newEmployee.name,
        email: newEmployee.email,
        phone: '',
        position: newEmployee.position_title || '',
        department: newEmployee.department_name,
        hire_date: newEmployee.hire_date,
        salary: newEmployee.salary,
        status: newEmployee.employment_status === 'active' ? 'active' : 
                newEmployee.employment_status === 'on_leave' ? 'on_leave' : 'inactive',
        notes: newEmployee.notes,
        created_at: newEmployee.created_at,
        updated_at: newEmployee.updated_at,
        created_by: newEmployee.created_by,
        user_id: newEmployee.user_id,
        is_user: newEmployee.is_user,
        employee_number: newEmployee.employee_number,
        birth_date: newEmployee.birth_date,
        address_street: newEmployee.address_street,
        address_city: newEmployee.address_city,
        address_postal_code: newEmployee.address_postal_code,
        address_country: newEmployee.address_country,
        emergency_contact_name: newEmployee.emergency_contact_name,
        emergency_contact_phone: newEmployee.emergency_contact_phone,
        dni_nie: newEmployee.dni_nie,
        social_security_number: newEmployee.social_security_number,
        bank_account: newEmployee.bank_account,
        contract_type: newEmployee.contract_type,
        working_hours_per_week: newEmployee.working_hours_per_week,
        avatar_url: '',
        skills: newEmployee.skills,
        languages: newEmployee.languages,
        education_level: newEmployee.education_level,
      }
      
      const updatedEmployees = [mappedEmployee, ...employees]
      setEmployees(updatedEmployees)
      setFilteredEmployees(updatedEmployees)
      toast.success('Empleado creado exitosamente')
      return mappedEmployee
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
      // Mapear campos para la nueva estructura
      const updateData = {
        name: data.name,
        email: data.email,
        position_title: data.position,
        department_name: data.department,
        hire_date: data.hire_date,
        salary: data.salary,
        employment_status: data.status,
        notes: data.notes,
        birth_date: data.birth_date,
        address_street: data.address_street,
        address_city: data.address_city,
        address_postal_code: data.address_postal_code,
        address_country: data.address_country,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
        dni_nie: data.dni_nie,
        social_security_number: data.social_security_number,
        bank_account: data.bank_account,
        contract_type: data.contract_type,
        working_hours_per_week: data.working_hours_per_week,
        skills: data.skills,
        languages: data.languages,
        education_level: data.education_level,
      }

      const { data: updatedEmployee, error } = await supabase
        .from('employee_profiles')
        .update(updateData)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) throw error

      // Mapear resultado
      const mappedEmployee: SimpleEmployee = {
        id: updatedEmployee.id,
        org_id: updatedEmployee.org_id,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        phone: '',
        position: updatedEmployee.position_title || '',
        department: updatedEmployee.department_name,
        hire_date: updatedEmployee.hire_date,
        salary: updatedEmployee.salary,
        status: updatedEmployee.employment_status === 'active' ? 'active' : 
                updatedEmployee.employment_status === 'on_leave' ? 'on_leave' : 'inactive',
        notes: updatedEmployee.notes,
        created_at: updatedEmployee.created_at,
        updated_at: updatedEmployee.updated_at,
        created_by: updatedEmployee.created_by,
        user_id: updatedEmployee.user_id,
        is_user: updatedEmployee.is_user,
        employee_number: updatedEmployee.employee_number,
        birth_date: updatedEmployee.birth_date,
        address_street: updatedEmployee.address_street,
        address_city: updatedEmployee.address_city,
        address_postal_code: updatedEmployee.address_postal_code,
        address_country: updatedEmployee.address_country,
        emergency_contact_name: updatedEmployee.emergency_contact_name,
        emergency_contact_phone: updatedEmployee.emergency_contact_phone,
        dni_nie: updatedEmployee.dni_nie,
        social_security_number: updatedEmployee.social_security_number,
        bank_account: updatedEmployee.bank_account,
        contract_type: updatedEmployee.contract_type,
        working_hours_per_week: updatedEmployee.working_hours_per_week,
        avatar_url: '',
        skills: updatedEmployee.skills,
        languages: updatedEmployee.languages,
        education_level: updatedEmployee.education_level,
      }

      const updatedEmployees = employees.map(emp => 
        emp.id === id ? mappedEmployee : emp
      )
      setEmployees(updatedEmployees)
      setFilteredEmployees(updatedEmployees)
      toast.success('Empleado actualizado exitosamente')
      return mappedEmployee
    } catch (error) {
      console.error('Error updating employee:', error)
      toast.error('Error al actualizar empleado')
      throw error
    }
  }

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employee_profiles')
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
        (emp.email && emp.email.toLowerCase().includes(search)) ||
        emp.position.toLowerCase().includes(search) ||
        (emp.employee_number && emp.employee_number.toLowerCase().includes(search))
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