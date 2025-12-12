import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { 
  Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, User, 
  ArrowLeft, CheckCircle, Phone, HelpCircle, KeyRound
} from 'lucide-react'

const SECURITY_QUESTIONS = [
  { id: 'school', label: 'Quel est le nom de votre première école ?' },
  { id: 'pet', label: 'Quel est le nom de votre premier animal de compagnie ?' },
  { id: 'city', label: 'Dans quelle ville êtes-vous né(e) ?' },
  { id: 'mother', label: 'Quel est le prénom de votre mère ?' },
  { id: 'food', label: 'Quel est votre plat préféré ?' },
]

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [step, setStep] = useState(1)
  const [forgotStep, setForgotStep] = useState(1)
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [contactMethod, setContactMethod] = useState('email')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [securityQuestion, setSecurityQuestion] = useState('')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [showSecurityQuestions, setShowSecurityQuestions] = useState(false)
  
  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotUserQuestion, setForgotUserQuestion] = useState(null)
  const [forgotAnswer, setForgotAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [forgotUserId, setForgotUserId] = useState(null)
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [showWelcome, setShowWelcome] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setPassword('')
    setConfirmPassword('')
    setSecurityQuestion('')
    setSecurityAnswer('')
    setForgotEmail('')
    setForgotUserQuestion(null)
    setForgotAnswer('')
    setNewPassword('')
    setConfirmNewPassword('')
    setForgotUserId(null)
    setForgotStep(1)
    setError('')
    setSuccess('')
    setStep(1)
    setShowWelcome(false)
    setAnimationStep(0)
  }

  const switchMode = (newMode) => {
    resetForm()
    setMode(newMode)
  }

  useEffect(() => {
    if (showWelcome) {
      const timers = [
        setTimeout(() => setAnimationStep(1), 300),   // Logo apparaît
        setTimeout(() => setAnimationStep(2), 900),   // Checkmark se dessine
        setTimeout(() => setAnimationStep(3), 1400),  // Titre apparaît
        setTimeout(() => setAnimationStep(4), 1700),  // Sous-titre apparaît
        setTimeout(() => {
          window.location.href = '/'
        }, 3500),
      ]
      return () => timers.forEach(t => clearTimeout(t))
    }
  }, [showWelcome])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      window.location.href = '/'
    } catch (err) {
      console.error(err)
      if (err.message.includes('Invalid login')) {
        setError('Email ou mot de passe incorrect')
      } else {
        setError(err.message || 'Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignupStep1 = (e) => {
    e.preventDefault()
    setError('')

    if (!firstName.trim() || !lastName.trim()) {
      setError('Le nom et le prénom sont obligatoires')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (!securityQuestion || !securityAnswer.trim()) {
      setError('Veuillez choisir une question de sécurité et y répondre')
      return
    }

    setStep(2)
  }

  const handleSignupStep2 = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const contactValue = contactMethod === 'email' ? email : phone
      
      if (!contactValue) {
        setError(contactMethod === 'email' ? 'Veuillez entrer votre email' : 'Veuillez entrer votre téléphone')
        setLoading(false)
        return
      }

      const userEmail = contactMethod === 'email' ? email : `${phone.replace(/\D/g, '')}@phone.seka.app`

      const { data, error } = await supabase.auth.signUp({
        email: userEmail,
        password,
        options: {
          data: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            name: `${firstName.trim()} ${lastName.trim()}`,
            phone: contactMethod === 'phone' ? phone : null,
            securityQuestion: securityQuestion,
            securityAnswer: securityAnswer.toLowerCase().trim()
          }
        }
      })

      if (error) throw error

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: contactMethod === 'email' ? email : null,
          created_at: new Date().toISOString()
        })

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password
        })

        if (signInError) {
          console.error('Auto sign-in error:', signInError)
        }
      }

      // Forcer l'affichage de l'onboarding pour les nouveaux utilisateurs
      localStorage.removeItem('seka_onboarding_done')
      
      setShowWelcome(true)
      
    } catch (err) {
      console.error(err)
      if (err.message.includes('already registered')) {
        setError('Cet email/téléphone est déjà utilisé')
      } else {
        setError(err.message || 'Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotStep1Simple = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!forgotEmail || !forgotEmail.includes('@')) {
        setError('Veuillez entrer un email valide')
        setLoading(false)
        return
      }

      setForgotStep(2)
      
    } catch (err) {
      console.error(err)
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotStep2 = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!forgotUserQuestion || !forgotAnswer.trim()) {
        setError('Veuillez sélectionner votre question et entrer votre réponse')
        setLoading(false)
        return
      }

      setForgotStep(3)
      
    } catch (err) {
      console.error(err)
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotStep3 = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (newPassword.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères')
        setLoading(false)
        return
      }

      if (newPassword !== confirmNewPassword) {
        setError('Les mots de passe ne correspondent pas')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.functions.invoke('reset-password-with-security', {
        body: {
          email: forgotEmail,
          securityQuestion: forgotUserQuestion,
          securityAnswer: forgotAnswer.toLowerCase().trim(),
          newPassword: newPassword
        }
      })

      if (error) throw error

      if (data.success) {
        setSuccess('Mot de passe modifié avec succès ! Vous pouvez maintenant vous connecter.')
        setForgotStep(4)
      } else {
        setError(data.message || 'Réponse incorrecte à la question de sécurité')
        setForgotStep(2)
      }
      
    } catch (err) {
      console.error(err)
      if (err.message?.includes('Function not found') || err.message?.includes('404')) {
        setError('La réinitialisation par question de sécurité n\'est pas encore disponible. Contactez le support.')
      } else {
        setError(err.message || 'Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  // ==================== WELCOME SCREEN B - RIPPLE + CHECKMARK ====================
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-seka-dark flex flex-col items-center justify-center px-6 overflow-hidden relative">
        
        {/* Ripples animés */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute w-32 h-32 rounded-full border-2 border-seka-green/30"
              style={{
                animation: 'ripple 2s ease-out infinite',
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Logo avec checkmark */}
        <div 
          className="relative z-10"
          style={{
            opacity: animationStep >= 1 ? 1 : 0,
            transform: animationStep >= 1 ? 'scale(1)' : 'scale(0.5)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
          }}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-seka-green to-emerald-600 flex items-center justify-center shadow-lg shadow-seka-green/40">
            {/* Checkmark SVG qui se dessine */}
            <svg className="w-12 h-12 text-seka-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="3" 
                d="M5 13l4 4L19 7"
                style={{
                  strokeDasharray: 50,
                  strokeDashoffset: animationStep >= 2 ? 0 : 50,
                  transition: 'stroke-dashoffset 0.5s ease-out',
                }}
              />
            </svg>
          </div>
        </div>

        {/* Texte */}
        <div className="relative z-10 text-center mt-8">
          <h1 
            className="text-2xl font-bold text-white"
            style={{
              opacity: animationStep >= 3 ? 1 : 0,
              transform: animationStep >= 3 ? 'translateY(0)' : 'translateY(15px)',
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
            }}
          >
            Compte créé !
          </h1>
          <p 
            className="text-gray-400 mt-3"
            style={{
              opacity: animationStep >= 4 ? 1 : 0,
              transform: animationStep >= 4 ? 'translateY(0)' : 'translateY(15px)',
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
            }}
          >
            Bienvenue <span className="text-seka-green font-semibold">{firstName}</span>
          </p>
        </div>

        {/* CSS pour les ripples */}
        <style>{`
          @keyframes ripple {
            0% { transform: scale(0); opacity: 0.5; }
            100% { transform: scale(4); opacity: 0; }
          }
        `}</style>
      </div>
    )
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

        {mode === 'login' && (
          <>
            <div className="flex gap-2 p-1 bg-seka-card rounded-xl mb-6 w-full max-w-sm">
              <button type="button" className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-seka-gradient text-seka-darker">
                Connexion
              </button>
              <button type="button" onClick={() => switchMode('signup')} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-seka-text-secondary">
                Inscription
              </button>
            </div>

            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-seka-text-secondary mb-2">Email</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className="w-5 h-5 text-seka-text-muted" />
                  </div>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-seka-darker border border-seka-border text-seka-text placeholder:text-seka-text-muted focus:outline-none focus:border-seka-green transition-colors" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-seka-text-secondary mb-2">Mot de passe</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className="w-5 h-5 text-seka-text-muted" />
                  </div>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Votre mot de passe" className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-seka-darker border border-seka-border text-seka-text placeholder:text-seka-text-muted focus:outline-none focus:border-seka-green transition-colors" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-seka-text-muted hover:text-seka-text">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="button" onClick={() => switchMode('forgot')} className="text-sm text-seka-green hover:underline">
                Mot de passe oublié ?
              </button>

              {error && <p className="text-seka-red text-sm text-center bg-seka-red/10 py-3 rounded-xl">{error}</p>}

              <button type="submit" disabled={loading || !email || !password} className="w-full py-4 rounded-xl bg-seka-gradient text-seka-darker font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:brightness-110">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Se connecter</span> <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          </>
        )}

        {mode === 'signup' && step === 1 && (
          <>
            <div className="flex gap-2 p-1 bg-seka-card rounded-xl mb-6 w-full max-w-sm">
              <button type="button" onClick={() => switchMode('login')} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-seka-text-secondary">
                Connexion
              </button>
              <button type="button" className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-seka-gradient text-seka-darker">
                Inscription
              </button>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-seka-green flex items-center justify-center text-seka-darker font-bold text-sm">1</div>
              <div className="w-12 h-1 bg-seka-border rounded" />
              <div className="w-8 h-8 rounded-full bg-seka-border flex items-center justify-center text-seka-text-muted font-bold text-sm">2</div>
            </div>

            <p className="text-seka-text-muted text-sm mb-4">Étape 1/2 : Vos informations</p>

            <form onSubmit={handleSignupStep1} className="w-full max-w-sm space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-seka-text-secondary mb-2">Prénom <span className="text-seka-red">*</span></label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <User className="w-4 h-4 text-seka-text-muted" />
                    </div>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" className="w-full pl-10 pr-3 py-3 rounded-xl bg-seka-darker border border-seka-border text-seka-text placeholder:text-seka-text-muted focus:outline-none focus:border-seka-green transition-colors text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-seka-text-secondary mb-2">Nom <span className="text-seka-red">*</span></label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <User className="w-4 h-4 text-seka-text-muted" />
                    </div>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" className="w-full pl-10 pr-3 py-3 rounded-xl bg-seka-darker border border-seka-border text-seka-text placeholder:text-seka-text-muted focus:outline-none focus:border-seka-green transition-colors text-sm" required />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-seka-text-secondary mb-2">Mot de passe <span className="text-seka-red">*</span></label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className="w-5 h-5 text-seka-text-muted" />
                  </div>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 caractères" className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-seka-darker border border-seka-border text-seka-text placeholder:text-seka-text-muted focus:outline-none focus:border-seka-green transition-colors" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-seka-text-muted hover:text-seka-text">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-seka-text-secondary mb-2">Confirmer <span className="text-seka-red">*</span></label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className="w-5 h-5 text-seka-text-muted" />
                  </div>
                  <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmez le mot de passe" className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-seka-darker border border-seka-border text-seka-text placeholder:text-seka-text-muted focus:outline-none focus:border-seka-green transition-colors" required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-seka-text-muted hover:text-seka-text">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-seka-border">
                <label className="flex items-center gap-2 text-sm font-medium text-seka-text-secondary mb-2">
                  <KeyRound className="w-4 h-4" />
                  <span>Question de sécurité</span> <span className="text-seka-red">*</span>
                </label>
                <p className="text-xs text-seka-text-muted mb-3">Pour récupérer votre compte si vous oubliez votre mot de passe</p>
                
                <button
                  type="button"
                  onClick={() => setShowSecurityQuestions(!showSecurityQuestions)}
                  className="w-full px-4 py-3 rounded-xl bg-seka-darker border border-seka-border text-left flex items-center justify-between"
                >
                  <span className={securityQuestion ? 'text-seka-text' : 'text-seka-text-muted'}>
                    {securityQuestion ? SECURITY_QUESTIONS.find(q => q.id === securityQuestion)?.label : 'Choisir une question...'}
                  </span>
                  <HelpCircle className="w-4 h-4 text-seka-text-muted" />
                </button>

                {showSecurityQuestions && (
                  <div className="mt-2 bg-seka-card border border-seka-border rounded-xl overflow-hidden">
                    {SECURITY_QUESTIONS.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => { setSecurityQuestion(q.id); setShowSecurityQuestions(false); }}
                        className={`w-full px-4 py-3 text-left text-sm transition-colors ${securityQuestion === q.id ? 'bg-seka-green/20 text-seka-green' : 'text-seka-text hover:bg-seka-darker'}`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}

                {securityQuestion && (
                  <input
                    type="text"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="Votre réponse..."
                    className="w-full mt-3 px-4 py-3 rounded-xl bg-seka-darker border border-seka-border text-seka-text placeholder:text-seka-text-muted focus:outline-none focus:border-seka-green transition-colors"
                    required
                  />
                )}
              </div>

              {error && <p className="text-seka-red text-sm text-center bg-seka-red/10 py-3 rounded-xl">{error}</p>}

              <button type="submit" disabled={!firstName || !lastName || !password || !confirmPassword || !securityQuestion || !securityAnswer} className="w-full py-4 rounded-xl bg-seka-gradient text-seka-darker font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:brightness-110">
                <span>Continuer</span> <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </>
        )}

        {mode === 'signup' && step === 2 && (
          <>
            <button type="button" onClick={() => setStep(1)} className="self-start mb-4 flex items-center gap-2 text-seka-text-muted hover:text-seka-text">
              <ArrowLeft className="w-4 h-4" /> <span>Retour</span>
            </button>

            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-seka-green flex items-center justify-center"><CheckCircle className="w-5 h-5 text-seka-darker" /></div>
              <div className="w-12 h-1 bg-seka-green rounded" />
              <div className="w-8 h-8 rounded-full bg-seka-green flex items-center justify-center text-seka-darker font-bold text-sm">2</div>
            </div>

            <p className="text-seka-text-muted text-sm mb-4">Étape 2/2 : Contact</p>

            <form onSubmit={handleSignupStep2} className="w-full max-w-sm space-y-4">
              <div className="flex gap-2 p-1 bg-seka-darker rounded-xl">
                <button 
                  type="button" 
                  onClick={() => setContactMethod('email')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${contactMethod === 'email' ? 'bg-seka-green text-seka-darker' : 'text-seka-text-secondary'}`}
                >
                  <Mail className="w-4 h-4" /> <span>Email</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setContactMethod('phone')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${contactMethod === 'phone' ? 'bg-seka-green text-seka-darker' : 'text-seka-text-secondary'}`}
                >
                  <Phone className="w-4 h-4" /> <span>Téléphone</span>
                </button>
              </div>

              {contactMethod === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-seka-text-secondary mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Mail className="w-5 h-5 text-seka-text-muted" />
                    </div>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-seka-darker border border-seka-border text-seka-text placeholder:text-seka-text-muted focus:outline-none focus:border-seka-green transition-colors" required />
                  </div>
                </div>
              )}

              {contactMethod === 'phone' && (
                <div>
                  <label className="block text-sm font-medium text-seka-text-secondary mb-2">Téléphone</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Phone className="w-5 h-5 text-seka-text-muted" />
                    </div>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+229 XX XX XX XX" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-seka-darker border border-seka-border text-seka-text placeholder:text-seka-text-muted focus:outline-none focus:border-seka-green transition-colors" required />
                  </div>
                </div>
              )}

              {error && <p className="text-seka-red text-sm text-center bg-seka-red/10 py-3 rounded-xl">{error}</p>}

              <button type="submit" disabled={loading || (contactMethod === 'email' ? !email : !phone)} className="w-full py-4 rounded-xl bg-seka-gradient text-seka-darker font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:brightness-110">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Créer mon compte</span> <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          </>
        )}

        {/* MOT DE PASSE OUBLIÉ - ÉTAPE 1: Email */}
        {mode === 'forgot' && forgotStep === 1 && (
          <>
            <button type="button" onClick={() => switchMode('login')} className="self-start mb-4 flex items-center gap-2 text-seka-text-muted hover:text-seka-text">
              <ArrowLeft className="w-4 h-4" /> <span>Retour</span>
            </button>

            <div className="w-12 h-12 rounded-full bg-seka-gold/20 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 text-seka-gold" />
            </div>

            <h2 className="text-xl font-bold text-seka-text mb-2">Mot de passe oublié</h2>
            <p className="text-seka-text-muted text-sm mb-6 text-center">Entrez votre email pour récupérer votre compte</p>

            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-seka-green flex items-center justify-center text-seka-darker font-bold text-sm">1</div>
              <div className="w-8 h-1 bg-seka-border rounded" />
              <div className="w-8 h-8 rounded-full bg-seka-border flex items-center justify-center text-seka-text-muted font-bold text-sm">2</div>
              <div className="w-8 h-1 bg-seka-border rounded" />
              <div className="w-8 h-8 rounded-full bg-seka-border flex items-center justify-center text-seka-text-muted font-bold text-sm">3</div>
            </div>

            <form onSubmit={handleForgotStep1Simple} className="w-full max-w-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-seka-text-secondary mb-2">Email de votre compte</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className="w-5 h-5 text-seka-text-muted" />
                  </div>
                  <input 
                    type="email" 
                    value={forgotEmail} 
                    onChange={(e) => setForgotEmail(e.target.value)} 
                    placeholder="votre@email.com" 
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-seka-darker border border-seka-border text-seka-text placeholder:text-seka-text-muted focus:outline-none focus:border-seka-green transition-colors" 
                    required 
                  />
                </div>
              </div>

              {error && <p className="text-seka-red text-sm text-center bg-seka-red/10 py-3 rounded-xl">{error}</p>}

              <button type="submit" disabled={loading || !forgotEmail} className="w-full py-4 rounded-xl bg-seka-gradient text-seka-darker font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:brightness-110">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Continuer</span> <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          </>
        )}

        {/* MOT DE PASSE OUBLIÉ - ÉTAPE 2: Question de sécurité */}
        {mode === 'forgot' && forgotStep === 2 && (
          <>
            <button type="button" onClick={() => setForgotStep(1)} className="self-start mb-4 flex items-center gap-2 text-seka-text-muted hover:text-seka-text">
              <ArrowLeft className="w-4 h-4" /> <span>Retour</span>
            </button>

            <div className="w-12 h-12 rounded-full bg-seka-gold/20 flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6 text-seka-gold" />
            </div>

            <h2 className="text-xl font-bold text-seka-text mb-2">Question de sécurité</h2>
            <p className="text-seka-text-muted text-sm mb-6 text-center">Sélectionnez votre question et entrez votre réponse</p>

            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-seka-green flex items-center justify-center"><CheckCircle className="w-5 h-5 text-seka-darker" /></div>
              <div className="w-8 h-1 bg-seka-green rounded" />
              <div className="w-8 h-8 rounded-full bg-seka-green flex items-center justify-center text-seka-darker font-bold text-sm">2</div>
              <div className="w-8 h-1 bg-seka-border rounded" />
              <div className="w-8 h-8 rounded-full bg-seka-border flex items-center justify-center text-seka-text-muted font-bold text-sm">3</div>
            </div>

            <form onSubmit={handleForgotStep2} className="w-full max-w-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-seka-text-secondary mb-2">Votre question de sécurité</label>
                <button
                  type="button"
                  onClick={() => setShowSecurityQuestions(!showSecurityQuestions)}
                  className="w-full px-4 py-3.5 rounded-xl bg-seka-darker border border-seka-border text-left flex items-center justify-between"
                >
                  <span className={forgotUserQuestion ? 'text-seka-text' : 'text-seka-text-muted'}>
                    {forgotUserQuestion ? SECURITY_QUESTIONS.find(q => q.id === forgotUserQuestion)?.label : 'Sélectionnez votre question...'}
                  </span>
                  <HelpCircle className="w-4 h-4 text-seka-text-muted" />
                </button>

                {showSecurityQuestions && (
                  <div className="mt-2 bg-seka-card border border-seka-border rounded-xl overflow-hidden">
                    {SECURITY_QUESTIONS.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => { setForgotUserQuestion(q.id); setShowSecurityQuestions(false); }}
                        className={`w-full px-4 py-3 text-left text-sm transition-colors ${forgotUserQuestion === q.id ? 'bg-seka-green/20 text-seka-green' : 'text-seka-text hover:bg-seka-darker'}`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {forgotUserQuestion && (
                <div>
                  <label className="block text-sm font-medium text-seka-text-secondary mb-2">Votre réponse</label>
                  <input
                    type="text"
                    value={forgotAnswer}
                    onChange={(e) => setForgotAnswer(e.target.value)}
                    placeholder="Entrez votre réponse..."
                    className="w-full px-4 py-3.5 rounded-xl bg-seka-darker border border-seka-border text-seka-text placeholder:text-seka-text-muted focus:outline-none focus:border-seka-green transition-colors"
                    required
                  />
                </div>
              )}

              {error && <p className="text-seka-red text-sm text-center bg-seka-red/10 py-3 rounded-xl">{error}</p>}

              <button type="submit" disabled={loading || !forgotUserQuestion || !forgotAnswer} className="w-full py-4 rounded-xl bg-seka-gradient text-seka-darker font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:brightness-110">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Vérifier</span> <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          </>
        )}

        {/* MOT DE PASSE OUBLIÉ - ÉTAPE 3: Nouveau mot de passe */}
        {mode === 'forgot' && forgotStep === 3 && (
          <>
            <button type="button" onClick={() => setForgotStep(2)} className="self-start mb-4 flex items-center gap-2 text-seka-text-muted hover:text-seka-text">
              <ArrowLeft className="w-4 h-4" /> <span>Retour</span>
            </button>

            <div className="w-12 h-12 rounded-full bg-seka-green/20 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-seka-green" />
            </div>

            <h2 className="text-xl font-bold text-seka-text mb-2">Nouveau mot de passe</h2>
            <p className="text-seka-text-muted text-sm mb-6 text-center">Créez votre nouveau mot de passe</p>

            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-seka-green flex items-center justify-center"><CheckCircle className="w-5 h-5 text-seka-darker" /></div>
              <div className="w-8 h-1 bg-seka-green rounded" />
              <div className="w-8 h-8 rounded-full bg-seka-green flex items-center justify-center"><CheckCircle className="w-5 h-5 text-seka-darker" /></div>
              <div className="w-8 h-1 bg-seka-green rounded" />
              <div className="w-8 h-8 rounded-full bg-seka-green flex items-center justify-center text-seka-darker font-bold text-sm">3</div>
            </div>

            <form onSubmit={handleForgotStep3} className="w-full max-w-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-seka-text-secondary mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className="w-5 h-5 text-seka-text-muted" />
                  </div>
                  <input 
                    type={showNewPassword ? 'text' : 'password'} 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Minimum 6 caractères" 
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-seka-darker border border-seka-border text-seka-text placeholder:text-seka-text-muted focus:outline-none focus:border-seka-green transition-colors" 
                    required 
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-seka-text-muted hover:text-seka-text">
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-seka-text-secondary mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className="w-5 h-5 text-seka-text-muted" />
                  </div>
                  <input 
                    type={showConfirmNewPassword ? 'text' : 'password'} 
                    value={confirmNewPassword} 
                    onChange={(e) => setConfirmNewPassword(e.target.value)} 
                    placeholder="Confirmez le mot de passe" 
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-seka-darker border border-seka-border text-seka-text placeholder:text-seka-text-muted focus:outline-none focus:border-seka-green transition-colors" 
                    required 
                  />
                  <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-seka-text-muted hover:text-seka-text">
                    {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-seka-red text-sm text-center bg-seka-red/10 py-3 rounded-xl">{error}</p>}

              <button type="submit" disabled={loading || !newPassword || !confirmNewPassword} className="w-full py-4 rounded-xl bg-seka-gradient text-seka-darker font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:brightness-110">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Réinitialiser</span> <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          </>
        )}

        {/* MOT DE PASSE OUBLIÉ - ÉTAPE 4: Succès */}
        {mode === 'forgot' && forgotStep === 4 && (
          <>
            <div className="w-16 h-16 rounded-full bg-seka-green/20 flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-seka-green" />
            </div>

            <h2 className="text-xl font-bold text-seka-text mb-2">Mot de passe modifié !</h2>
            <p className="text-seka-text-muted text-sm mb-6 text-center">Votre mot de passe a été réinitialisé avec succès</p>

            {success && <p className="text-seka-green text-sm text-center bg-seka-green/10 py-3 rounded-xl mb-4 w-full max-w-sm">{success}</p>}

            <button 
              onClick={() => switchMode('login')} 
              className="w-full max-w-sm py-4 rounded-xl bg-seka-gradient text-seka-darker font-semibold flex items-center justify-center gap-2 transition-all hover:brightness-110"
            >
              <span>Se connecter</span> <ArrowRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      <p className="text-center text-seka-text-muted text-xs pb-8">
        En continuant, vous acceptez nos conditions d'utilisation
      </p>
    </div>
  )
}
