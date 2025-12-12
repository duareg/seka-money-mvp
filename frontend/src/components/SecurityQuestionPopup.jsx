import { useState } from 'react'
import { KeyRound, HelpCircle, Shield, Loader2, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'

const SECURITY_QUESTIONS = [
  { id: 'school', label: 'Quel est le nom de votre première école ?' },
  { id: 'pet', label: 'Quel est le nom de votre premier animal de compagnie ?' },
  { id: 'city', label: 'Dans quelle ville êtes-vous né(e) ?' },
  { id: 'mother', label: 'Quel est le prénom de votre mère ?' },
  { id: 'food', label: 'Quel est votre plat préféré ?' },
]

export default function SecurityQuestionPopup({ user, onComplete }) {
  const [securityQuestion, setSecurityQuestion] = useState('')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [showQuestions, setShowQuestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!securityQuestion || !securityAnswer.trim()) {
      setError('Veuillez choisir une question et entrer votre réponse')
      return
    }

    if (securityAnswer.trim().length < 2) {
      setError('Votre réponse doit contenir au moins 2 caractères')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          securityQuestion: securityQuestion,
          securityAnswer: securityAnswer.toLowerCase().trim()
        }
      })

      if (updateError) throw updateError

      setSuccess(true)
      
      // Attendre un peu puis fermer
      setTimeout(() => {
        onComplete()
      }, 1500)

    } catch (err) {
      console.error('Erreur:', err)
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm bg-seka-card rounded-2xl p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-seka-green/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-seka-green" />
          </div>
          <h3 className="text-xl font-bold text-seka-text mb-2">Parfait !</h3>
          <p className="text-seka-text-muted text-sm">
            Votre question de sécurité a été enregistrée
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-seka-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-seka-green/20 to-seka-gold/20 px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-seka-green/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-seka-green" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-seka-text">Sécurisez votre compte</h3>
              <p className="text-xs text-seka-text-muted">Une étape importante</p>
            </div>
          </div>
          <p className="text-sm text-seka-text-secondary">
            Pour pouvoir récupérer votre compte en cas d'oubli de mot de passe, veuillez définir une question de sécurité.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Question selector */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-seka-text-secondary mb-2">
              <KeyRound className="w-4 h-4" />
              <span>Question de sécurité</span>
            </label>
            
            <button
              type="button"
              onClick={() => setShowQuestions(!showQuestions)}
              className="w-full px-4 py-3 rounded-xl bg-seka-darker border border-seka-border text-left flex items-center justify-between"
            >
              <span className={securityQuestion ? 'text-seka-text' : 'text-seka-text-muted'}>
                {securityQuestion 
                  ? SECURITY_QUESTIONS.find(q => q.id === securityQuestion)?.label 
                  : 'Choisir une question...'}
              </span>
              <HelpCircle className="w-4 h-4 text-seka-text-muted" />
            </button>

            {showQuestions && (
              <div className="mt-2 bg-seka-darker border border-seka-border rounded-xl overflow-hidden">
                {SECURITY_QUESTIONS.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => { 
                      setSecurityQuestion(q.id)
                      setShowQuestions(false)
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                      securityQuestion === q.id 
                        ? 'bg-seka-green/20 text-seka-green' 
                        : 'text-seka-text hover:bg-seka-card'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Answer input */}
          {securityQuestion && (
            <div>
              <label className="block text-sm font-medium text-seka-text-secondary mb-2">
                Votre réponse
              </label>
              <input
                type="text"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Entrez votre réponse..."
                className="w-full px-4 py-3 rounded-xl bg-seka-darker border border-seka-border text-seka-text placeholder:text-seka-text-muted focus:outline-none focus:border-seka-green transition-colors"
                autoComplete="off"
              />
              <p className="text-xs text-seka-text-muted mt-1">
                💡 Choisissez une réponse dont vous vous souviendrez facilement
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-seka-red text-sm text-center bg-seka-red/10 py-3 rounded-xl">
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !securityQuestion || !securityAnswer.trim()}
            className="w-full py-4 rounded-xl bg-seka-gradient text-seka-darker font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Enregistrer</span>
              </>
            )}
          </button>

          {/* Info */}
          <p className="text-xs text-center text-seka-text-muted">
            Cette question vous sera posée si vous oubliez votre mot de passe
          </p>
        </form>
      </div>
    </div>
  )
}
