import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useNotifications } from '../utils/useNotifications'
import { useAuth } from '../App'

// ============================================
// COMPOSANT: NotificationBell
// Badge de notification pour le header/dashboard
// ============================================

export default function NotificationBell({ isDark }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { unreadCount } = useNotifications(user?.id)

  return (
    <button
      onClick={() => navigate('/notifications')}
      className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}
    >
      <Bell className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-700'}`} />
      
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-seka-red text-white text-xs font-bold flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
