
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          org_id: string
          role: 'partner' | 'area_manager' | 'senior' | 'junior' | 'finance' | 'client'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          org_id: string
          role: 'partner' | 'area_manager' | 'senior' | 'junior' | 'finance' | 'client'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          org_id?: string
          role?: 'partner' | 'area_manager' | 'senior' | 'junior' | 'finance' | 'client'
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          org_id: string
          name: string
          email: string
          phone: string
          address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          email: string
          phone: string
          address: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          created_at?: string
          updated_at?: string
        }
      }
      cases: {
        Row: {
          id: string
          org_id: string
          client_id: string
          title: string
          description: string
          status: 'open' | 'in_progress' | 'completed' | 'closed'
          assigned_to: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          client_id: string
          title: string
          description: string
          status?: 'open' | 'in_progress' | 'completed' | 'closed'
          assigned_to: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          client_id?: string
          title?: string
          description?: string
          status?: 'open' | 'in_progress' | 'completed' | 'closed'
          assigned_to?: string
          created_at?: string
          updated_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          org_id: string
          user_id: string
          case_id: string
          duration_minutes: number
          description: string
          is_billable: boolean
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          case_id: string
          duration_minutes: number
          description: string
          is_billable?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          case_id?: string
          duration_minutes?: number
          description?: string
          is_billable?: boolean
          created_at?: string
        }
      }
    }
  }
}
