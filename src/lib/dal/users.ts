import { BaseDAL } from './base'
import { supabase } from '@/integrations/supabase/client'
import { DALResponse, DALListResponse } from './types'

export interface User {
  id: string
  email: string
  role: 'partner' | 'area_manager' | 'senior' | 'junior' | 'finance' | 'client'
  first_name?: string
  last_name?: string
  avatar_url?: string
  is_active: boolean
  org_id: string
  created_at?: string
  updated_at?: string
  last_login?: string
  phone?: string
  department_id?: string
  hourly_rate?: number
}

export interface UserInvitation {
  id: string
  email: string
  role: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  invited_by: string
  org_id: string
  expires_at: string
  token: string
  created_at?: string
  updated_at?: string
}

export class UsersDAL extends BaseDAL<User> {
  constructor() {
    super('users')
  }

  async findByEmail(email: string): Promise<DALResponse<User>> {
    if (!email) {
      return {
        data: null,
        error: new Error('Email is required'),
        success: false
      }
    }

    const query = supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    return this.handleResponse<User>(query)
  }

  async findByRole(
    orgId: string,
    role: string
  ): Promise<DALListResponse<User>> {
    return this.findMany({
      filters: { org_id: orgId, role, is_active: true },
      sort: [{ column: 'first_name', ascending: true }]
    })
  }

  async findActive(orgId: string): Promise<DALListResponse<User>> {
    return this.findMany({
      filters: { org_id: orgId, is_active: true },
      sort: [{ column: 'first_name', ascending: true }]
    })
  }

  async findByDepartment(departmentId: string): Promise<DALListResponse<User>> {
    return this.findMany({
      filters: { department_id: departmentId, is_active: true },
      sort: [{ column: 'first_name', ascending: true }]
    })
  }

  async searchUsers(
    orgId: string,
    searchTerm: string
  ): Promise<DALListResponse<User>> {
    if (!searchTerm || searchTerm.length < 2) {
      return {
        data: [],
        error: new Error('Search term must be at least 2 characters'),
        success: false,
        count: 0
      }
    }

    const query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('first_name', { ascending: true })
    
    return this.handleListResponse<User>(query)
  }

  async updateLastLogin(userId: string): Promise<DALResponse<User>> {
    return this.update(userId, { 
      last_login: new Date().toISOString() 
    } as Partial<User>)
  }

  // TODO: Implement when RPC function exists
  async getUserStats(orgId: string): Promise<DALResponse<any>> {
    // Placeholder - implement when RPC exists
    return { data: null, error: null, success: true }
  }
}

export class UserInvitationsDAL extends BaseDAL<UserInvitation> {
  constructor() {
    super('user_invitations')
  }

  async findPending(orgId: string): Promise<DALListResponse<UserInvitation>> {
    return this.findMany({
      filters: { org_id: orgId, status: 'pending' },
      sort: [{ column: 'created_at', ascending: false }]
    })
  }

  async findByToken(token: string): Promise<DALResponse<UserInvitation>> {
    if (!token) {
      return {
        data: null,
        error: new Error('Token is required'),
        success: false
      }
    }

    const query = supabase
      .from('user_invitations')
      .select('*')
      .eq('token', token)
      .single()
    
    return this.handleResponse<UserInvitation>(query)
  }

  async acceptInvitation(token: string): Promise<DALResponse<UserInvitation>> {
    const query = supabase
      .from('user_invitations')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('token', token)
      .select()
      .single()
    
    return this.handleResponse<UserInvitation>(query)
  }

  async cancelInvitation(id: string): Promise<DALResponse<UserInvitation>> {
    return this.update(id, { 
      status: 'cancelled',
      updated_at: new Date().toISOString() 
    } as Partial<UserInvitation>)
  }
}

// Singleton instances
export const usersDAL = new UsersDAL()
export const userInvitationsDAL = new UserInvitationsDAL()