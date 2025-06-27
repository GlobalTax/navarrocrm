
import { useState } from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Monitor, 
  Calendar, 
  Settings, 
  Plus,
  MapPin,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { useOfficeStats } from '@/hooks/useOfficeStats'
import { OfficeRoomsManager } from '@/components/office/OfficeRoomsManager'
import { EquipmentManager } from '@/components/office/EquipmentManager'
import { ReservationsManager } from '@/components/office/ReservationsManager'
import { MaintenanceManager } from '@/components/office/MaintenanceManager'
import { OfficeSetupWizard } from '@/components/office/OfficeSetupWizard'

export default function OfficeManagement() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showSetupWizard, setShowSetupWizard] = useState(false)
  const { data: stats, isLoading, refetch } = useOfficeStats()

  const isSystemEmpty = !isLoading && stats && 
    stats.totalRooms === 0 && 
    stats.totalEquipment === 0 && 
    stats.activeReservations === 0

  const handleSetupComplete = () => {
    setShowSetupWizard(false)
    refetch()
  }

  if (showSetupWizard) {
    return (
      <StandardPageContainer>
        <OfficeSetupWizard onComplete={handleSetupComplete} />
      </StandardPageContainer>
    )
  }

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
        {isSystemEmpty && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    ¡Bienvenido a la Gestión de Oficina!
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Parece que es la primera vez que usas esta función. Te ayudamos a configurar 
                    tu sistema con algunas salas y equipos de ejemplo para que puedas empezar rápidamente.
                  </p>
                  <Button 
                    onClick={() => setShowSetupWizard(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Configurar Sistema Inicial
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
