
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface Department {
  id: string
  org_id: string
  name: string
  description?: string
  color?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  org_id: string
  department_id?: string
  name: string
  description?: string
  color?: string
  team_lead_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
  department?: {
    name: string
    color: string
  }
  members_count?: number
}

export interface TeamMembership {
  id: string
  team_id: string
  user_id: string
  role: 'member' | 'lead' | 'coordinator'
  joined_at: string
  is_active: boolean
  user?: {
    email: string
    role: string
  }
}

export const useTeams = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  // Fetch departments
  const { data: departments = [], isLoading: loadingDepartments } = useQuery({
    queryKey: ['departments', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data as Department[]
    },
    enabled: !!user?.org_id,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch teams with department info
  const { data: teams = [], isLoading: loadingTeams } = useQuery({
    queryKey: ['teams', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          department:departments(name, color),
          team_memberships(id)
        `)
        .eq('org_id', user.org_id)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      
      return data.map(team => ({
        ...team,
        members_count: team.team_memberships?.length || 0
      })) as Team[]
    },
    enabled: !!user?.org_id,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch team memberships with user data in parallel
  const { data: memberships = [], isLoading: loadingMemberships } = useQuery({
    queryKey: ['team-memberships', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const [membershipRes, usersRes] = await Promise.all([
        supabase.from('team_memberships').select('*').eq('is_active', true),
        supabase.from('users').select('id, email, role').eq('org_id', user.org_id)
      ])

      if (membershipRes.error) throw membershipRes.error
      if (usersRes.error) throw usersRes.error

      const userMap = new Map(usersRes.data.map(u => [u.id, u]))
      return membershipRes.data.map(m => ({
        ...m,
        user: userMap.get(m.user_id) || null
      })) as TeamMembership[]
    },
    enabled: !!user?.org_id,
    staleTime: 5 * 60 * 1000,
  })

  // Create department mutation
  const createDepartmentMutation = useMutation({
    mutationFn: async (departmentData: Omit<Department, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('departments')
        .insert(departmentData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success('Departamento creado exitosamente')
    },
    onError: (error) => {
      console.error('Error creating department:', error)
      toast.error('Error al crear el departamento')
    }
  })

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (teamData: Omit<Team, 'id' | 'created_at' | 'updated_at' | 'department' | 'members_count'>) => {
      const { data, error } = await supabase
        .from('teams')
        .insert(teamData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      toast.success('Equipo creado exitosamente')
    },
    onError: (error) => {
      console.error('Error creating team:', error)
      toast.error('Error al crear el equipo')
    }
  })

  // Add team member mutation
  const addTeamMemberMutation = useMutation({
    mutationFn: async ({ teamId, userId, role }: { teamId: string, userId: string, role: string }) => {
      const { data, error } = await supabase
        .from('team_memberships')
        .insert({
          team_id: teamId,
          user_id: userId,
          role: role as 'member' | 'lead' | 'coordinator'
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['team-memberships'] })
      toast.success('Usuario agregado al equipo')
    },
    onError: (error) => {
      console.error('Error adding team member:', error)
      toast.error('Error al agregar usuario al equipo')
    }
  })

  return {
    departments,
    teams,
    memberships,
    isLoading: loadingDepartments || loadingTeams || loadingMemberships,
    createDepartment: createDepartmentMutation.mutateAsync,
    createTeam: createTeamMutation.mutateAsync,
    addTeamMember: addTeamMemberMutation.mutateAsync,
    isCreatingDepartment: createDepartmentMutation.isPending,
    isCreatingTeam: createTeamMutation.isPending,
    isAddingMember: addTeamMemberMutation.isPending
  }
}
