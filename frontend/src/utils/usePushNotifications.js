import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ============================================
// SEKA Money - Web Push Notifications Hook
// ============================================

// Clé VAPID publique
const VAPID_PUBLIC_KEY = 'BFGQMHhJV0IMDG40JSuxkxdupjd97jAu8gxrkgycKCs_hcQpejnpQZuD16vet-3a5EtR1NN761EwWsuIo-b_x7s'

function urlBase64ToUint8Array(base64String) {
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

export function usePushNotifications(userId) {
  const [permission, setPermission] = useState('default')
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Vérifier si les notifications sont supportées
  const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window

  // Charger l'état actuel
  useEffect(() => {
    if (!isSupported) {
      setLoading(false)
      return
    }

    setPermission(Notification.permission)

    // Enregistrer le SW et vérifier l'abonnement
    const init = async () => {
      try {
        await navigator.serviceWorker.register('/sw-push.js')
        const registration = await navigator.serviceWorker.ready
        const sub = await registration.pushManager.getSubscription()
        setSubscription(sub)
      } catch (err) {
        console.error('Init push error:', err)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [isSupported])

  // Demander la permission et s'abonner
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Les notifications ne sont pas supportées sur ce navigateur')
      return false
    }

    try {
      setLoading(true)
      setError(null)

      // Demander la permission
      const perm = await Notification.requestPermission()
      setPermission(perm)

      if (perm !== 'granted') {
        setError('Permission refusée')
        setLoading(false)
        return false
      }

      // Enregistrer le service worker
      const registration = await navigator.serviceWorker.ready

      if (!registration) {
        setLoading(false)
        return false
      }

      // S'abonner aux push
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      setSubscription(sub)

      // Sauvegarder dans Supabase
      if (userId) {
        const subJson = sub.toJSON()
        await supabase
          .from('push_tokens')
          .upsert({
            user_id: userId,
            token: subJson.endpoint,
            platform: 'web',
            device_info: {
              endpoint: subJson.endpoint,
              keys: subJson.keys,
              userAgent: navigator.userAgent
            }
          }, {
            onConflict: 'user_id,token'
          })
      }

      setLoading(false)
      return true

    } catch (err) {
      console.error('Push subscription error:', err)
      setError(err.message)
      setLoading(false)
      return false
    }
  }, [isSupported, userId])

  // Se désabonner
  const unsubscribe = useCallback(async () => {
    if (!subscription) return true

    try {
      setLoading(true)

      await subscription.unsubscribe()

      // Supprimer de Supabase
      if (userId) {
        await supabase
          .from('push_tokens')
          .delete()
          .eq('user_id', userId)
          .eq('token', subscription.endpoint)
      }

      setSubscription(null)
      setLoading(false)
      return true

    } catch (err) {
      console.error('Unsubscribe error:', err)
      setError(err.message)
      setLoading(false)
      return false
    }
  }, [subscription, userId])

  // Envoyer une notification de test locale
  const sendTestNotification = useCallback(async () => {
    if (permission !== 'granted') {
      const success = await subscribe()
      if (!success) return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification('🎉 Test SEKA Money', {
        body: 'Les notifications fonctionnent parfaitement !',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        tag: 'test-notification'
      })
      return true
    } catch (err) {
      console.error('Test notification error:', err)
      return false
    }
  }, [permission, subscribe])

  return {
    isSupported,
    permission,
    subscription,
    loading,
    error,
    isSubscribed: !!subscription,
    subscribe,
    unsubscribe,
    sendTestNotification
  }
}

export default usePushNotifications
