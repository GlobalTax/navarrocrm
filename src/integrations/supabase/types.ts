export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_usage_logs: {
        Row: {
          completion_tokens: number | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          estimated_cost: number | null
          function_name: string
          id: string
          model_used: string | null
          org_id: string
          prompt_tokens: number | null
          success: boolean | null
          total_tokens: number | null
          user_id: string
        }
        Insert: {
          completion_tokens?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          estimated_cost?: number | null
          function_name?: string
          id?: string
          model_used?: string | null
          org_id: string
          prompt_tokens?: number | null
          success?: boolean | null
          total_tokens?: number | null
          user_id: string
        }
        Update: {
          completion_tokens?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          estimated_cost?: number | null
          function_name?: string
          id?: string
          model_used?: string | null
          org_id?: string
          prompt_tokens?: number | null
          success?: boolean | null
          total_tokens?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          case_id: string | null
          client_id: string | null
          created_at: string
          created_by: string
          description: string | null
          end_datetime: string
          event_type: string
          id: string
          is_all_day: boolean
          location: string | null
          org_id: string
          reminder_minutes: number | null
          start_datetime: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_datetime: string
          event_type?: string
          id?: string
          is_all_day?: boolean
          location?: string | null
          org_id: string
          reminder_minutes?: number | null
          start_datetime: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_datetime?: string
          event_type?: string
          id?: string
          is_all_day?: boolean
          location?: string | null
          org_id?: string
          reminder_minutes?: number | null
          start_datetime?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          billing_method: string | null
          client_id: string
          created_at: string | null
          date_closed: string | null
          date_opened: string | null
          description: string | null
          estimated_budget: number | null
          id: string
          matter_number: string | null
          org_id: string
          originating_solicitor_id: string | null
          practice_area: string | null
          responsible_solicitor_id: string | null
          status: string
          template_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          billing_method?: string | null
          client_id: string
          created_at?: string | null
          date_closed?: string | null
          date_opened?: string | null
          description?: string | null
          estimated_budget?: number | null
          id?: string
          matter_number?: string | null
          org_id: string
          originating_solicitor_id?: string | null
          practice_area?: string | null
          responsible_solicitor_id?: string | null
          status?: string
          template_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          billing_method?: string | null
          client_id?: string
          created_at?: string | null
          date_closed?: string | null
          date_opened?: string | null
          description?: string | null
          estimated_budget?: number | null
          id?: string
          matter_number?: string | null
          org_id?: string
          originating_solicitor_id?: string | null
          practice_area?: string | null
          responsible_solicitor_id?: string | null
          status?: string
          template_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_originating_solicitor_id_fkey"
            columns: ["originating_solicitor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_responsible_solicitor_id_fkey"
            columns: ["responsible_solicitor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "matter_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          client_id: string
          created_at: string | null
          description: string | null
          document_type: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          org_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          org_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          org_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notes: {
        Row: {
          client_id: string
          content: string | null
          created_at: string | null
          id: string
          is_private: boolean | null
          note_type: string | null
          org_id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          note_type?: string | null
          org_id: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          note_type?: string | null
          org_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_postal_code: string | null
          address_street: string | null
          business_sector: string | null
          client_type: string | null
          contact_preference: string | null
          created_at: string | null
          dni_nif: string | null
          email: string | null
          hourly_rate: number | null
          how_found_us: string | null
          id: string
          internal_notes: string | null
          last_contact_date: string | null
          legal_representative: string | null
          name: string
          org_id: string
          payment_method: string | null
          phone: string | null
          preferred_language: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          business_sector?: string | null
          client_type?: string | null
          contact_preference?: string | null
          created_at?: string | null
          dni_nif?: string | null
          email?: string | null
          hourly_rate?: number | null
          how_found_us?: string | null
          id?: string
          internal_notes?: string | null
          last_contact_date?: string | null
          legal_representative?: string | null
          name: string
          org_id: string
          payment_method?: string | null
          phone?: string | null
          preferred_language?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          business_sector?: string | null
          client_type?: string | null
          contact_preference?: string | null
          created_at?: string | null
          dni_nif?: string | null
          email?: string | null
          hourly_rate?: number | null
          how_found_us?: string | null
          id?: string
          internal_notes?: string | null
          last_contact_date?: string | null
          legal_representative?: string | null
          name?: string
          org_id?: string
          payment_method?: string | null
          phone?: string | null
          preferred_language?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      matter_notifications: {
        Row: {
          case_id: string
          created_at: string | null
          event_type: string
          id: string
          is_enabled: boolean | null
          notification_type: string
          org_id: string
          user_id: string
        }
        Insert: {
          case_id: string
          created_at?: string | null
          event_type: string
          id?: string
          is_enabled?: boolean | null
          notification_type: string
          org_id: string
          user_id: string
        }
        Update: {
          case_id?: string
          created_at?: string | null
          event_type?: string
          id?: string
          is_enabled?: boolean | null
          notification_type?: string
          org_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matter_notifications_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      matter_permissions: {
        Row: {
          case_id: string
          created_at: string | null
          id: string
          org_id: string
          permission_type: string
          user_id: string
        }
        Insert: {
          case_id: string
          created_at?: string | null
          id?: string
          org_id: string
          permission_type: string
          user_id: string
        }
        Update: {
          case_id?: string
          created_at?: string | null
          id?: string
          org_id?: string
          permission_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matter_permissions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_permissions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      matter_stages: {
        Row: {
          case_id: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          name: string
          org_id: string
          sort_order: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          case_id: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          org_id: string
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          case_id?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          org_id?: string
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matter_stages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_stages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      matter_templates: {
        Row: {
          created_at: string | null
          created_by: string
          default_billing_method: string | null
          description: string | null
          id: string
          name: string
          org_id: string
          practice_area_id: string | null
          template_data: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          default_billing_method?: string | null
          description?: string | null
          id?: string
          name: string
          org_id: string
          practice_area_id?: string | null
          template_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          default_billing_method?: string | null
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          practice_area_id?: string | null
          template_data?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matter_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_templates_practice_area_id_fkey"
            columns: ["practice_area_id"]
            isOneToOne: false
            referencedRelation: "practice_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      practice_areas: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          org_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          org_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_areas_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          case_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_billable: boolean
          org_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_billable?: boolean
          org_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_billable?: boolean
          org_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          org_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          org_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          org_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          org_id: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          org_id?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          org_id?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_matter_number: {
        Args: { org_uuid: string }
        Returns: string
      }
      get_user_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_super_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_system_setup: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "manager"
        | "senior"
        | "junior"
        | "finance"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "admin",
        "manager",
        "senior",
        "junior",
        "finance",
      ],
    },
  },
} as const
