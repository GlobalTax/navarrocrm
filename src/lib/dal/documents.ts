import { BaseDAL } from './base'
import { supabase } from '@/integrations/supabase/client'
import { DALResponse, DALListResponse } from './types'

export interface Document {
  id: string
  title: string
  content: string
  document_type: 'contract' | 'template' | 'letter' | 'report' | 'other'
  status: 'draft' | 'review' | 'approved' | 'signed' | 'archived'
  version_number: number
  case_id?: string
  contact_id?: string
  template_id?: string
  variables_data?: Record<string, any>
  created_by: string
  org_id: string
  created_at?: string
  updated_at?: string
  file_path?: string
  file_size?: number
}

export interface DocumentTemplate {
  id: string
  name: string
  description?: string
  content: string
  variables: string[]
  category: string
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
  variables_data?: Record<string, any>
  changes_summary?: string
  created_by: string
  org_id: string
  created_at?: string
}

export class DocumentsDAL extends BaseDAL<Document> {
  constructor() {
    super('documents')
  }

  async findByCase(caseId: string): Promise<DALListResponse<Document>> {
    return this.findMany({
      filters: { case_id: caseId },
      sort: [{ column: 'created_at', ascending: false }]
    })
  }

  async findByContact(contactId: string): Promise<DALListResponse<Document>> {
    return this.findMany({
      filters: { contact_id: contactId },
      sort: [{ column: 'created_at', ascending: false }]
    })
  }

  async findByType(
    orgId: string,
    documentType: string
  ): Promise<DALListResponse<Document>> {
    return this.findMany({
      filters: { org_id: orgId, document_type: documentType },
      sort: [{ column: 'created_at', ascending: false }]
    })
  }

  async findVersions(documentId: string): Promise<DALListResponse<DocumentVersion>> {
    const query = supabase
      .from('document_versions')
      .select('*', { count: 'exact' })
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
    
    return this.handleListResponse<DocumentVersion>(query)
  }

  async createVersion(versionData: Omit<DocumentVersion, 'id' | 'created_at'>): Promise<DALResponse<DocumentVersion>> {
    const query = supabase
      .from('document_versions')
      .insert(versionData)
      .select()
      .single()
    
    return this.handleResponse<DocumentVersion>(query)
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
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
    
    return this.handleListResponse<Document>(query)
  }
}

export class DocumentTemplatesDAL extends BaseDAL<DocumentTemplate> {
  constructor() {
    super('document_templates')
  }

  async findByCategory(
    orgId: string,
    category: string
  ): Promise<DALListResponse<DocumentTemplate>> {
    return this.findMany({
      filters: { org_id: orgId, category, is_active: true },
      sort: [{ column: 'name', ascending: true }]
    })
  }

  async findActive(orgId: string): Promise<DALListResponse<DocumentTemplate>> {
    return this.findMany({
      filters: { org_id: orgId, is_active: true },
      sort: [{ column: 'name', ascending: true }]
    })
  }
}

// Singleton instances
export const documentsDAL = new DocumentsDAL()
export const documentTemplatesDAL = new DocumentTemplatesDAL()

// Re-export types for convenience
export type { Document, DocumentTemplate, DocumentVersion }