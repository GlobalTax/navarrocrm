
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import { ProposalTeamMember } from '@/hooks/useProposalProfessional'

interface TeamManagerProps {
  team: ProposalTeamMember[]
  onTeamChange: (team: ProposalTeamMember[]) => void
}

export const TeamManager: React.FC<TeamManagerProps> = ({ team, onTeamChange }) => {
  const addMember = () => {
    const newMember: ProposalTeamMember = {
      id: crypto.randomUUID(),
      name: '',
      role: '',
      experience: ''
    }
    onTeamChange([...team, newMember])
  }

  const removeMember = (memberId: string) => {
    onTeamChange(team.filter(m => m.id !== memberId))
  }

  const updateMember = (memberId: string, field: keyof ProposalTeamMember, value: string) => {
    onTeamChange(team.map(m => 
      m.id === memberId ? { ...m, [field]: value } : m
    ))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">Equipo Responsable</Label>
        <Button onClick={addMember} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Añadir Miembro
        </Button>
      </div>

      {team.map((member) => (
        <Card key={member.id}>
          <CardContent className="pt-4">
            <div className="flex justify-between items-start mb-4">
              <Label className="font-medium">Miembro del Equipo</Label>
              <Button
                onClick={() => removeMember(member.id)}
                variant="ghost"
                size="sm"
                disabled={team.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={member.name}
                  onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                  placeholder="Ej: Samuel L. Navarro"
                />
              </div>
              <div>
                <Label>Cargo/Rol</Label>
                <Input
                  value={member.role}
                  onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                  placeholder="Ej: Socio Fiscal Coordinador"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <Label>Experiencia y Especialización</Label>
              <Textarea
                value={member.experience || ''}
                onChange={(e) => updateMember(member.id, 'experience', e.target.value)}
                placeholder="Ej: Más de 20 años de experiencia en planificación fiscal..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
