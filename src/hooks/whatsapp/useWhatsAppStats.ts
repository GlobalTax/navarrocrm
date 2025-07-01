
import { WhatsAppMessage } from './types'

export const useWhatsAppStats = (messages: WhatsAppMessage[]) => {
  const getStats = () => {
    const totalSent = messages.filter(m => m.status === 'sent' || m.status === 'delivered' || m.status === 'read').length
    const totalDelivered = messages.filter(m => m.status === 'delivered' || m.status === 'read').length
    const totalRead = messages.filter(m => m.status === 'read').length
    const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0

    return {
      totalSent,
      totalDelivered,
      totalRead,
      deliveryRate
    }
  }

  return { getStats }
}
