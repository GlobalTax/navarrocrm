
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { OfficeStats } from '@/types/office'

export const useOfficeStats = () => {
  return useQuery({
    queryKey: ['office-stats'],
    queryFn: async () => {
      try {
        const user = await supabase.auth.getUser()
        if (!user.data.user?.user_metadata?.org_id) {
          throw new Error('No organization ID found')
        }

        const { data, error } = await supabase.rpc('get_office_stats', {
          org_uuid: user.data.user.user_metadata.org_id
        })

        if (error) {
          console.warn('Error calling get_office_stats function, using fallback:', error)
          
          // Fallback: obtener datos manualmente
          const [roomsResult, equipmentResult, reservationsResult] = await Promise.all([
            supabase.from('office_rooms').select('id').eq('is_active', true),
            supabase.from('equipment_inventory').select('id, status'),
            supabase.from('room_reservations').select('id, status, start_datetime, end_datetime')
          ])

          const stats: OfficeStats = {
            totalRooms: roomsResult.data?.length || 0,
            totalEquipment: equipmentResult.data?.length || 0,
            availableEquipment: equipmentResult.data?.filter(eq => eq.status === 'available').length || 0,
            activeReservations: reservationsResult.data?.filter(res => 
              res.status === 'confirmed' && new Date(res.end_datetime) > new Date()
            ).length || 0,
            todayReservations: reservationsResult.data?.filter(res => {
              const today = new Date().toDateString()
              return res.status === 'confirmed' && new Date(res.start_datetime).toDateString() === today
            }).length || 0,
            pendingMaintenance: 0 // Fallback value
          }

          return stats
        }

        return data as OfficeStats
      } catch (error) {
        console.error('Error fetching office stats:', error)
        // Return default stats if there's an error
        return {
          totalRooms: 0,
          totalEquipment: 0,
          availableEquipment: 0,
          activeReservations: 0,
          todayReservations: 0,
          pendingMaintenance: 0
        } as OfficeStats
      }
    }
  })
}
