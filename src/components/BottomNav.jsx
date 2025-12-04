import { NavLink } from 'react-router-dom'
import { Home, ListOrdered, Target, User } from 'lucide-react'

const navItems = [
  { path: '/', icon: Home, label: 'Accueil' },
  { path: '/transactions', icon: ListOrdered, label: 'Historique' },
  { path: '/objectives', icon: Target, label: 'Objectifs' },
  { path: '/profile', icon: User, label: 'Profil' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-seka-card/95 backdrop-blur-xl border-t border-seka-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-seka-green'
                  : 'text-seka-text-muted hover:text-seka-text-secondary'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
