
import { Json } from '@/integrations/supabase/types'

// Utility function to safely parse email preferences from database Json type
export function parseEmailPreferences(json: Json | null): {
  receive_followups: boolean
  receive_reminders: boolean
  receive_invitations: boolean
} | null {
  if (!json || typeof json !== 'object') return null
  
  try {
    const obj = json as any
    return {
      receive_followups: Boolean(obj.receive_followups),
      receive_reminders: Boolean(obj.receive_reminders),
      receive_invitations: Boolean(obj.receive_invitations)
    }
  } catch {
    return null
  }
}

// Default email preferences
export const defaultEmailPreferences = {
  receive_followups: true,
  receive_reminders: true,
  receive_invitations: true
}
