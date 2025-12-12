import { Bell, BellOff, BellRing, Loader2 } from 'lucide-react'
import { usePushNotifications } from '../utils/usePushNotifications'
import { useAuth } from '../App'

// ============================================
// SEKA Money - Push Notification Toggle Component
// ============================================

export default function PushNotificationToggle({ isDark }) {
  const { user } = useAuth()
  const {
    isSupported,
    permission,
    loading,
    error,
    isSubscribed,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = usePushNotifications(user?.id)

  if (!isSupported) {
    return (
      <div className={`p-4 rounded-xl ${isDark ? 'bg-seka-card/50' : 'bg-gray-100'}`}>
        <div className="flex items-center gap-3">
          <BellOff className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
          <div>
            <p className={`text-sm font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
              Notifications non supportées
            </p>
            <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
              Ton navigateur ne supporte pas les notifications push
            </p>
          </div>
        </div>
      </div>
    )
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe()
    } else {
      await subscribe()
    }
  }

  const handleTest = async () => {
    await sendTestNotification()
  }

  return (
    <div className={`p-4 rounded-xl ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <div className="w-10 h-10 rounded-xl bg-seka-green/15 flex items-center justify-center">
              <BellRing className="w-5 h-5 text-seka-green" />
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-darker' : 'bg-gray-100'}`}>
              <Bell className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
            </div>
          )}
          <div>
            <p className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
              Notifications push
            </p>
            <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
              {isSubscribed 
                ? 'Activées - Tu recevras des alertes' 
                : permission === 'denied'
                  ? 'Bloquées dans ton navigateur'
                  : 'Désactivées'
              }
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading || permission === 'denied'}
          className={`w-12 h-7 rounded-full p-0.5 transition-colors ${
            isSubscribed 
              ? 'bg-seka-green' 
              : isDark ? 'bg-seka-darker' : 'bg-gray-300'
          } ${loading || permission === 'denied' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <div className="w-6 h-6 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            </div>
          ) : (
            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
              isSubscribed ? 'translate-x-5' : 'translate-x-0'
            }`} />
          )}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-seka-red">{error}</p>
      )}

      {permission === 'denied' && (
        <p className={`mt-2 text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
          Pour activer les notifications, va dans les paramètres de ton navigateur.
        </p>
      )}

      {isSubscribed && (
        <button
          onClick={handleTest}
          className={`mt-3 w-full py-2 rounded-lg text-sm font-medium ${
            isDark 
              ? 'bg-seka-darker text-seka-text hover:bg-seka-border' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🔔 Envoyer une notification test
        </button>
      )}
    </div>
  )
}
