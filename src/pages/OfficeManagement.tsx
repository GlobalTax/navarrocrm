
import { useState } from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Monitor, 
  Calendar, 
  Settings, 
  Plus,
  Users,
  MapPin,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { useOfficeStats } from '@/hooks/useOfficeStats'
import { OfficeRoomsManager } from '@/components/office/OfficeRoomsManager'
import { EquipmentManager } from '@/components/office/EquipmentManager'
import { ReservationsManager } from '@/components/office/ReservationsManager'
import { MaintenanceManager } from '@/components/office/MaintenanceManager'

export default function OfficeManagement() {
  const [activeTab, setActiveTab] = useState('overview')
  const { data: stats, isLoading } = useOfficeStats()

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Gestión de Oficina"
        description="Administra salas, equipos, reservas y mantenimiento"
        primaryAction={{
          label: 'Nueva Reserva',
          onClick: () => setActiveTab('reservations')
        }}
      />

      <div className="space-y-6">
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Salas Totales</p>
                  <p className="text-2xl font-bold">{stats?.totalRooms || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Monitor className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Equipos Disponibles</p>
                  <p className="text-2xl font-bold">{stats?.availableEquipment || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reservas Activas</p>
                  <p className="text-2xl font-bold">{stats?.activeReservations || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hoy</p>
                  <p className="text-2xl font-bold">{stats?.todayReservations || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mantenimiento</p>
                  <p className="text-2xl font-bold">{stats?.pendingMaintenance || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Settings className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Equipos</p>
                  <p className="text-2xl font-bold">{stats?.totalEquipment || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full lg:w-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Salas
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Equipos
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Reservas
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Mantenimiento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Próximas Reservas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Vista rápida de las próximas reservas de salas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Alertas de Mantenimiento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Equipos que requieren mantenimiento próximamente
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rooms">
            <OfficeRoomsManager />
          </TabsContent>

          <TabsContent value="equipment">
            <EquipmentManager />
          </TabsContent>

          <TabsContent value="reservations">
            <ReservationsManager />
          </TabsContent>

          <TabsContent value="maintenance">
            <MaintenanceManager />
          </TabsContent>
        </Tabs>
      </div>
    </StandardPageContainer>
  )
}
