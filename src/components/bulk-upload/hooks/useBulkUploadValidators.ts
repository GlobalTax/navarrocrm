import { ValidationError } from '../BaseBulkUploadDialog'

export interface ContactValidationData {
  name: string
  email?: string
  phone?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  address_country?: string
  client_type?: string
  status?: string
  relationship_type?: string
  row: number
}

export interface UserValidationData {
  email: string
  role: string
  send_email?: boolean
  message?: string
  row: number
}

export interface HubSpotValidationData {
  name: string
  email?: string
  phone?: string
  company?: string
  website?: string
  industry?: string
  lifecycle_stage?: string
  lead_status?: string
  row: number
}

export const useBulkUploadValidators = () => {
  const validateContact = (row: any, index: number): { data: ContactValidationData | null; errors: ValidationError[] } => {
    const errors: ValidationError[] = []
    
    // Validar nombre (requerido)
    if (!row.name || row.name.trim() === '') {
      errors.push({
        row: index + 1,
        field: 'name',
        message: 'El nombre es requerido'
      })
    }

    // Validar email (formato si está presente)
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push({
        row: index + 1,
        field: 'email',
        message: 'Formato de email inválido'
      })
    }

    // Validar tipo de cliente
    const validClientTypes = ['particular', 'empresa', 'autonomo']
    if (row.client_type && !validClientTypes.includes(row.client_type)) {
      errors.push({
        row: index + 1,
        field: 'client_type',
        message: `Tipo de cliente debe ser: ${validClientTypes.join(', ')}`
      })
    }

    // Validar estado
    const validStatuses = ['activo', 'inactivo', 'prospecto', 'bloqueado']
    if (row.status && !validStatuses.includes(row.status)) {
      errors.push({
        row: index + 1,
        field: 'status',
        message: `Estado debe ser: ${validStatuses.join(', ')}`
      })
    }

    // Validar tipo de relación
    const validRelationshipTypes = ['prospecto', 'cliente', 'ex_cliente']
    if (row.relationship_type && !validRelationshipTypes.includes(row.relationship_type)) {
      errors.push({
        row: index + 1,
        field: 'relationship_type',
        message: `Tipo de relación debe ser: ${validRelationshipTypes.join(', ')}`
      })
    }

    if (errors.length > 0) {
      return { data: null, errors }
    }

    const contact: ContactValidationData = {
      name: row.name.trim(),
      email: row.email?.trim() || undefined,
      phone: row.phone?.trim() || undefined,
      address_street: row.address_street?.trim() || undefined,
      address_city: row.address_city?.trim() || undefined,
      address_postal_code: row.address_postal_code?.trim() || undefined,
      address_country: row.address_country?.trim() || 'España',
      client_type: row.client_type?.trim() || 'particular',
      status: row.status?.trim() || 'activo',
      relationship_type: row.relationship_type?.trim() || 'prospecto',
      row: index + 1
    }

    return { data: contact, errors: [] }
  }

  const validateUser = (row: any, index: number): { data: UserValidationData | null; errors: ValidationError[] } => {
    const errors: ValidationError[] = []
    
    // Validar email (requerido)
    if (!row.email || row.email.trim() === '') {
      errors.push({
        row: index + 1,
        field: 'email',
        message: 'El email es requerido'
      })
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push({
        row: index + 1,
        field: 'email',
        message: 'Formato de email inválido'
      })
    }

    // Validar rol (requerido)
    const validRoles = ['partner', 'area_manager', 'senior', 'junior', 'finance']
    if (!row.role || row.role.trim() === '') {
      errors.push({
        row: index + 1,
        field: 'role',
        message: 'El rol es requerido'
      })
    } else if (!validRoles.includes(row.role.trim())) {
      errors.push({
        row: index + 1,
        field: 'role',
        message: `Rol debe ser uno de: ${validRoles.join(', ')}`
      })
    }

    // Validar send_email (opcional, por defecto true)
    let sendEmail = true
    if (row.send_email !== undefined) {
      const sendEmailStr = String(row.send_email).toLowerCase()
      if (!['true', 'false', '1', '0', 'si', 'no', 'sí'].includes(sendEmailStr)) {
        errors.push({
          row: index + 1,
          field: 'send_email',
          message: 'send_email debe ser: true/false, 1/0, si/no'
        })
      } else {
        sendEmail = ['true', '1', 'si', 'sí'].includes(sendEmailStr)
      }
    }

    if (errors.length > 0) {
      return { data: null, errors }
    }

    const user: UserValidationData = {
      email: row.email.trim().toLowerCase(),
      role: row.role.trim(),
      send_email: sendEmail,
      message: row.message?.trim() || undefined,
      row: index + 1
    }

    return { data: user, errors: [] }
  }

  const validateHubSpotContact = (row: any, index: number): { data: HubSpotValidationData | null; errors: ValidationError[] } => {
    const errors: ValidationError[] = []
    
    // Validar campos requeridos básicos
    if (!row.firstname && !row.lastname && !row.email && !row.company) {
      errors.push({
        row: index + 1,
        field: 'name',
        message: 'Se requiere al menos nombre, apellido, email o empresa'
      })
    }

    // Validar email si está presente
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push({
        row: index + 1,
        field: 'email',
        message: 'Formato de email inválido'
      })
    }

    // Validar URL del sitio web si está presente
    if (row.website && !row.website.startsWith('http')) {
      // Auto-corregir agregando https://
      row.website = `https://${row.website}`
    }

    // Validar lifecycle stage
    const validLifecycleStages = ['subscriber', 'lead', 'marketingqualifiedlead', 'salesqualifiedlead', 'opportunity', 'customer', 'evangelist', 'other']
    if (row.lifecyclestage && !validLifecycleStages.includes(row.lifecyclestage)) {
      errors.push({
        row: index + 1,
        field: 'lifecyclestage',
        message: `Lifecycle stage debe ser uno de: ${validLifecycleStages.join(', ')}`,
        suggestion: 'Usar "lead" por defecto para contactos nuevos'
      })
    }

    // Validar lead status
    const validLeadStatuses = ['new', 'open', 'in_progress', 'open_deal', 'unqualified', 'attempted_to_contact', 'connected', 'bad_timing']
    if (row.hs_lead_status && !validLeadStatuses.includes(row.hs_lead_status)) {
      errors.push({
        row: index + 1,
        field: 'hs_lead_status',
        message: `Lead status debe ser uno de: ${validLeadStatuses.join(', ')}`,
        suggestion: 'Usar "new" por defecto para contactos nuevos'
      })
    }

    if (errors.length > 0) {
      return { data: null, errors }
    }

    // Crear nombre completo combinando firstname y lastname
    const name = [row.firstname, row.lastname].filter(Boolean).join(' ').trim() || row.company || row.email || 'Sin nombre'

    const hubspotContact: HubSpotValidationData = {
      name,
      email: row.email?.trim() || undefined,
      phone: row.phone?.trim() || row.mobilephone?.trim() || undefined,
      company: row.company?.trim() || undefined,
      website: row.website?.trim() || undefined,
      industry: row.industry?.trim() || undefined,
      lifecycle_stage: row.lifecyclestage?.trim() || 'lead',
      lead_status: row.hs_lead_status?.trim() || 'new',
      row: index + 1
    }

    return { data: hubspotContact, errors: [] }
  }

  return {
    validateContact,
    validateUser,
    validateHubSpotContact
  }
}