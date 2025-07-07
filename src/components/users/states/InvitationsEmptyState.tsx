import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Send, UserPlus } from 'lucide-react'

interface InvitationsEmptyStateProps {
  onInviteUser: () => void
}

export const InvitationsEmptyState = ({ onInviteUser }: InvitationsEmptyStateProps) => {
  return (
    <Card className="border-0.5 border-black rounded-[10px]">
      <CardContent className="text-center py-16">
        <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Send className="h-10 w-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">
          No hay invitaciones enviadas
        </h3>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Las invitaciones que envíes a nuevos usuarios aparecerán aquí. 
          Podrás hacer seguimiento de su estado y reenviarlas si es necesario.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={onInviteUser}
            className="border-0.5 border-black rounded-[10px] hover-lift"
            size="lg"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Enviar primera invitación
          </Button>
          <Button 
            variant="outline"
            className="border-0.5 border-black rounded-[10px] hover-lift"
            size="lg"
          >
            <Mail className="h-5 w-5 mr-2" />
            Configurar emails
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}