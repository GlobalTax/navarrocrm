import { BaseDAL } from './base'
import { supabase } from '@/integrations/supabase/client'
import { DALResponse, DALListResponse } from './types'

export interface EmployeeProfile {
  id: string
  user_id: string
  org_id: string
  
  // Información del usuario relacionado (join)
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  role?: string
  
  // Información personal extendida
  employee_number?: string
  date_of_birth?: string
  nationality?: string
  marital_status?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  
  // Información laboral
  employment_type: 'fixed' | 'autonomous' | 'temporary'
  hire_date: string
  probation_end_date?: string
  work_location?: string
  work_schedule?: 'full_time' | 'part_time' | 'flexible'
  remote_work_allowed: boolean
  
  // Información bancaria
  bank_name?: string
  bank_account?: string
  tax_id?: string
  social_security_number?: string
  
  // Metadata
  is_active: boolean
  notes?: string
  created_at?: string
  updated_at?: string
  created_by?: string
}

export interface EmploymentContract {
  id: string
  employee_profile_id: string
  org_id: string
  
  // Información del contrato
  contract_type: 'indefinido' | 'temporal' | 'practicas' | 'autonomo'
  contract_number?: string
  start_date: string
  end_date?: string
  trial_period_months: number
  
  // Condiciones salariales
  base_salary: number
  salary_currency: string
  salary_frequency: 'monthly' | 'annual' | 'hourly'
  overtime_rate: number
  
  // Condiciones laborales
  weekly_hours: number
  vacation_days_per_year: number
  sick_leave_days_per_year: number
  
  // Estado del contrato
  status: 'active' | 'terminated' | 'suspended'
  termination_date?: string
  termination_reason?: string
  
  // Metadata
  created_at?: string
  updated_at?: string
  created_by?: string
}

export interface SalaryHistory {
  id: string
  employee_profile_id: string
  org_id: string
  
  // Información del cambio salarial
  effective_date: string
  previous_salary?: number
  new_salary: number
  salary_currency: string
  
  // Detalles del cambio
  change_type: 'increment' | 'promotion' | 'adjustment' | 'bonus'
  change_percentage?: number
  reason?: string
  
  // Aprobación
  approved_by?: string
  approved_at?: string
  
  // Metadata
  created_at?: string
  created_by?: string
}

export class EmployeeProfilesDAL extends BaseDAL<EmployeeProfile> {
  constructor() {
    super('employee_profiles')
  }

  async findByUserId(userId: string): Promise<DALResponse<EmployeeProfile>> {
    if (!userId) {
      return {
        data: null,
        error: new Error('User ID is required'),
        success: false
      }
    }

    const query = supabase
      .from('employee_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    return this.handleResponse<EmployeeProfile>(query)
  }

  async findByEmploymentType(
    orgId: string,
    employmentType: string
  ): Promise<DALListResponse<EmployeeProfile>> {
    return this.findMany({
      filters: { org_id: orgId, employment_type: employmentType, is_active: true },
      sort: [{ column: 'hire_date', ascending: false }]
    })
  }

  async findActiveEmployees(orgId: string): Promise<DALListResponse<EmployeeProfile>> {
    const query = supabase
      .from('employee_profiles')
      .select(`
        *,
        users!inner(first_name, last_name, email, phone, role)
      `)
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('hire_date', { ascending: false })
    
    return this.handleListResponse<EmployeeProfile>(query)
  }

  async findByDepartment(
    orgId: string,
    departmentId: string
  ): Promise<DALListResponse<EmployeeProfile>> {
    const query = supabase
      .from('employee_profiles')
      .select(`
        *,
        users!inner(department_id)
      `)
      .eq('org_id', orgId)
      .eq('users.department_id', departmentId)
      .eq('is_active', true)
      .order('hire_date', { ascending: false })
    
    return this.handleListResponse<EmployeeProfile>(query)
  }

  async getEmployeeStats(orgId: string): Promise<DALResponse<any>> {
    // Placeholder - implement when RPC function exists
    return { data: null, error: null, success: true }
  }

  async createWithContract(
    employeeData: Partial<EmployeeProfile>,
    contractData: Partial<EmploymentContract>
  ): Promise<DALResponse<{ employee: EmployeeProfile; contract: EmploymentContract }>> {
    try {
      // Crear perfil de empleado
      const employeeResult = await this.create(employeeData)
      if (!employeeResult.success || !employeeResult.data) {
        return employeeResult as any
      }

      // Crear contrato
      const contractsDAL = new EmploymentContractsDAL()
      const contractResult = await contractsDAL.create({
        ...contractData,
        employee_profile_id: employeeResult.data.id
      })

      if (!contractResult.success) {
        // Rollback: eliminar empleado creado
        await this.delete(employeeResult.data.id)
        return contractResult as any
      }

      return {
        data: {
          employee: employeeResult.data,
          contract: contractResult.data!
        },
        error: null,
        success: true
      }
    } catch (error: any) {
      return {
        data: null,
        error: error,
        success: false
      }
    }
  }
}

export class EmploymentContractsDAL extends BaseDAL<EmploymentContract> {
  constructor() {
    super('employment_contracts')
  }

  async findByEmployeeProfile(
    employeeProfileId: string
  ): Promise<DALListResponse<EmploymentContract>> {
    return this.findMany({
      filters: { employee_profile_id: employeeProfileId },
      sort: [{ column: 'start_date', ascending: false }]
    })
  }

  async findActiveContracts(orgId: string): Promise<DALListResponse<EmploymentContract>> {
    return this.findMany({
      filters: { org_id: orgId, status: 'active' },
      sort: [{ column: 'start_date', ascending: false }]
    })
  }

  async findExpiringContracts(
    orgId: string,
    daysAhead: number = 30
  ): Promise<DALListResponse<EmploymentContract>> {
    const query = supabase
      .from('employment_contracts')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .not('end_date', 'is', null)
      .gte('end_date', new Date().toISOString().split('T')[0])
      .lte('end_date', new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('end_date', { ascending: true })
    
    return this.handleListResponse<EmploymentContract>(query)
  }
}

export class SalaryHistoryDAL extends BaseDAL<SalaryHistory> {
  constructor() {
    super('salary_history')
  }

  async findByEmployeeProfile(
    employeeProfileId: string
  ): Promise<DALListResponse<SalaryHistory>> {
    return this.findMany({
      filters: { employee_profile_id: employeeProfileId },
      sort: [{ column: 'effective_date', ascending: false }]
    })
  }

  async findRecentChanges(
    orgId: string,
    months: number = 12
  ): Promise<DALListResponse<SalaryHistory>> {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    
    const query = supabase
      .from('salary_history')
      .select('*')
      .eq('org_id', orgId)
      .gte('effective_date', startDate.toISOString().split('T')[0])
      .order('effective_date', { ascending: false })
    
    return this.handleListResponse<SalaryHistory>(query)
  }

  async getCurrentSalary(employeeProfileId: string): Promise<DALResponse<SalaryHistory>> {
    const query = supabase
      .from('salary_history')
      .select('*')
      .eq('employee_profile_id', employeeProfileId)
      .lte('effective_date', new Date().toISOString().split('T')[0])
      .order('effective_date', { ascending: false })
      .limit(1)
      .single()
    
    return this.handleResponse<SalaryHistory>(query)
  }

  async createSalaryChange(
    employeeProfileId: string,
    newSalary: number,
    changeType: SalaryHistory['change_type'],
    reason?: string,
    effectiveDate?: string
  ): Promise<DALResponse<SalaryHistory>> {
    // Obtener salario actual
    const currentSalaryResult = await this.getCurrentSalary(employeeProfileId)
    const previousSalary = currentSalaryResult.data?.new_salary || 0

    // Calcular porcentaje de cambio
    const changePercentage = previousSalary > 0 
      ? ((newSalary - previousSalary) / previousSalary) * 100 
      : 0

    return this.create({
      employee_profile_id: employeeProfileId,
      effective_date: effectiveDate || new Date().toISOString().split('T')[0],
      previous_salary: previousSalary,
      new_salary: newSalary,
      change_type: changeType,
      change_percentage: changePercentage,
      reason,
      created_by: undefined // Se establecerá automáticamente
    } as Partial<SalaryHistory>)
  }
}

// Singleton instances
export const employeeProfilesDAL = new EmployeeProfilesDAL()
export const employmentContractsDAL = new EmploymentContractsDAL()
export const salaryHistoryDAL = new SalaryHistoryDAL()