
import { useRoomReservationsQueries } from './useRoomReservationsQueries'
import { useRoomReservationsMutations } from './useRoomReservationsMutations'

export const useRoomReservations = (roomId?: string) => {
  const queries = useRoomReservationsQueries(roomId)
  const mutations = useRoomReservationsMutations()

  return {
    ...queries,
    ...mutations
  }
}

// Re-export types for convenience
export type { RoomReservation, CreateReservationData, UpdateReservationData } from './types'
