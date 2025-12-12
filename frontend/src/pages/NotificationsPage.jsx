import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Bell, BellOff, CheckCheck, Settings, Trash2,
  AlertCircle, RefreshCw, Target, TrendingUp, Calendar, Sparkles, X
} from 'lucide-react'
import { useTheme, useAuth } from '../App'
import { useNotifications, useNotificationPreferences } from '../utils/useNotifications'
import PushNotificationToggle from '../components/PushNotificationToggle'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { user } = useAuth()
  const [showSettings, setShowSettings] = useState(false)

  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    refresh 
  } = useNotifications(user?.id)

  const { 
    preferences, 
    updatePreferences,
    loading: prefsLoading 
  } = useNotificationPreferences(user?.id)

  // Icône selon le type de notification
  const getIcon = (type) => {
    switch (type) {
      case 'budget_alert':
        return <AlertCircle className="w-5 h-5 text-amber-500" />
      case 'recurring_added':
        return <RefreshCw className="w-5 h-5 text-blue-500" />
      case 'goal_progress':
        return <Target className="w-5 h-5 text-seka-green" />
      case 'weekly_summary':
        return <TrendingUp className="w-5 h-5 text-purple-500" />
      case 'daily_reminder':
        return <Calendar className="w-5 h-5 text-cyan-500" />
      default:
        return <Sparkles className="w-5 h-5 text-seka-gold" />
    }
  }

  // Format date relative
  const formatRelativeDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'À l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins}min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-seka-green/30 border-t-seka-green rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen pb-24 ${isDark ? 'bg-seka-dark' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-4 py-4 ${isDark ? 'bg-seka-dark/95 border-seka-border' : 'bg-white/95 border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}
            >
              <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-800'}`} />
            </button>
            <div className="flex items-center gap-2">
              <h1 className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-seka-green text-seka-darker text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className={`p-2 rounded-xl ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}
                title="Tout marquer comme lu"
              >
                <CheckCheck className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`} />
              </button>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl ${showSettings ? 'bg-seka-green text-seka-darker' : isDark ? 'bg-seka-card' : 'bg-gray-100'}`}
            >
              <Settings className={`w-5 h-5 ${showSettings ? '' : isDark ? 'text-seka-text-muted' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Push Notifications */}
        <PushNotificationToggle isDark={isDark} />

        {/* Panel Préférences */}
        {showSettings && (
          <div className={`p-4 rounded-2xl ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                Préférences
              </h3>
              <button onClick={() => setShowSettings(false)}>
                <X className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
              </button>
            </div>

            {!prefsLoading && preferences && (
              <div className="space-y-3">
                <PreferenceToggle
                  label="Alertes budget"
                  description="Quand tu dépenses trop vite"
                  checked={preferences.budget_alerts}
                  onChange={() => updatePreferences({ budget_alerts: !preferences.budget_alerts })}
                  isDark={isDark}
                />
                <PreferenceToggle
                  label="Transactions récurrentes"
                  description="Quand une transaction automatique est ajoutée"
                  checked={preferences.recurring_reminders}
                  onChange={() => updatePreferences({ recurring_reminders: !preferences.recurring_reminders })}
                  isDark={isDark}
                />
                <PreferenceToggle
                  label="Progression objectifs"
                  description="Quand tu approches d'un objectif"
                  checked={preferences.goal_progress}
                  onChange={() => updatePreferences({ goal_progress: !preferences.goal_progress })}
                  isDark={isDark}
                />
                <PreferenceToggle
                  label="Résumé hebdomadaire"
                  description="Bilan de ta semaine chaque dimanche"
                  checked={preferences.weekly_summary}
                  onChange={() => updatePreferences({ weekly_summary: !preferences.weekly_summary })}
                  isDark={isDark}
                />
                <PreferenceToggle
                  label="Rappel quotidien"
                  description="Rappel pour noter tes dépenses"
                  checked={preferences.daily_reminder}
                  onChange={() => updatePreferences({ daily_reminder: !preferences.daily_reminder })}
                  isDark={isDark}
                />
              </div>
            )}
          </div>
        )}

        {/* Liste des notifications */}
        {notifications.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
            <BellOff className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
            <p className={`font-medium mb-1 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
              Aucune notification
            </p>
            <p className={`text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
              Tu recevras tes notifications ici
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl transition-all ${
                  !notif.is_read
                    ? isDark
                      ? 'bg-seka-card border-l-4 border-l-seka-green border border-seka-border'
                      : 'bg-white border-l-4 border-l-seka-green shadow-sm'
                    : isDark
                      ? 'bg-seka-card/50 border border-seka-border'
                      : 'bg-gray-50 border border-gray-100'
                }`}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl ${isDark ? 'bg-seka-darker' : 'bg-gray-100'}`}>
                    {getIcon(notif.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                        {notif.title}
                      </p>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-seka-green flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className={`text-sm mt-0.5 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
                      {notif.body}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`}>
                        {formatRelativeDate(notif.sent_at)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notif.id)
                        }}
                        className={`p-1 rounded-lg ${isDark ? 'hover:bg-seka-darker' : 'hover:bg-gray-200'}`}
                      >
                        <Trash2 className={`w-4 h-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bouton refresh */}
        <button
          onClick={refresh}
          className={`fixed bottom-24 right-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center ${isDark ? 'bg-seka-card' : 'bg-white'}`}
        >
          <RefreshCw className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-700'}`} />
        </button>
      </div>
    </div>
  )
}

// Composant Toggle pour les préférences
function PreferenceToggle({ label, description, checked, onChange, isDark }) {
  return (
    <button
      onClick={onChange}
      className="w-full flex items-center justify-between py-2"
    >
      <div className="text-left">
        <p className={`text-sm font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
          {label}
        </p>
        <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>
      <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${checked ? 'bg-seka-green' : isDark ? 'bg-seka-darker' : 'bg-gray-300'}`}>
        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </button>
  )
}
