import { BaseDAL } from './base'
import { DALResponse, DALListResponse } from './types'

export interface EmployeeEducation {
  id: string
  employee_profile_id: string
  org_id: string
  
  // Información educativa
  education_type: 'university' | 'vocational' | 'certification' | 'course'
  institution_name: string
  degree_title: string
  field_of_study?: string
  
  // Fechas
  start_date?: string
  end_date?: string
  graduation_date?: string
  
  // Estado y validación
  status: 'completed' | 'in_progress' | 'verified'
  is_verified: boolean
  verification_date?: string
  
  // Archivos adjuntos
  certificate_file_path?: string
  
  // Metadata
  created_at?: string
  updated_at?: string
  created_by?: string
}

export interface AutonomousCollaborator {
  id: string
  employee_profile_id: string
  org_id: string
  
  // Información fiscal
  company_name?: string
  tax_identification_number: string
  vat_number?: string
  business_address?: string
  
  // Condiciones comerciales
  hourly_rate?: number
  project_rate?: number
  payment_terms: number
  preferred_payment_method: string
  
  // Servicios y especialidades
  services_offered?: string[]
  specializations?: string[]
  availability_hours?: 'full_time' | 'part_time' | 'project_based'
  
  // Facturación
  requires_invoice: boolean
  invoice_frequency: 'weekly' | 'monthly' | 'project_completion'
  
  // Estado
  collaboration_status: 'active' | 'inactive' | 'suspended'
  
  // Metadata
  created_at?: string
  updated_at?: string
  created_by?: string
}

export interface TimeAttendance {
  id: string
  employee_profile_id: string
  org_id: string
  
  // Información de asistencia
  attendance_date: string
  clock_in_time?: string
  clock_out_time?: string
  break_duration_minutes: number
  
  // Horas trabajadas
  regular_hours: number
  overtime_hours: number
  total_hours: number
  
  // Estado y tipo
  attendance_type: 'regular' | 'overtime' | 'holiday' | 'sick_leave'
  status: 'present' | 'absent' | 'late' | 'partial'
  
  // Observaciones
  notes?: string
  location?: string // oficina, remoto, cliente
  
  // Aprobación
  approved_by?: string
  approved_at?: string
  
  // Metadata
  created_at?: string
  updated_at?: string
}

export interface LeaveRequest {
  id: string
  employee_profile_id: string
  org_id: string
  
  // Información de la solicitud
  leave_type: 'vacation' | 'sick_leave' | 'personal' | 'maternity' | 'paternity'
  start_date: string
  end_date: string
  total_days: number
  
  // Detalles
  reason?: string
  emergency_contact_during_leave?: string
  work_coverage_plan?: string
  
  // Estado de aprobación
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  requested_at?: string
  reviewed_at?: string
  reviewed_by?: string
  review_notes?: string
  
  // Metadata
  created_at?: string
  updated_at?: string
  created_by?: string
}

export class EmployeeEducationDAL extends BaseDAL<EmployeeEducation> {
  constructor() {
    super('employee_education')
  }

  async findByEmployeeProfile(
    employeeProfileId: string
  ): Promise<DALListResponse<EmployeeEducation>> {
    return this.findMany({
      filters: { employee_profile_id: employeeProfileId },
      sort: [{ column: 'graduation_date', ascending: false }]
    })
  }

  async findByEducationType(
    orgId: string,
    educationType: EmployeeEducation['education_type']
  ): Promise<DALListResponse<EmployeeEducation>> {
    return this.findMany({
      filters: { org_id: orgId, education_type: educationType },
      sort: [{ column: 'graduation_date', ascending: false }]
    })
  }

  async findUnverified(orgId: string): Promise<DALListResponse<EmployeeEducation>> {
    return this.findMany({
      filters: { org_id: orgId, is_verified: false },
      sort: [{ column: 'created_at', ascending: false }]
    })
  }

  async verifyEducation(
    educationId: string,
    verifiedBy: string
  ): Promise<DALResponse<EmployeeEducation>> {
    return this.update(educationId, {
      is_verified: true,
      verification_date: new Date().toISOString().split('T')[0],
      status: 'verified'
    } as Partial<EmployeeEducation>)
  }
}

export class AutonomousCollaboratorsDAL extends BaseDAL<AutonomousCollaborator> {
  constructor() {
    super('autonomous_collaborators')
  }

  async findByStatus(
    orgId: string,
    status: AutonomousCollaborator['collaboration_status']
  ): Promise<DALListResponse<AutonomousCollaborator>> {
    return this.findMany({
      filters: { org_id: orgId, collaboration_status: status },
      sort: [{ column: 'created_at', ascending: false }]
    })
  }

  async findBySpecialization(
    orgId: string,
    specialization: string
  ): Promise<DALListResponse<AutonomousCollaborator>> {
    // Note: This would need a custom query for array contains
    return this.findMany({
      filters: { org_id: orgId, collaboration_status: 'active' },
      sort: [{ column: 'created_at', ascending: false }]
    })
  }

  async findByAvailability(
    orgId: string,
    availability: AutonomousCollaborator['availability_hours']
  ): Promise<DALListResponse<AutonomousCollaborator>> {
    return this.findMany({
      filters: { org_id: orgId, availability_hours: availability, collaboration_status: 'active' },
      sort: [{ column: 'hourly_rate', ascending: true }]
    })
  }

  async getCollaboratorStats(orgId: string): Promise<DALResponse<any>> {
    // Placeholder for complex stats calculation
    return { data: null, error: null, success: true }
  }
}

export class TimeAttendanceDAL extends BaseDAL<TimeAttendance> {
  constructor() {
    super('time_attendance')
  }

  async findByEmployeeAndDateRange(
    employeeProfileId: string,
    startDate: string,
    endDate: string
  ): Promise<DALListResponse<TimeAttendance>> {
    return this.findMany({
      filters: { employee_profile_id: employeeProfileId },
      // Note: Date range filtering would need custom query
      sort: [{ column: 'attendance_date', ascending: false }]
    })
  }

  async findByDateRange(
    orgId: string,
    startDate: string,
    endDate: string
  ): Promise<DALListResponse<TimeAttendance>> {
    return this.findMany({
      filters: { org_id: orgId },
      sort: [{ column: 'attendance_date', ascending: false }]
    })
  }

  async getPendingApprovals(orgId: string): Promise<DALListResponse<TimeAttendance>> {
    return this.findMany({
      filters: { org_id: orgId, approved_by: null },
      sort: [{ column: 'attendance_date', ascending: false }]
    })
  }

  async clockIn(
    employeeProfileId: string,
    location?: string
  ): Promise<DALResponse<TimeAttendance>> {
    const today = new Date().toISOString().split('T')[0]
    
    return this.create({
      employee_profile_id: employeeProfileId,
      attendance_date: today,
      clock_in_time: new Date().toISOString(),
      status: 'present',
      attendance_type: 'regular',
      location: location || 'office',
      regular_hours: 0,
      overtime_hours: 0,
      total_hours: 0,
      break_duration_minutes: 0
    } as Partial<TimeAttendance>)
  }

  async clockOut(attendanceId: string): Promise<DALResponse<TimeAttendance>> {
    const clockOutTime = new Date()
    
    // Note: This would need the existing record to calculate hours
    return this.update(attendanceId, {
      clock_out_time: clockOutTime.toISOString()
      // total_hours calculation would be done here
    } as Partial<TimeAttendance>)
  }
}

export class LeaveRequestsDAL extends BaseDAL<LeaveRequest> {
  constructor() {
    super('leave_requests')
  }

  async findByEmployeeProfile(
    employeeProfileId: string
  ): Promise<DALListResponse<LeaveRequest>> {
    return this.findMany({
      filters: { employee_profile_id: employeeProfileId },
      sort: [{ column: 'start_date', ascending: false }]
    })
  }

  async findByStatus(
    orgId: string,
    status: LeaveRequest['status']
  ): Promise<DALListResponse<LeaveRequest>> {
    return this.findMany({
      filters: { org_id: orgId, status },
      sort: [{ column: 'requested_at', ascending: false }]
    })
  }

  async findPendingRequests(orgId: string): Promise<DALListResponse<LeaveRequest>> {
    return this.findByStatus(orgId, 'pending')
  }

  async findUpcomingLeaves(
    orgId: string,
    daysAhead: number = 30
  ): Promise<DALListResponse<LeaveRequest>> {
    const endDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]
    
    return this.findMany({
      filters: { org_id: orgId, status: 'approved' },
      sort: [{ column: 'start_date', ascending: true }]
    })
  }

  async approveRequest(
    requestId: string,
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<DALResponse<LeaveRequest>> {
    return this.update(requestId, {
      status: 'approved',
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes
    } as Partial<LeaveRequest>)
  }

  async rejectRequest(
    requestId: string,
    reviewedBy: string,
    reviewNotes: string
  ): Promise<DALResponse<LeaveRequest>> {
    return this.update(requestId, {
      status: 'rejected',
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes
    } as Partial<LeaveRequest>)
  }

  calculateLeaveDays(
    startDate: string,
    endDate: string,
    excludeWeekends: boolean = true
  ): number {
    const start = new Date(startDate)
    const end = new Date(endDate)
    let days = 0
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (excludeWeekends && (d.getDay() === 0 || d.getDay() === 6)) {
        continue // Skip weekends
      }
      days++
    }
    
    return days
  }
}

// Singleton instances
export const employeeEducationDAL = new EmployeeEducationDAL()
export const autonomousCollaboratorsDAL = new AutonomousCollaboratorsDAL()
export const timeAttendanceDAL = new TimeAttendanceDAL()
export const leaveRequestsDAL = new LeaveRequestsDAL()