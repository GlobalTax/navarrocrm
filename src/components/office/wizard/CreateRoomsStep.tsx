
import { Badge } from '@/components/ui/badge'

interface Room {
  name: string
  capacity: number
}

interface CreateRoomsStepProps {
  sampleRooms: Room[]
}

export const CreateRoomsStep = ({ sampleRooms }: CreateRoomsStepProps) => {
  return (
    <div className="space-y-2">
      <p className="font-medium">Se crearán las siguientes salas:</p>
      {sampleRooms.map((room, index) => (
        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span>{room.name}</span>
          <Badge variant="outline">{room.capacity} personas</Badge>
        </div>
      ))}
    </div>
  )
}
