import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useTheme } from '../App'
import { ArrowLeft, User, Phone, Crown, LogOut, ChevronRight, Sparkles, Shield, Bell, HelpCircle, FileText, Copy, Check, Moon, Sun, Link2, CheckCircle, AlertCircle } from 'lucide-react'

// Comptes Mobile Money disponibles
const MOBILE_MONEY_ACCOUNTS = [
  { id: 'mtn', name: 'MTN MoMo', logo: '🟡', color: '#FFCC00', available: true, description: 'API officielle disponible' },
  { id: 'moov', name: 'Moov Money', logo: '🔵', color: '#0066CC', available: true, description: 'Via PayDunya / FeexPay' },
  { id: 'celtiis', name: 'Celtiis Cash', logo: '🟢', color: '#00AA00', available: false, description: 'API non disponible' },
]

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [showLogout, setShowLogout] = useState(false)
  const [copied, setCopied] = useState(false)
  const [connectedAccounts, setConnectedAccounts] = useState([])

  const handleLogout = () => { logout(); navigate('/login') }
  const copyCode = () => { 
    navigator.clipboard.writeText(user?.referral_code || 'SEKAMONEY')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000) 
  }

  const userName = user?.name || 'Utilisateur'
  const userPhone = user?.phone || '+229 XX XXX XXX'
  const isPremium = user?.is_premium || false
  const referralCode = user?.referral_code || 'SEKAMONEY'

  const toggleAccount = (accountId) => {
    if (connectedAccounts.includes(accountId)) {
      setConnectedAccounts(prev => prev.filter(id => id !== accountId))
    } else {
      setConnectedAccounts(prev => [...prev, accountId])
    }
  }

  return (
    <div className={`min-h-screen pb-24 ${isDark ? 'bg-seka-dark' : 'bg-gray-50'}`}>
      <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-4 py-4 ${isDark ? 'bg-seka-dark/95 border-seka-border' : 'bg-white/95 border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}>
            <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-800'}`}/>
          </button>
          <h1 className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>Mon profil</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-4">
        {/* Carte profil */}
        <div className={`p-5 rounded-2xl relative overflow-hidden ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-seka-green/10 rounded-full blur-3xl -mr-16 -mt-16"/>
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-seka-gradient flex items-center justify-center">
              <User className="w-7 h-7 text-seka-darker"/>
            </div>
            <div className="flex-1">
              <h2 className={`text-lg font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>{userName}</h2>
              <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-seka-text-secondary' : 'text-gray-500'}`}>
                <Phone className="w-3.5 h-3.5"/><span>{userPhone}</span>
              </div>
            </div>
          </div>
          <div className={`mt-4 pt-4 border-t flex items-center justify-between ${isDark ? 'border-seka-border' : 'border-gray-100'}`}>
            <div className="flex items-center gap-2">
              {isPremium ? (
                <><Crown className="w-5 h-5 text-seka-gold"/><span className="text-seka-gold font-medium">Premium</span></>
              ) : (
                <><User className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`}/><span className={isDark ? 'text-seka-text-secondary' : 'text-gray-500'}>Gratuit</span></>
              )}
            </div>
            {!isPremium && (
              <button className="bg-gradient-to-r from-seka-gold to-yellow-400 text-seka-darker text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3"/>Passer Premium
              </button>
            )}
          </div>
        </div>

        {/* Code parrainage */}
        <div className={`p-4 rounded-2xl ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-500'}`}>Code de parrainage</p>
              <p className="text-xl font-bold text-seka-green font-mono tracking-wider">{referralCode}</p>
            </div>
            <button onClick={copyCode} className={`text-sm px-4 py-2 rounded-xl flex items-center gap-1 ${isDark ? 'bg-seka-darker text-seka-text-secondary' : 'bg-gray-100 text-gray-600'}`}>
              {copied ? <><Check className="w-4 h-4 text-seka-green"/>Copié</> : <><Copy className="w-4 h-4"/>Copier</>}
            </button>
          </div>
          <p className={`text-[10px] mt-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`}>
            Parraine 3 amis et gagne 1 mois Premium gratuit !
          </p>
        </div>

        {/* Toggle Dark/Light Mode */}
        <div className={`p-4 rounded-2xl ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-darker' : 'bg-gray-100'}`}>
                {isDark ? <Moon className="w-5 h-5 text-indigo-400"/> : <Sun className="w-5 h-5 text-yellow-500"/>}
              </div>
              <div>
                <p className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>Apparence</p>
                <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                  {isDark ? 'Mode sombre' : 'Mode clair'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${isDark ? 'bg-seka-green' : 'bg-gray-300'}`}
            >
              <div 
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${isDark ? 'translate-x-7' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>

        {/* Section Comptes connectés */}
        <div className={`p-4 rounded-2xl ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-seka-green"/>
              <h3 className={`text-sm font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>Comptes connectés</h3>
            </div>
            <span className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>{connectedAccounts.length}/3</span>
          </div>

          <div className="space-y-2">
            {MOBILE_MONEY_ACCOUNTS.map(account => {
              const isConnected = connectedAccounts.includes(account.id)
              return (
                <div 
                  key={account.id} 
                  className={`p-3 rounded-xl border transition-all ${
                    isConnected 
                      ? 'bg-seka-green/10 border-seka-green/30' 
                      : isDark 
                        ? 'bg-seka-darker border-seka-border' 
                        : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{account.logo}</div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>{account.name}</p>
                      <p className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>{account.description}</p>
                    </div>
                    {account.available ? (
                      <button
                        onClick={() => toggleAccount(account.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isConnected 
                            ? 'bg-seka-green text-seka-darker' 
                            : isDark 
                              ? 'bg-seka-card border border-seka-border text-seka-text-secondary hover:border-seka-green hover:text-seka-green'
                              : 'bg-white border border-gray-200 text-gray-600 hover:border-seka-green hover:text-seka-green'
                        }`}
                      >
                        {isConnected ? (
                          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3"/>Connecté</span>
                        ) : 'Connecter'}
                      </button>
                    ) : (
                      <span className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${isDark ? 'text-seka-text-muted bg-seka-darker' : 'text-gray-400 bg-gray-100'}`}>
                        <AlertCircle className="w-3 h-3"/>Bientôt
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <p className={`text-[10px] mt-3 text-center ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`}>
            Synchronisez vos transactions automatiquement
          </p>
        </div>

        {/* Menu items */}
        <div className="space-y-2">
          {[
            { icon: Bell, label: 'Notifications', desc: 'Gérer les alertes', badge: 'Bientôt' },
            { icon: Shield, label: 'Sécurité', desc: 'Changer de numéro' },
            { icon: HelpCircle, label: 'Aide', desc: 'FAQ et support' },
            { icon: FileText, label: 'Conditions', desc: 'CGU et confidentialité' },
          ].map((item, i) => (
            <button key={i} className={`w-full p-4 rounded-xl flex items-center gap-4 ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-darker' : 'bg-gray-100'}`}>
                <item.icon className={`w-5 h-5 ${isDark ? 'text-seka-text-secondary' : 'text-gray-500'}`}/>
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>{item.label}</p>
                <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>{item.desc}</p>
              </div>
              {item.badge ? (
                <span className="text-[10px] text-seka-gold bg-seka-gold/10 px-2 py-1 rounded">{item.badge}</span>
              ) : (
                <ChevronRight className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`}/>
              )}
            </button>
          ))}
        </div>

        {/* Déconnexion */}
        <button 
          onClick={() => setShowLogout(true)} 
          className="w-full p-4 rounded-xl border border-seka-red/30 text-seka-red flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5"/>Se déconnecter
        </button>
        
        <p className={`text-center text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`}>
          SEKA Money v1.0.0 • Made with 💚 in Benin 🇧🇯
        </p>
      </div>

      {/* Modal déconnexion */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`rounded-2xl p-6 max-w-sm w-full ${isDark ? 'bg-seka-card' : 'bg-white'}`}>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>Se déconnecter ?</h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-seka-text-secondary' : 'text-gray-500'}`}>
              Vous devrez entrer votre numéro pour vous reconnecter.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogout(false)} 
                className={`flex-1 py-3 px-6 rounded-xl font-medium ${isDark ? 'bg-seka-darker text-seka-text-secondary' : 'bg-gray-100 text-gray-600'}`}
              >
                Annuler
              </button>
              <button 
                onClick={handleLogout} 
                className="flex-1 py-3 px-6 rounded-xl bg-seka-red text-white font-semibold"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
