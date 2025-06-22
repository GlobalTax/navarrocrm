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
          attendees_emails: string[] | null
          auto_send_invitations: boolean
          case_id: string | null
          client_id: string | null
          created_at: string
          created_by: string
          description: string | null
          end_datetime: string
          event_type: string
          id: string
          is_all_day: boolean
          last_synced_at: string | null
          location: string | null
          org_id: string
          outlook_calendar_id: string | null
          outlook_id: string | null
          outlook_meeting_url: string | null
          reminder_minutes: number | null
          start_datetime: string
          status: string
          sync_status: string | null
          sync_with_outlook: boolean
          title: string
          updated_at: string
        }
        Insert: {
          attendees_emails?: string[] | null
          auto_send_invitations?: boolean
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_datetime: string
          event_type?: string
          id?: string
          is_all_day?: boolean
          last_synced_at?: string | null
          location?: string | null
          org_id: string
          outlook_calendar_id?: string | null
          outlook_id?: string | null
          outlook_meeting_url?: string | null
          reminder_minutes?: number | null
          start_datetime: string
          status?: string
          sync_status?: string | null
          sync_with_outlook?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          attendees_emails?: string[] | null
          auto_send_invitations?: boolean
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_datetime?: string
          event_type?: string
          id?: string
          is_all_day?: boolean
          last_synced_at?: string | null
          location?: string | null
          org_id?: string
          outlook_calendar_id?: string | null
          outlook_id?: string | null
          outlook_meeting_url?: string | null
          reminder_minutes?: number | null
          start_datetime?: string
          status?: string
          sync_status?: string | null
          sync_with_outlook?: boolean
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
      calendar_sync_log: {
        Row: {
          created_at: string
          error_message: string | null
          event_id: string | null
          id: string
          org_id: string
          outlook_event_id: string | null
          sync_data: Json | null
          sync_direction: string
          sync_status: string
          sync_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_id?: string | null
          id?: string
          org_id: string
          outlook_event_id?: string | null
          sync_data?: Json | null
          sync_direction: string
          sync_status?: string
          sync_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_id?: string | null
          id?: string
          org_id?: string
          outlook_event_id?: string | null
          sync_data?: Json | null
          sync_direction?: string
          sync_status?: string
          sync_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_sync_log_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_sync_log_org_id_fkey"
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
          communication_preferences: Json | null
          created_at: string | null
          date_closed: string | null
          date_opened: string | null
          description: string | null
          estimated_budget: number | null
          id: string
          last_email_sent_at: string | null
          matter_number: string | null
          org_id: string
          originating_solicitor_id: string | null
          practice_area: string | null
          primary_contact_email: string | null
          responsible_solicitor_id: string | null
          status: string
          template_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          billing_method?: string | null
          client_id: string
          communication_preferences?: Json | null
          created_at?: string | null
          date_closed?: string | null
          date_opened?: string | null
          description?: string | null
          estimated_budget?: number | null
          id?: string
          last_email_sent_at?: string | null
          matter_number?: string | null
          org_id: string
          originating_solicitor_id?: string | null
          practice_area?: string | null
          primary_contact_email?: string | null
          responsible_solicitor_id?: string | null
          status?: string
          template_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          billing_method?: string | null
          client_id?: string
          communication_preferences?: Json | null
          created_at?: string | null
          date_closed?: string | null
          date_opened?: string | null
          description?: string | null
          estimated_budget?: number | null
          id?: string
          last_email_sent_at?: string | null
          matter_number?: string | null
          org_id?: string
          originating_solicitor_id?: string | null
          practice_area?: string | null
          primary_contact_email?: string | null
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
          email_preferences: Json | null
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
          preferred_meeting_time: string | null
          status: string | null
          tags: string[] | null
          timezone: string | null
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
          email_preferences?: Json | null
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
          preferred_meeting_time?: string | null
          status?: string | null
          tags?: string[] | null
          timezone?: string | null
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
          email_preferences?: Json | null
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
          preferred_meeting_time?: string | null
          status?: string | null
          tags?: string[] | null
          timezone?: string | null
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
      email_templates: {
        Row: {
          body_template: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          name: string
          org_id: string
          subject_template: string
          template_type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body_template: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          subject_template: string
          template_type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body_template?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          subject_template?: string
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_threads: {
        Row: {
          case_id: string | null
          client_id: string | null
          created_at: string
          created_by: string
          id: string
          last_message_at: string | null
          message_count: number | null
          org_id: string
          outlook_thread_id: string | null
          participants: string[] | null
          status: string | null
          thread_subject: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          org_id: string
          outlook_thread_id?: string | null
          participants?: string[] | null
          status?: string | null
          thread_subject: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          org_id?: string
          outlook_thread_id?: string | null
          participants?: string[] | null
          status?: string | null
          thread_subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_threads_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_threads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_threads_org_id_fkey"
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
      organization_integrations: {
        Row: {
          auto_email_enabled: boolean
          config_data: Json | null
          created_at: string
          email_integration_enabled: boolean
          id: string
          integration_type: string
          is_enabled: boolean
          last_sync_at: string | null
          org_id: string
          outlook_client_id: string | null
          outlook_client_secret_encrypted: string | null
          outlook_tenant_id: string | null
          sync_frequency_minutes: number | null
          updated_at: string
        }
        Insert: {
          auto_email_enabled?: boolean
          config_data?: Json | null
          created_at?: string
          email_integration_enabled?: boolean
          id?: string
          integration_type?: string
          is_enabled?: boolean
          last_sync_at?: string | null
          org_id: string
          outlook_client_id?: string | null
          outlook_client_secret_encrypted?: string | null
          outlook_tenant_id?: string | null
          sync_frequency_minutes?: number | null
          updated_at?: string
        }
        Update: {
          auto_email_enabled?: boolean
          config_data?: Json | null
          created_at?: string
          email_integration_enabled?: boolean
          id?: string
          integration_type?: string
          is_enabled?: boolean
          last_sync_at?: string | null
          org_id?: string
          outlook_client_id?: string | null
          outlook_client_secret_encrypted?: string | null
          outlook_tenant_id?: string | null
          sync_frequency_minutes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_integrations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      proposal_line_items: {
        Row: {
          billing_unit: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          proposal_id: string
          quantity: number | null
          service_catalog_id: string | null
          sort_order: number | null
          total_price: number
          unit_price: number
        }
        Insert: {
          billing_unit?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          proposal_id: string
          quantity?: number | null
          service_catalog_id?: string | null
          sort_order?: number | null
          total_price: number
          unit_price: number
        }
        Update: {
          billing_unit?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          proposal_id?: string
          quantity?: number | null
          service_catalog_id?: string | null
          sort_order?: number | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_proposal_line_items_proposal"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_proposal_line_items_service"
            columns: ["service_catalog_id"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_templates: {
        Row: {
          created_at: string | null
          created_by: string
          default_frequency: string | null
          default_hourly_rate: number | null
          default_included_hours: number | null
          default_retainer_amount: number | null
          description: string | null
          id: string
          is_active: boolean | null
          is_recurring: boolean | null
          name: string
          org_id: string
          template_data: Json | null
          template_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          default_frequency?: string | null
          default_hourly_rate?: number | null
          default_included_hours?: number | null
          default_retainer_amount?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          name: string
          org_id: string
          template_data?: Json | null
          template_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          default_frequency?: string | null
          default_hourly_rate?: number | null
          default_included_hours?: number | null
          default_retainer_amount?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          name?: string
          org_id?: string
          template_data?: Json | null
          template_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          accepted_at: string | null
          assigned_to: string | null
          auto_renewal: boolean | null
          billing_day: number | null
          client_id: string
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string | null
          created_by: string
          currency: string | null
          description: string | null
          hourly_rate_extra: number | null
          id: string
          included_hours: number | null
          introduction: string | null
          is_recurring: boolean | null
          next_billing_date: string | null
          notes: string | null
          org_id: string
          pricing_tiers_data: Json | null
          proposal_number: string | null
          proposal_type: string | null
          recurring_frequency: string | null
          retainer_amount: number | null
          scope_of_work: string | null
          sent_at: string | null
          status: string
          timeline: string | null
          title: string
          total_amount: number | null
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          accepted_at?: string | null
          assigned_to?: string | null
          auto_renewal?: boolean | null
          billing_day?: number | null
          client_id: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          created_by: string
          currency?: string | null
          description?: string | null
          hourly_rate_extra?: number | null
          id?: string
          included_hours?: number | null
          introduction?: string | null
          is_recurring?: boolean | null
          next_billing_date?: string | null
          notes?: string | null
          org_id: string
          pricing_tiers_data?: Json | null
          proposal_number?: string | null
          proposal_type?: string | null
          recurring_frequency?: string | null
          retainer_amount?: number | null
          scope_of_work?: string | null
          sent_at?: string | null
          status?: string
          timeline?: string | null
          title: string
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          accepted_at?: string | null
          assigned_to?: string | null
          auto_renewal?: boolean | null
          billing_day?: number | null
          client_id?: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          created_by?: string
          currency?: string | null
          description?: string | null
          hourly_rate_extra?: number | null
          id?: string
          included_hours?: number | null
          introduction?: string | null
          is_recurring?: boolean | null
          next_billing_date?: string | null
          notes?: string | null
          org_id?: string
          pricing_tiers_data?: Json | null
          proposal_number?: string | null
          proposal_type?: string | null
          recurring_frequency?: string | null
          retainer_amount?: number | null
          scope_of_work?: string | null
          sent_at?: string | null
          status?: string
          timeline?: string | null
          title?: string
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_proposals_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_proposals_org"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_invoices: {
        Row: {
          amount: number
          billing_period_end: string | null
          billing_period_start: string | null
          client_id: string
          created_at: string | null
          due_date: string
          extra_hours: number | null
          extra_hours_amount: number | null
          hours_included: number | null
          hours_used: number | null
          id: string
          invoice_date: string
          invoice_number: string | null
          notes: string | null
          org_id: string
          proposal_id: string
          retainer_contract_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          client_id: string
          created_at?: string | null
          due_date: string
          extra_hours?: number | null
          extra_hours_amount?: number | null
          hours_included?: number | null
          hours_used?: number | null
          id?: string
          invoice_date: string
          invoice_number?: string | null
          notes?: string | null
          org_id: string
          proposal_id: string
          retainer_contract_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          client_id?: string
          created_at?: string | null
          due_date?: string
          extra_hours?: number | null
          extra_hours_amount?: number | null
          hours_included?: number | null
          hours_used?: number | null
          id?: string
          invoice_date?: string
          invoice_number?: string | null
          notes?: string | null
          org_id?: string
          proposal_id?: string
          retainer_contract_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_invoices_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_invoices_retainer_contract_id_fkey"
            columns: ["retainer_contract_id"]
            isOneToOne: false
            referencedRelation: "retainer_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_revenue_metrics: {
        Row: {
          active_retainers: number | null
          active_subscriptions: number | null
          annual_recurring_revenue: number | null
          churn_rate: number | null
          churned_mrr: number | null
          contraction_mrr: number | null
          created_at: string | null
          expansion_mrr: number | null
          id: string
          metric_date: string
          monthly_recurring_revenue: number | null
          new_mrr: number | null
          org_id: string
        }
        Insert: {
          active_retainers?: number | null
          active_subscriptions?: number | null
          annual_recurring_revenue?: number | null
          churn_rate?: number | null
          churned_mrr?: number | null
          contraction_mrr?: number | null
          created_at?: string | null
          expansion_mrr?: number | null
          id?: string
          metric_date: string
          monthly_recurring_revenue?: number | null
          new_mrr?: number | null
          org_id: string
        }
        Update: {
          active_retainers?: number | null
          active_subscriptions?: number | null
          annual_recurring_revenue?: number | null
          churn_rate?: number | null
          churned_mrr?: number | null
          contraction_mrr?: number | null
          created_at?: string | null
          expansion_mrr?: number | null
          id?: string
          metric_date?: string
          monthly_recurring_revenue?: number | null
          new_mrr?: number | null
          org_id?: string
        }
        Relationships: []
      }
      retainer_contracts: {
        Row: {
          client_id: string
          contract_end_date: string | null
          contract_start_date: string
          created_at: string | null
          hourly_rate_extra: number
          id: string
          included_hours: number
          last_invoice_date: string | null
          next_invoice_date: string | null
          org_id: string
          proposal_id: string
          retainer_amount: number
          status: string | null
          updated_at: string | null
          used_hours: number | null
        }
        Insert: {
          client_id: string
          contract_end_date?: string | null
          contract_start_date: string
          created_at?: string | null
          hourly_rate_extra: number
          id?: string
          included_hours?: number
          last_invoice_date?: string | null
          next_invoice_date?: string | null
          org_id: string
          proposal_id: string
          retainer_amount: number
          status?: string | null
          updated_at?: string | null
          used_hours?: number | null
        }
        Update: {
          client_id?: string
          contract_end_date?: string | null
          contract_start_date?: string
          created_at?: string | null
          hourly_rate_extra?: number
          id?: string
          included_hours?: number
          last_invoice_date?: string | null
          next_invoice_date?: string | null
          org_id?: string
          proposal_id?: string
          retainer_amount?: number
          status?: string | null
          updated_at?: string | null
          used_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "retainer_contracts_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_metrics: {
        Row: {
          average_deal_size: number | null
          conversion_rate: number | null
          created_at: string | null
          id: string
          metric_date: string
          org_id: string
          proposals_lost: number | null
          proposals_sent: number | null
          proposals_won: number | null
          total_revenue: number | null
        }
        Insert: {
          average_deal_size?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          metric_date: string
          org_id: string
          proposals_lost?: number | null
          proposals_sent?: number | null
          proposals_won?: number | null
          total_revenue?: number | null
        }
        Update: {
          average_deal_size?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          metric_date?: string
          org_id?: string
          proposals_lost?: number | null
          proposals_sent?: number | null
          proposals_won?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_revenue_metrics_org"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      service_catalog: {
        Row: {
          billing_unit: string | null
          created_at: string | null
          default_price: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          org_id: string
          practice_area_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_unit?: string | null
          created_at?: string | null
          default_price?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          org_id: string
          practice_area_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_unit?: string | null
          created_at?: string | null
          default_price?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          org_id?: string
          practice_area_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_service_catalog_org"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_service_catalog_practice_area"
            columns: ["practice_area_id"]
            isOneToOne: false
            referencedRelation: "practice_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_services: {
        Row: {
          base_price: number
          billing_frequency: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          org_id: string
          proposal_id: string
          service_name: string
          updated_at: string | null
        }
        Insert: {
          base_price?: number
          billing_frequency?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          org_id: string
          proposal_id: string
          service_name: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          billing_frequency?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          org_id?: string
          proposal_id?: string
          service_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_services_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          id: string
          role: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          id?: string
          role?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          id?: string
          role?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          task_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          task_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          task_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          mentions: string[] | null
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          org_id: string
          template_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          org_id: string
          template_data: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          org_id?: string
          template_data?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          case_id: string | null
          client_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          is_recurring: boolean | null
          org_id: string
          parent_task_id: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          recurring_pattern: Json | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"]
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          case_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          is_recurring?: boolean | null
          org_id: string
          parent_task_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          recurring_pattern?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          case_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          is_recurring?: boolean | null
          org_id?: string
          parent_task_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          recurring_pattern?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
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
      user_outlook_tokens: {
        Row: {
          access_token_encrypted: string
          created_at: string
          id: string
          is_active: boolean
          last_used_at: string | null
          org_id: string
          outlook_email: string | null
          refresh_token_encrypted: string
          scope_permissions: string[] | null
          token_expires_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          org_id: string
          outlook_email?: string | null
          refresh_token_encrypted: string
          scope_permissions?: string[] | null
          token_expires_at: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          org_id?: string
          outlook_email?: string | null
          refresh_token_encrypted?: string
          scope_permissions?: string[] | null
          token_expires_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_outlook_tokens_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      calculate_recurring_revenue_metrics: {
        Args: { org_uuid: string; target_date?: string }
        Returns: undefined
      }
      calculate_revenue_metrics: {
        Args: { org_uuid: string; target_date?: string }
        Returns: undefined
      }
      cleanup_expired_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_matter_number: {
        Args: { org_uuid: string }
        Returns: string
      }
      generate_proposal_number: {
        Args: { org_uuid: string }
        Returns: string
      }
      get_task_stats: {
        Args: { org_uuid: string }
        Returns: {
          total_tasks: number
          pending_tasks: number
          in_progress_tasks: number
          completed_tasks: number
          overdue_tasks: number
          high_priority_tasks: number
        }[]
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
      proposal_status:
        | "draft"
        | "sent"
        | "viewed"
        | "accepted"
        | "declined"
        | "invoiced"
        | "archived"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
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
      proposal_status: [
        "draft",
        "sent",
        "viewed",
        "accepted",
        "declined",
        "invoiced",
        "archived",
      ],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
    },
  },
} as const
