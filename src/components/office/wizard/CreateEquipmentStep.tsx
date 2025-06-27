
import { Monitor } from 'lucide-react'

export const CreateEquipmentStep = () => {
  return (
    <div className="space-y-2">
      <p className="font-medium">Se registrarán algunos equipos básicos:</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-gray-50 rounded text-center">
          <Monitor className="h-6 w-6 mx-auto mb-1" />
          <span className="text-sm">Proyector</span>
        </div>
        <div className="p-2 bg-gray-50 rounded text-center">
          <Monitor className="h-6 w-6 mx-auto mb-1" />
          <span className="text-sm">Portátil</span>
        </div>
      </div>
    </div>
  )
}
