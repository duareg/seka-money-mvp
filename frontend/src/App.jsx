import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from './lib/supabase'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import AddTransaction from './pages/AddTransaction'
import Objectives from './pages/Objectives'
import Profile from './pages/Profile'
import Analyses from './pages/Analyses'
import AddInvestment from './pages/AddInvestment'
import NotificationsPage from './pages/NotificationsPage'
import RecurringTransactions from './pages/RecurringTransactions'
import HelpCenter from './pages/HelpCenter'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Onboarding from './pages/Onboarding'

import BottomNav from './components/BottomNav'
import Splash from './components/Splash'
import SecurityQuestionPopup from './components/SecurityQuestionPopup'

import { LanguageProvider } from './i18n'
import { CurrencyProvider } from './currency'

// ========== REACT QUERY CONFIG ==========
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// ========== AUTH CONTEXT ==========
export const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// ========== THEME CONTEXT ==========
export const ThemeContext = createContext(null)

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('seka_theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    localStorage.setItem('seka_theme', isDark ? 'dark' : 'light')
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme: isDark ? 'dark' : 'light' }}>
      {children}
    </ThemeContext.Provider>
  )
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    // Clear React Query cache on logout
    queryClient.clear()
  }

  const refreshUser = async () => {
    const { data: { user: freshUser } } = await supabase.auth.getUser()
    if (freshUser) {
      setUser(freshUser)
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, token: session?.access_token, logout, loading, isAuthenticated: !!session, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

function PrivateRoute({ children }) {
  const { isAuthenticated, loading, user, refreshUser } = useAuth()
  const [showSecurityPopup, setShowSecurityPopup] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [checkedSecurity, setCheckedSecurity] = useState(false)

  useEffect(() => {
    if (user && !loading && !checkedSecurity) {
      const metadata = user.user_metadata || {}
      const hasSecurityQuestion = metadata.securityQuestion && metadata.securityAnswer
      const hasSeenOnboarding = localStorage.getItem('seka_onboarding_done') === 'true'
      
      if (!hasSecurityQuestion) {
        setShowSecurityPopup(true)
      } else if (!hasSeenOnboarding) {
        setShowOnboarding(true)
      }
      setCheckedSecurity(true)
    }
  }, [user, loading, checkedSecurity])

  if (loading) return <Splash />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const handleSecurityComplete = async () => {
    await refreshUser()
    setShowSecurityPopup(false)
    const hasSeenOnboarding = localStorage.getItem('seka_onboarding_done') === 'true'
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }

  const handleOnboardingComplete = () => {
    localStorage.setItem('seka_onboarding_done', 'true')
    setShowOnboarding(false)
  }

  return (
    <>
      {showSecurityPopup && (
        <SecurityQuestionPopup 
          user={user} 
          onComplete={handleSecurityComplete} 
        />
      )}
      {showOnboarding && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
      {children}
    </>
  )
}

function AppLayout({ children }) {
  const { isDark } = useTheme()
  return (
    <div className={`min-h-screen pb-20 transition-colors duration-300 ${isDark ? 'bg-seka-dark bg-mesh' : 'bg-gray-50'}`}>
      {children}
      <BottomNav />
    </div>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 4000)
    return () => clearTimeout(t)
  }, [])

  if (showSplash) return <Splash />

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <CurrencyProvider>
            <ThemeProvider>
              <AuthProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
                  <Route path="/transactions" element={<PrivateRoute><AppLayout><Transactions /></AppLayout></PrivateRoute>} />
                  <Route path="/add" element={<PrivateRoute><AppLayout><AddTransaction /></AppLayout></PrivateRoute>} />
                  <Route path="/edit/:id" element={<PrivateRoute><AppLayout><AddTransaction /></AppLayout></PrivateRoute>} />
                  <Route path="/objectives" element={<PrivateRoute><AppLayout><Objectives /></AppLayout></PrivateRoute>} />
                  <Route path="/profile" element={<PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>} />
                  <Route path="/analyses" element={<PrivateRoute><AppLayout><Analyses /></AppLayout></PrivateRoute>} />
                  <Route path="/investment/add" element={<PrivateRoute><AppLayout><AddInvestment /></AppLayout></PrivateRoute>} />
                  <Route path="/recurring" element={<PrivateRoute><AppLayout><RecurringTransactions /></AppLayout></PrivateRoute>} />
                  <Route path="/notifications" element={<PrivateRoute><AppLayout><NotificationsPage /></AppLayout></PrivateRoute>} />
                  <Route path="/help" element={<PrivateRoute><AppLayout><HelpCenter /></AppLayout></PrivateRoute>} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </AuthProvider>
            </ThemeProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
