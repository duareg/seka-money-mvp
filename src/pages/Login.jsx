import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        navigate('/')
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        })
        if (error) throw error

        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: email,
            created_at: new Date().toISOString()
          })
        }

        setSuccess('Compte créé ! Vous pouvez vous connecter.')
        setIsLogin(true)
      }
    } catch (err) {
      console.error(err)
      if (err.message.includes('Invalid login')) {
        setError('Email ou mot de passe incorrect')
      } else if (err.message.includes('already registered')) {
        setError('Cet email est déjà utilisé')
      } else if (err.message.includes('Password should be')) {
        setError('Le mot de passe doit faire au moins 6 caractères')
      } else {
        setError(err.message || 'Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-seka-dark flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="relative mb-8">
          <div className="absolute -inset-4 rounded-full bg-seka-green/20 blur-xl" />
          <div className="relative w-20 h-20 rounded-2xl bg-seka-gradient flex items-center justify-center">
            <span className="text-3xl font-bold text-seka-darker">S</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-seka-text mb-2">SEKA Money</h1>
        <p className="text-seka-text-muted text-sm mb-8">Gérez votre argent simplement</p>

        {/* Toggle Login/Signup */}
        <div className="flex gap-2 p-1 bg-seka-card rounded-xl mb-6 w-full max-w-sm">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); setSuccess('') }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${isLogin ? 'bg-seka-gradient text-seka-darker' : 'text-seka-text-secondary'}`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); setSuccess('') }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'bg-seka-gradient text-seka-darker' : 'text-seka-text-secondary'}`}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-seka-text-secondary mb-2">Email</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Mail className="w-5 h-5 text-seka-text-muted" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-seka-darker border border-seka-border text-seka-text placeholder:text-seka-text-muted focus:outline-none focus:border-seka-green transition-colors"
                required
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-seka-text-secondary mb-2">Mot de passe</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Lock className="w-5 h-5 text-seka-text-muted" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-seka-darker border border-seka-border text-seka-text placeholder:text-seka-text-muted focus:outline-none focus:border-seka-green transition-colors"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-seka-text-muted hover:text-seka-text transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && <p className="text-seka-red text-sm text-center bg-seka-red/10 py-3 rounded-xl">{error}</p>}
          {success && <p className="text-seka-green text-sm text-center bg-seka-green/10 py-3 rounded-xl">{success}</p>}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-4 rounded-xl bg-seka-gradient text-seka-darker font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:brightness-110"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{isLogin ? 'Se connecter' : 'Créer un compte'} <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>
      </div>

      <p className="text-center text-seka-text-muted text-xs pb-8">
        En continuant, vous acceptez nos conditions d'utilisation
      </p>
    </div>
  )
}
