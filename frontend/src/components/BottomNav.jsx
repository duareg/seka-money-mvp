import { NavLink } from 'react-router-dom'
import { Home, Clock, Plus, Target, User } from 'lucide-react'
import { useTheme } from '../App'
import { useLanguage } from '../i18n'

export default function BottomNav() {
  const { isDark } = useTheme()
  const { t } = useLanguage()

  const navItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/transactions', icon: Clock, label: t('nav.history') },
    { path: '/add', icon: Plus, label: t('nav.add'), isCenter: true },
    { path: '/objectives', icon: Target, label: t('nav.objectives') },
    { path: '/profile', icon: User, label: t('nav.profile') },
  ]

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 ${isDark ? 'bg-seka-darker/95' : 'bg-white/95'} backdrop-blur-xl border-t ${isDark ? 'border-seka-border' : 'border-gray-200'} pb-safe`}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${item.isCenter
                ? ''
                : isActive
                  ? 'text-seka-green'
                  : isDark
                    ? 'text-seka-text-muted hover:text-seka-text'
                    : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.isCenter ? (
                  <div className="w-14 h-14 -mt-6 bg-gradient-to-br from-seka-green to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-seka-green/30 hover:shadow-seka-green/50 hover:scale-105 transition-all">
                    <item.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                ) : (
                  <>
                    <item.icon
                      className={`w-6 h-6 ${isActive ? 'text-seka-green' : ''}`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-seka-green' : ''}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
