import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'

const Contacts = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contactos</h2>
          <p className="text-muted-foreground">
            Gestiona tu base de datos de clientes
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Contacto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Contactos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Buscar contactos..."
                className="pl-8 w-full p-2 border rounded-md"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { name: 'Ana Martínez', email: 'ana@email.com', phone: '+34 600 123 456', type: 'Cliente' },
              { name: 'Carlos Ruiz', email: 'carlos@empresa.com', phone: '+34 611 234 567', type: 'Empresa' },
              { name: 'María González', email: 'maria@gmail.com', phone: '+34 622 345 678', type: 'Cliente' },
            ].map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{contact.name}</h3>
                  <p className="text-sm text-muted-foreground">{contact.email}</p>
                  <p className="text-sm text-muted-foreground">{contact.phone}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {contact.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Contacts