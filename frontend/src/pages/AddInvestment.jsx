import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Loader2, Bell, FileText, Palette } from 'lucide-react'
import { useTheme } from '../App'
import { useCurrency } from '../currency'
import { investmentsApi } from '../utils/api'

const CATEGORIES = [
  { key: 'actions', label: 'Actions', emoji: '📈' },
  { key: 'crypto', label: 'Crypto', emoji: '₿' },
  { key: 'immobilier', label: 'Immobilier', emoji: '🏠' },
  { key: 'epargne', label: 'Épargne', emoji: '💰' },
  { key: 'obligation', label: 'Obligations', emoji: '📄' },
  { key: 'tontine', label: 'Tontine', emoji: '🤝' },
  { key: 'autre', label: 'Autre', emoji: '📦' },
]

const COLORS = ['#00D9A5', '#F7B928', '#FF6B6B', '#8B5CF6', '#3B82F6', '#EC4899', '#10B981']

const RECURRENCE = [
  { key: 'none', label: 'Aucun' }, 
  { key: 'weekly', label: 'Hebdo' }, 
  { key: 'monthly', label: 'Mensuel' }, 
  { key: 'yearly', label: 'Annuel' }
]

// Formater le montant avec des points comme séparateurs
const formatDisplayAmount = (value) => {
  if (!value) return ''
  const num = parseInt(value.toString().replace(/\D/g, '')) || 0
  if (num === 0) return ''
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const parseDisplayAmount = (displayValue) => {
  return parseInt(displayValue.replace(/\./g, '')) || 0
}

export default function AddInvestment() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { symbol, formatMoney } = useCurrency()
  
  const [name, setName] = useState('')
  const [displayAmount, setDisplayAmount] = useState('')
  const [category, setCategory] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [recurrence, setRecurrence] = useState('none')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '')
    setDisplayAmount(formatDisplayAmount(rawValue))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!name.trim()) { 
      setError('Nom requis')
      return 
    }
    
    const amount = parseDisplayAmount(displayAmount)
    if (!amount || amount <= 0) { 
      setError('Montant invalide')
      return 
    }
    
    if (!category) { 
      setError('Catégorie requise')
      return 
    }
    
    setLoading(true)
    
    try {
      await investmentsApi.create({
        name: name.trim(),
        amount,
        type: category,
        color,
        recurrence,
        note: notes.trim() || null,
        date
      })
      navigate(-1)
    } catch (err) {
      console.error('Erreur création investissement:', err)
      setError('Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-seka-dark' : 'bg-gray-50'}`}>
      <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-4 py-4 ${isDark ? 'bg-seka-dark/95 border-seka-border' : 'bg-white/95 border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}
          >
            <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-800'}`} />
          </button>
          <h1 className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
            Nouvel investissement
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-5">
        {/* Nom */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
            Nom
          </label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Ex: ETF World, Bitcoin..." 
            className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-seka-darker border-seka-border text-seka-text placeholder:text-seka-text-muted' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
          />
        </div>

        {/* Montant */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
            Montant ({symbol})
          </label>
          <input 
            type="text" 
            inputMode="numeric" 
            value={displayAmount} 
            onChange={handleAmountChange} 
            placeholder="0" 
            className={`w-full px-4 py-5 rounded-xl border text-2xl font-bold text-center ${isDark ? 'bg-seka-darker border-seka-border text-seka-text' : 'bg-white border-gray-200 text-gray-900'}`}
          />
          {displayAmount && (
            <p className={`text-center mt-1 text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
              {formatMoney(parseDisplayAmount(displayAmount))}
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
            Date
          </label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-seka-darker border-seka-border text-seka-text' : 'bg-white border-gray-200 text-gray-900'}`}
          />
        </div>

        {/* Catégorie */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
            Catégorie
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(c => (
              <button 
                key={c.key} 
                type="button" 
                onClick={() => setCategory(c.key)} 
                className={`p-3 rounded-xl border text-center transition-all ${
                  category === c.key 
                    ? 'bg-purple-500/15 border-purple-500' 
                    : isDark 
                      ? 'bg-seka-card border-seka-border' 
                      : 'bg-gray-50 border-gray-200'
                }`}
              >
                <span className="text-2xl block mb-1">{c.emoji}</span>
                <span className={`text-xs ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Couleur */}
        <div>
          <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
            <Palette className="w-4 h-4" />Couleur
          </label>
          <div className="flex gap-3">
            {COLORS.map(c => (
              <button 
                key={c} 
                type="button" 
                onClick={() => setColor(c)} 
                className={`w-10 h-10 rounded-full transition-all ${
                  color === c 
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-seka-dark scale-110' 
                    : ''
                }`} 
                style={{ backgroundColor: c }} 
              />
            ))}
          </div>
        </div>

        {/* Rappel */}
        <div>
          <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
            <Bell className="w-4 h-4" />Rappel
          </label>
          <div className="flex gap-2 flex-wrap">
            {RECURRENCE.map(r => (
              <button 
                key={r.key} 
                type="button" 
                onClick={() => setRecurrence(r.key)} 
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  recurrence === r.key 
                    ? 'bg-purple-500/15 border border-purple-500 text-purple-500' 
                    : isDark 
                      ? 'bg-seka-card border border-seka-border text-seka-text-secondary' 
                      : 'bg-gray-100 border border-gray-200 text-gray-600'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
            <FileText className="w-4 h-4" />Notes
          </label>
          <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            placeholder="Notes optionnelles..." 
            className={`w-full px-4 py-3 rounded-xl border min-h-[80px] resize-none ${isDark ? 'bg-seka-darker border-seka-border text-seka-text placeholder:text-seka-text-muted' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
          />
        </div>

        {/* Erreur */}
        {error && (
          <div className="text-seka-red text-sm text-center bg-seka-red/10 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Bouton submit */}
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-purple-500 text-white disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Check className="w-5 h-5" />
              Enregistrer
            </>
          )}
        </button>
      </form>
    </div>
  )
}
