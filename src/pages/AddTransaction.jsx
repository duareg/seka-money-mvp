import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { transactionsApi, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/api'
import { useTheme } from '../App'

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Espèces', emoji: '💵' },
  { key: 'mobile_money', label: 'Mobile Money', emoji: '📱' },
  { key: 'card', label: 'Carte', emoji: '💳' },
  { key: 'bank', label: 'Banque', emoji: '🏦' },
]

export default function AddTransaction() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [searchParams] = useSearchParams()
  const initialType = searchParams.get('type') || 'expense'

  const [type, setType] = useState(initialType)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!amount || parseInt(amount) <= 0) {
      setError('Entrez un montant valide')
      return
    }
    if (!category) {
      setError('Sélectionnez une catégorie')
      return
    }

    setLoading(true)
    try {
      await transactionsApi.create({
        type,
        amount: parseInt(amount),
        category,
        description,
        payment_method: paymentMethod,
        date
      })
      navigate(-1)
    } catch (err) {
      console.error('Erreur création transaction:', err)
      setError('Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-seka-dark' : 'bg-gray-50'}`}>
      <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-4 py-4 ${isDark ? 'bg-seka-dark/95 border-seka-border' : 'bg-white/95 border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}>
            <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-700'}`} />
          </button>
          <h1 className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
            {type === 'expense' ? 'Nouvelle dépense' : 'Nouveau revenu'}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-5">
        {/* Type */}
        <div className={`flex gap-2 p-1 rounded-xl ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}>
          <button
            type="button"
            onClick={() => { setType('expense'); setCategory('') }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${type === 'expense' ? 'bg-seka-red text-white' : isDark ? 'text-seka-text-secondary' : 'text-gray-500'}`}
          >
            Dépense
          </button>
          <button
            type="button"
            onClick={() => { setType('income'); setCategory('') }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${type === 'income' ? 'bg-seka-green text-seka-darker' : isDark ? 'text-seka-text-secondary' : 'text-gray-500'}`}
          >
            Revenu
          </button>
        </div>

        {/* Montant - SANS POINTS DANS LES ZÉROS */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Montant (FCFA)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={amount}
            onChange={e => {
              // Autoriser seulement les chiffres
              const val = e.target.value.replace(/[^0-9]/g, '')
              setAmount(val)
            }}
            placeholder="0"
            className={`w-full px-4 py-6 rounded-xl border text-3xl font-bold text-center ${isDark ? 'bg-seka-darker border-seka-border text-seka-text placeholder:text-seka-text-muted' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} focus:outline-none focus:border-seka-green`}
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.05em'
            }}
          />
        </div>

        {/* Catégorie */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Catégorie</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(categories).map(([key, cat]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={`p-3 rounded-xl border text-center transition-all ${category === key
                    ? type === 'expense'
                      ? 'bg-seka-red/15 border-seka-red'
                      : 'bg-seka-green/15 border-seka-green'
                    : isDark ? 'bg-seka-card border-seka-border' : 'bg-white border-gray-200'
                  }`}
              >
                <span className="text-xl block mb-1">{cat.emoji}</span>
                <span className={`text-[10px] truncate block ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Description (optionnel)</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Courses au marché..."
            className={`w-full px-4 py-3.5 rounded-xl border ${isDark ? 'bg-seka-darker border-seka-border text-seka-text placeholder:text-seka-text-muted' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} focus:outline-none focus:border-seka-green`}
          />
        </div>

        {/* Moyen de paiement */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Moyen de paiement</label>
          <div className="grid grid-cols-4 gap-2">
            {PAYMENT_METHODS.map(pm => (
              <button
                key={pm.key}
                type="button"
                onClick={() => setPaymentMethod(pm.key)}
                className={`p-2.5 rounded-xl border text-center transition-all ${paymentMethod === pm.key
                    ? 'bg-seka-gold/15 border-seka-gold'
                    : isDark ? 'bg-seka-card border-seka-border' : 'bg-white border-gray-200'
                  }`}
              >
                <span className="text-lg block mb-0.5">{pm.emoji}</span>
                <span className={`text-[9px] truncate block ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>{pm.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className={`w-full px-4 py-3.5 rounded-xl border ${isDark ? 'bg-seka-darker border-seka-border text-seka-text' : 'bg-white border-gray-200 text-gray-900'} focus:outline-none focus:border-seka-green`}
          />
        </div>

        {error && <div className="text-seka-red text-sm text-center bg-seka-red/10 py-3 rounded-xl">{error}</div>}

        <button
          type="submit"
          disabled={loading || !amount || !category}
          className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 ${type === 'expense' ? 'bg-seka-red text-white' : 'bg-seka-green text-seka-darker'
            }`}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Enregistrer</>}
        </button>
      </form>
    </div>
  )
}
