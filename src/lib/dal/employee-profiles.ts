/**
 * Data Access Layer para Employee Profiles
 * Nueva arquitectura post-migración
 */

import { BaseDAL } from './base'
import { DALResponse, DALListResponse } from './types'
import { supabase } from '@/integrations/supabase/client'
import type { EmployeeProfile, CreateEmployeeProfileData, UpdateEmployeeProfileData, Employee, EmploymentStatus } from '@/types/core/employee'

export class EmployeeProfilesDAL extends BaseDAL<EmployeeProfile> {
  constructor() {
    super('employee_profiles')
  }

  /**
   * Obtener empleados con datos combinados (profile + user si existe)
   */
  async findEmployeesWithUserData(orgId: string): Promise<DALListResponse<Employee>> {
    try {
      const query = supabase
        .from('employee_profiles')
        .select(`
          *,
          user:users(
            id,
            email,
            first_name,
            last_name,
            phone,
            avatar_url,
            role,
            is_active
          )
        `)
        .eq('org_id', orgId)
        .order('name', { ascending: true })

      const { data, error, count } = await query

      if (error) {
        console.error('Error in findEmployeesWithUserData:', error)
        return { data: [], error, success: false }
      }

      // Combinar datos de profile y user
      const employees: Employee[] = (data || []).map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        is_user: profile.is_user,
        
        // Datos de usuario (si existe)
        email: profile.user?.email || profile.email,
        first_name: profile.user?.first_name,
        last_name: profile.user?.last_name,
        phone: profile.user?.phone,
        avatar_url: profile.user?.avatar_url,
        role: profile.user?.role,
        is_active: profile.user?.is_active,
        
        // Datos del profile
        name: profile.name,
        employee_number: profile.employee_number,
        position_title: profile.position_title,
        department_name: profile.department_name,
        employment_status: profile.employment_status as EmploymentStatus,
        hire_date: profile.hire_date,
        salary: profile.salary,
        contract_type: profile.contract_type,
        working_hours_per_week: profile.working_hours_per_week,
        notes: profile.notes,
        
        // Metadata
        org_id: profile.org_id,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        created_by: profile.created_by
      }))

      return {
        data: employees,
        error: null,
        success: true,
        count
      }
    } catch (error) {
      console.error('Error in findEmployeesWithUserData:', error)
      return { data: [], error: error as Error, success: false }
    }
  }

  /**
   * Crear nuevo empleado
   */
  async createEmployee(orgId: string, data: CreateEmployeeProfileData): Promise<DALResponse<EmployeeProfile>> {
    try {
      const { data: result, error } = await supabase
        .from('employee_profiles')
        .insert({
          ...data,
          org_id: orgId,
          currency: data.currency || 'EUR',
          employment_status: data.employment_status || 'active',
          contract_type: data.contract_type || 'full_time',
          address_country: data.address_country || 'España'
        })
        .select()
        .single()

      if (error) {
        console.error('Error in createEmployee:', error)
        return { data: null, error, success: false }
      }

      return { data: result as EmployeeProfile, error: null, success: true }
    } catch (error) {
      console.error('Error in createEmployee:', error)
      return { data: null, error: error as Error, success: false }
    }
  }

  /**
   * Actualizar empleado
   */
  async updateEmployee(data: UpdateEmployeeProfileData): Promise<DALResponse<EmployeeProfile>> {
    try {
      const { id, ...updateData } = data
      
      const { data: result, error } = await supabase
        .from('employee_profiles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error in updateEmployee:', error)
        return { data: null, error, success: false }
      }

      return { data: result as EmployeeProfile, error: null, success: true }
    } catch (error) {
      console.error('Error in updateEmployee:', error)
      return { data: null, error: error as Error, success: false }
    }
  }

  /**
   * Obtener empleados activos por departamento
   */
  async findByDepartment(orgId: string, departmentName: string): Promise<DALListResponse<EmployeeProfile>> {
    try {
      const { data, error } = await supabase
        .from('employee_profiles')
        .select('*')
        .eq('org_id', orgId)
        .eq('department_name', departmentName)
        .eq('employment_status', 'active')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error in findByDepartment:', error)
        return { data: [], error, success: false }
      }

      return { data: (data || []) as EmployeeProfile[], error: null, success: true }
    } catch (error) {
      console.error('Error in findByDepartment:', error)
      return { data: [], error: error as Error, success: false }
    }
  }

  /**
   * Buscar empleados por término
   */
  async searchEmployees(orgId: string, searchTerm: string): Promise<DALListResponse<Employee>> {
    try {
      const query = supabase
        .from('employee_profiles')
        .select(`
          *,
          user:users(
            id,
            email,
            first_name,
            last_name,
            phone,
            avatar_url,
            role,
            is_active
          )
        `)
        .eq('org_id', orgId)
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,employee_number.ilike.%${searchTerm}%`)
        .order('name', { ascending: true })

      const { data, error } = await query

      if (error) {
        console.error('Error in searchEmployees:', error)
        return { data: [], error, success: false }
      }

      // Combinar datos como en findEmployeesWithUserData
      const employees: Employee[] = (data || []).map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        is_user: profile.is_user,
        email: profile.user?.email || profile.email,
        first_name: profile.user?.first_name,
        last_name: profile.user?.last_name,
        phone: profile.user?.phone,
        avatar_url: profile.user?.avatar_url,
        role: profile.user?.role,
        is_active: profile.user?.is_active,
        name: profile.name,
        employee_number: profile.employee_number,
        position_title: profile.position_title,
        department_name: profile.department_name,
        employment_status: profile.employment_status as EmploymentStatus,
        hire_date: profile.hire_date,
        salary: profile.salary,
        contract_type: profile.contract_type,
        working_hours_per_week: profile.working_hours_per_week,
        notes: profile.notes,
        org_id: profile.org_id,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        created_by: profile.created_by
      }))

      return { data: employees, error: null, success: true }
    } catch (error) {
      console.error('Error in searchEmployees:', error)
      return { data: [], error: error as Error, success: false }
    }
  }

  /**
   * Obtener estadísticas de empleados
   */
  async getEmployeeStats(orgId: string): Promise<DALResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('employee_profiles')
        .select('employment_status, department_name, contract_type')
        .eq('org_id', orgId)

      if (error) {
        console.error('Error in getEmployeeStats:', error)
        return { data: null, error, success: false }
      }

      const stats = {
        total: data.length,
        active: data.filter(e => e.employment_status === 'active').length,
        inactive: data.filter(e => e.employment_status === 'inactive').length,
        terminated: data.filter(e => e.employment_status === 'terminated').length,
        on_leave: data.filter(e => e.employment_status === 'on_leave').length,
        by_department: data.reduce((acc, e) => {
          const dept = e.department_name || 'Sin departamento'
          acc[dept] = (acc[dept] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        by_contract_type: data.reduce((acc, e) => {
          const type = e.contract_type || 'No especificado'
          acc[type] = (acc[type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }

      return { data: stats, error: null, success: true }
    } catch (error) {
      console.error('Error in getEmployeeStats:', error)
      return { data: null, error: error as Error, success: false }
    }
  }

  /**
   * Vincular empleado con usuario
   */
  async linkToUser(employeeId: string, userId: string): Promise<DALResponse<EmployeeProfile>> {
    try {
      const { data, error } = await supabase
        .from('employee_profiles')
        .update({
          user_id: userId,
          is_user: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId)
        .select()
        .single()

      if (error) {
        console.error('Error in linkToUser:', error)
        return { data: null, error, success: false }
      }

      return { data: data as EmployeeProfile, error: null, success: true }
    } catch (error) {
      console.error('Error in linkToUser:', error)
      return { data: null, error: error as Error, success: false }
    }
  }

  /**
   * Desvincular empleado de usuario
   */
  async unlinkFromUser(employeeId: string): Promise<DALResponse<EmployeeProfile>> {
    try {
      const { data, error } = await supabase
        .from('employee_profiles')
        .update({
          user_id: null,
          is_user: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId)
        .select()
        .single()

      if (error) {
        console.error('Error in unlinkFromUser:', error)
        return { data: null, error, success: false }
      }

      return { data: data as EmployeeProfile, error: null, success: true }
    } catch (error) {
      console.error('Error in unlinkFromUser:', error)
      return { data: null, error: error as Error, success: false }
    }
  }
}

// Singleton instance
export const employeeProfilesDAL = new EmployeeProfilesDAL()