
export interface OfficeRoom {
  id: string
  org_id: string
  name: string
  description?: string
  capacity: number
  room_type: string
  location?: string
  floor?: string
  equipment_available?: string[]
  hourly_rate: number
  is_bookable: boolean
  is_active: boolean
  amenities: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Equipment {
  id: string
  org_id: string
  name: string
  description?: string
  category: string
  serial_number?: string
  brand?: string
  model?: string
  purchase_date?: string
  warranty_expiry?: string
  purchase_cost?: number
  current_location?: string
  room_id?: string
  assigned_to?: string
  status: 'available' | 'assigned' | 'maintenance' | 'retired'
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  maintenance_schedule?: string
  last_maintenance_date?: string
  next_maintenance_date?: string
  notes?: string
  qr_code?: string
  created_at: string
  updated_at: string
}

export interface RoomReservation {
  id: string
  org_id: string
  room_id: string
  reserved_by: string
  title: string
  description?: string
  start_datetime: string
  end_datetime: string
  attendees_count: number
  attendees_emails?: string[]
  setup_requirements?: string
  catering_requested: boolean
  recurring_pattern?: string
  recurring_until?: string
  status: 'confirmed' | 'pending' | 'cancelled'
  cost: number
  approved_by?: string
  cancelled_at?: string
  cancellation_reason?: string
  created_at: string
  updated_at: string
}

export interface EquipmentAssignment {
  id: string
  org_id: string
  equipment_id: string
  assigned_to: string
  assigned_by: string
  assignment_type: 'temporary' | 'permanent'
  start_date: string
  end_date?: string
  purpose?: string
  location?: string
  status: 'active' | 'returned' | 'overdue'
  return_condition?: string
  return_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface EquipmentMaintenance {
  id: string
  org_id: string
  equipment_id: string
  maintenance_type: 'preventive' | 'corrective' | 'emergency'
  scheduled_date: string
  completed_date?: string
  performed_by?: string
  cost: number
  description?: string
  issues_found?: string
  actions_taken?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  notes?: string
  created_at: string
  updated_at: string
}

export interface OfficeStats {
  totalRooms: number
  totalEquipment: number
  availableEquipment: number
  activeReservations: number
  todayReservations: number
  pendingMaintenance: number
}
