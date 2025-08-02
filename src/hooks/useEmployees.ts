import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { 
  EmployeeContract, 
  EmployeeSalary, 
  EmployeeBenefit, 
  EmployeeWithContract,
  EmployeeFormData,
  SalaryFormData,
  BenefitFormData
} from '@/types/employees'

export const useEmployees = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  // Fetch employees with contracts
  const { data: employees = [], isLoading: isFetching } = useQuery({
    queryKey: ['employees', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          role,
          department_id,
          is_active
        `)
        .eq('org_id', user.org_id)
        .eq('is_active', true)
        .neq('role', 'client')

      if (usersError) throw usersError

      // Fetch contracts for all users
      const { data: contracts, error: contractsError } = await supabase
        .from('employee_contracts')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('status', 'active')

      if (contractsError) throw contractsError

      // Combine users with their contracts
      const employeesWithContracts: EmployeeWithContract[] = (users || []).map(user => ({
        ...user,
        first_name: user.email.split('@')[0], // Fallback for display
        last_name: '',
        contract: contracts?.find(c => c.user_id === user.id)
      }))

      return employeesWithContracts
    },
    enabled: !!user?.org_id,
  })

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async ({ userId, formData }: { userId: string, formData: EmployeeFormData }) => {
      const { data, error } = await supabase
        .from('employee_contracts')
        .insert({
          user_id: userId,
          org_id: user?.org_id,
          created_by: user?.id,
          ...formData
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Contrato creado exitosamente')
    },
    onError: (error) => {
      console.error('Error creating contract:', error)
      toast.error('Error al crear el contrato')
    }
  })

  // Update contract mutation
  const updateContractMutation = useMutation({
    mutationFn: async ({ contractId, formData }: { contractId: string, formData: Partial<EmployeeFormData> }) => {
      const { data, error } = await supabase
        .from('employee_contracts')
        .update(formData)
        .eq('id', contractId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Contrato actualizado exitosamente')
    },
    onError: (error) => {
      console.error('Error updating contract:', error)
      toast.error('Error al actualizar el contrato')
    }
  })

  // Create salary record mutation
  const createSalaryMutation = useMutation({
    mutationFn: async ({ userId, contractId, formData }: { userId: string, contractId: string, formData: SalaryFormData }) => {
      // Get current salary for previous_salary field
      const { data: currentContract } = await supabase
        .from('employee_contracts')
        .select('salary_amount')
        .eq('id', contractId)
        .single()

      const { data, error } = await supabase
        .from('employee_salaries')
        .insert({
          user_id: userId,
          contract_id: contractId,
          org_id: user?.org_id,
          created_by: user?.id,
          previous_salary: currentContract?.salary_amount,
          ...formData
        })
        .select()
        .single()

      if (error) throw error

      // Update contract with new salary
      await supabase
        .from('employee_contracts')
        .update({ 
          salary_amount: formData.new_salary,
          salary_frequency: formData.salary_frequency 
        })
        .eq('id', contractId)

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Salario actualizado exitosamente')
    },
    onError: (error) => {
      console.error('Error updating salary:', error)
      toast.error('Error al actualizar el salario')
    }
  })

  // Create benefit mutation
  const createBenefitMutation = useMutation({
    mutationFn: async ({ userId, contractId, formData }: { userId: string, contractId: string, formData: BenefitFormData }) => {
      const { data, error } = await supabase
        .from('employee_benefits')
        .insert({
          user_id: userId,
          contract_id: contractId,
          org_id: user?.org_id,
          created_by: user?.id,
          ...formData
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Beneficio añadido exitosamente')
    },
    onError: (error) => {
      console.error('Error adding benefit:', error)
      toast.error('Error al añadir el beneficio')
    }
  })

  // Fetch employee details (contract, salaries, benefits)
  const fetchEmployeeDetails = async (userId: string) => {
    if (!user?.org_id) return null

    const [contractRes, salariesRes, benefitsRes] = await Promise.all([
      supabase
        .from('employee_contracts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single(),
      supabase
        .from('employee_salaries')
        .select('*')
        .eq('user_id', userId)
        .order('effective_date', { ascending: false }),
      supabase
        .from('employee_benefits')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
    ])

    return {
      contract: contractRes.data,
      salaries: salariesRes.data || [],
      benefits: benefitsRes.data || []
    }
  }

  return {
    employees,
    isLoading: isFetching || isLoading,
    createContract: createContractMutation.mutate,
    updateContract: updateContractMutation.mutate,
    createSalary: createSalaryMutation.mutate,
    createBenefit: createBenefitMutation.mutate,
    fetchEmployeeDetails,
    isCreatingContract: createContractMutation.isPending,
    isUpdatingContract: updateContractMutation.isPending,
    isCreatingSalary: createSalaryMutation.isPending,
    isCreatingBenefit: createBenefitMutation.isPending
  }
}