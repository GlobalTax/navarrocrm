// Documents Feature - TODO: Migrate from existing components
// Note: 'documents' table doesn't exist in Supabase yet
// Using contact_documents as temporary solution

import { BaseDAL } from './base'
import { supabase } from '@/integrations/supabase/client'
import { DALResponse, DALListResponse } from './types'

export interface Document {
  id: string
  file_name: string
  description?: string
  document_type: string
  file_path: string
  file_type?: string
  file_size?: number
  contact_id: string
  user_id: string
  org_id: string
  created_at?: string
  updated_at?: string
}

export interface DocumentTemplate {
  id: string
  name: string
  description?: string
  category: string
  content: string
  variables: string[]
  default_values?: any
  is_active: boolean
  org_id: string
  created_by: string
  created_at?: string
  updated_at?: string
}

export interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  content: string
  variables_data?: any
  changes_summary?: string
  created_by: string
  org_id: string
  created_at?: string
}

export class DocumentsDAL extends BaseDAL<Document> {
  constructor() {
    super('contact_documents') // Using existing table
  }

  async findByContact(contactId: string): Promise<DALListResponse<Document>> {
    return this.findMany({
      filters: { contact_id: contactId },
      sort: [{ column: 'created_at', ascending: false }]
    })
  }

  async findByType(
    orgId: string, 
    type: string
  ): Promise<DALListResponse<Document>> {
    return this.findMany({
      filters: { org_id: orgId, document_type: type },
      sort: [{ column: 'created_at', ascending: false }]
    })
  }

  async searchDocuments(
    orgId: string, 
    searchTerm: string
  ): Promise<DALListResponse<Document>> {
    if (!searchTerm || searchTerm.length < 2) {
      return {
        data: [],
        error: new Error('Search term must be at least 2 characters'),
        success: false,
        count: 0
      }
    }

    const query = supabase
      .from('contact_documents')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)
      .or(`file_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
    
    return this.handleListResponse<Document>(query)
  }
}

// TODO: Implement when document_templates table exists
export class DocumentTemplatesDAL {
  async findByCategory(orgId: string, category: string) {
    // Placeholder - implement when table exists
    return { data: [], error: null, success: true, count: 0 }
  }
}

// Singleton instances
export const documentsDAL = new DocumentsDAL()
export const documentTemplatesDAL = new DocumentTemplatesDAL()
