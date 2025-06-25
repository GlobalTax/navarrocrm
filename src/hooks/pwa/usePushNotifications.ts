
import { useState, useEffect, useCallback } from 'react'

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    setPermission(Notification.permission)
  }, [])

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      throw new Error('Este navegador no soporta notificaciones')
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }, [])

  const subscribeToPush = useCallback(async (vapidPublicKey: string) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications no soportadas')
    }

    const registration = await navigator.serviceWorker.ready
    const existingSubscription = await registration.pushManager.getSubscription()

    if (existingSubscription) {
      setSubscription(existingSubscription)
      return existingSubscription
    }

    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    })

    setSubscription(newSubscription)
    return newSubscription
  }, [])

  const unsubscribeFromPush = useCallback(async () => {
    if (subscription) {
      await subscription.unsubscribe()
      setSubscription(null)
    }
  }, [subscription])

  const registerPushNotifications = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications no soportadas')
      return null
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.VITE_VAPID_PUBLIC_KEY || ''
        )
      })

      return subscription
    } catch (error) {
      console.error('Error al registrar push notifications:', error)
      return null
    }
  }, [])

  return {
    permission,
    subscription,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    registerPushNotifications
  }
}

// Función auxiliar para convertir VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
