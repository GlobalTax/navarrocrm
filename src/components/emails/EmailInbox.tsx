import { useState } from 'react'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Inbox, Send, FileText, Search, Filter } from 'lucide-react'

interface EmailInboxProps {
  folder?: 'inbox' | 'sent' | 'drafts'
}

export function EmailInbox({ folder = 'inbox' }: EmailInboxProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const getFolderConfig = () => {
    switch (folder) {
      case 'sent':
        return {
          title: 'Emails Enviados',
          description: 'Mensajes que has enviado',
          icon: Send,
          emptyMessage: 'No hay emails enviados'
        }
      case 'drafts':
        return {
          title: 'Borradores',
          description: 'Mensajes sin enviar',
          icon: FileText,
          emptyMessage: 'No hay borradores guardados'
        }
      default:
        return {
          title: 'Bandeja de Entrada',
          description: 'Emails recibidos',
          icon: Inbox,
          emptyMessage: 'La bandeja está vacía'
        }
    }
  }

  const config = getFolderConfig()
  const Icon = config.icon

  return (
    <div className="space-y-6">
      <StandardPageHeader
        title={config.title}
        description={config.description}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Search className="h-4 w-4" />
              Buscar
            </Button>
          </div>
        }
      />

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar emails..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-0.5 border-black rounded-[10px]"
        />
      </div>

      {/* Lista de emails */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardContent className="p-6">
          <div className="text-center py-12 text-muted-foreground">
            <Icon className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">{config.emptyMessage}</h3>
            <p className="text-sm">
              {folder === 'inbox' 
                ? 'Conecta tu cuenta de Outlook para ver los emails aquí'
                : 'Los emails aparecerán una vez que los crees'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}