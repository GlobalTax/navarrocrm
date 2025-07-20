
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Users, Mail } from 'lucide-react'
import { validateAndSanitizeEmail } from '@/lib/security'

interface AttendeeManagerProps {
  attendees: string[]
  onAttendeesChange: (attendees: string[]) => void
  disabled?: boolean
}

export const AttendeeManager = ({
  attendees,
  onAttendeesChange,
  disabled = false
}: AttendeeManagerProps) => {
  const [newEmail, setNewEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const addAttendee = () => {
    const result = validateAndSanitizeEmail(newEmail)
    
    if (!result.isValid) {
      setEmailError(result.error || 'Email inválido')
      return
    }

    if (attendees.includes(result.sanitizedEmail)) {
      setEmailError('Este email ya está en la lista')
      return
    }

    onAttendeesChange([...attendees, result.sanitizedEmail])
    setNewEmail('')
    setEmailError('')
  }

  const removeAttendee = (index: number) => {
    const updated = attendees.filter((_, i) => i !== index)
    onAttendeesChange(updated)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addAttendee()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Participantes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-attendee">Añadir participante</Label>
          <div className="flex gap-2">
            <Input
              id="new-attendee"
              type="email"
              placeholder="email@ejemplo.com"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value)
                setEmailError('')
              }}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              className={emailError ? 'border-red-500' : ''}
            />
            <Button 
              type="button" 
              onClick={addAttendee}
              disabled={disabled}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {emailError && (
            <p className="text-sm text-red-600">{emailError}</p>
          )}
        </div>

        {attendees.length > 0 && (
          <div className="space-y-2">
            <Label>Participantes confirmados ({attendees.length})</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {attendees.map((email, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{email}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttendee(index)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {attendees.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay participantes añadidos</p>
            <p className="text-xs">Añade emails para enviar invitaciones automáticamente</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
