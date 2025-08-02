export interface EmployeeContract {
  id: string
  user_id: string
  org_id: string
  contract_type: string
  position: string
  department_id?: string | null
  start_date: string
  end_date?: string | null
  salary_amount: number
  salary_frequency: string
  working_hours: number
  vacation_days: number
  contract_document_url?: string | null
  status: string
  termination_date?: string | null
  termination_reason?: string | null
  created_at: string
  updated_at: string
  created_by: string
}

export interface EmployeeSalary {
  id: string
  user_id: string
  contract_id: string
  org_id: string
  previous_salary?: number | null
  new_salary: number
  salary_frequency: string
  change_type: string
  change_reason?: string | null
  effective_date: string
  approved_by?: string | null
  created_at: string
  created_by: string
}

export interface EmployeeBenefit {
  id: string
  user_id: string
  contract_id: string
  org_id: string
  benefit_type: string
  benefit_name: string
  benefit_value?: number | null
  description?: string | null
  start_date: string
  end_date?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string
}

export interface EmployeeWithContract {
  id: string
  email: string
  first_name?: string
  last_name?: string
  role: string
  department_id?: string | null
  is_active: boolean
  contract?: EmployeeContract
  salaries?: EmployeeSalary[]
  benefits?: EmployeeBenefit[]
}

export interface EmployeeFormData {
  contract_type: EmployeeContract['contract_type']
  position: string
  department_id?: string
  start_date: string
  end_date?: string
  salary_amount: number
  salary_frequency: EmployeeContract['salary_frequency']
  working_hours: number
  vacation_days: number
}

export interface SalaryFormData {
  new_salary: number
  salary_frequency: EmployeeSalary['salary_frequency']
  change_type: EmployeeSalary['change_type']
  change_reason?: string
  effective_date: string
}

export interface BenefitFormData {
  benefit_type: EmployeeBenefit['benefit_type']
  benefit_name: string
  benefit_value?: number
  description?: string
  start_date: string
  end_date?: string
}