import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Inbox, Send, Archive } from 'lucide-react'

const Emails = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Emails</h2>
          <p className="text-muted-foreground">
            Gestiona tu comunicación con clientes
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Email
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bandeja de Entrada</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">3 sin leer</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviados</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">hoy</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivados</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">esta semana</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emails Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { 
                from: 'Ana Martínez', 
                subject: 'Consulta sobre proceso de divorcio', 
                time: '10:30',
                unread: true
              },
              { 
                from: 'Carlos Ruiz', 
                subject: 'Documentos constitución SL', 
                time: '09:15',
                unread: true
              },
              { 
                from: 'María González', 
                subject: 'Re: Reclamación laboral - próximos pasos', 
                time: 'Ayer',
                unread: false
              },
              { 
                from: 'Juzgado de Primera Instancia', 
                subject: 'Notificación judicial CAS-2025-001', 
                time: 'Ayer',
                unread: false
              },
            ].map((email, index) => (
              <div key={index} className={`flex items-center justify-between p-4 border rounded-lg ${
                email.unread ? 'bg-blue-50 border-blue-200' : ''
              }`}>
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <h3 className={`font-medium ${email.unread ? 'font-semibold' : ''}`}>
                        {email.subject}
                      </h3>
                      <p className="text-sm text-muted-foreground">{email.from}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{email.time}</p>
                      {email.unread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto mt-1"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Emails