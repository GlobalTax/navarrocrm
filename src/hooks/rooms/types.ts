
export interface RoomReservation {
  id: string
  room_id: string
  reserved_by: string
  start_datetime: string
  end_datetime: string
  title: string
  purpose?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  attendees_count?: number
  attendees_emails?: string[]
  setup_requirements?: string
  cost?: number
  catering_requested?: boolean
  approved_by?: string
  cancelled_at?: string
  cancellation_reason?: string
  created_at: string
  updated_at: string
  org_id: string
  // Relaciones
  room?: {
    id: string
    name: string
    capacity: number
    location?: string
  }
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface CreateReservationData {
  room_id: string
  start_datetime: string
  end_datetime: string
  title: string
  purpose?: string
  attendees_count?: number
  attendees_emails?: string[]
  setup_requirements?: string
  catering_requested?: boolean
}

export interface UpdateReservationData extends Partial<CreateReservationData> {
  id: string
  status?: 'pending' | 'confirmed' | 'cancelled'
}
