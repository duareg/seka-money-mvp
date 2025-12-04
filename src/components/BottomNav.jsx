import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Receipt, Plus, Target, User } from 'lucide-react'
import { useTheme } from '../App'

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Accueil' },
  { path: '/transactions', icon: Receipt, label: 'Historique' },
  { path: '/add', icon: Plus, label: 'Ajouter', isCenter: true },
  { path: '/objectives', icon: Target, label: 'Objectifs' },
  { path: '/profile', icon: User, label: 'Profil' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark } = useTheme()

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 border-t ${isDark ? 'bg-seka-darker/95 border-seka-border backdrop-blur-xl' : 'bg-white/95 border-gray-200 backdrop-blur-xl'}`}>
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          // Bouton central +
          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative -mt-6"
              >
                <div className="w-14 h-14 rounded-full bg-seka-gradient flex items-center justify-center shadow-lg shadow-seka-green/30">
                  <Plus className="w-7 h-7 text-seka-darker" strokeWidth={2.5} />
                </div>
              </button>
            )
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all ${isActive
                  ? 'text-seka-green'
                  : isDark ? 'text-seka-text-muted hover:text-seka-text' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-medium' : ''}`}>{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Safe area pour iPhone */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  )
}
