import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import api, { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/api'

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Espèces', emoji: '💵' },
  { key: 'mobile_money', label: 'Mobile Money', emoji: '📱' },
  { key: 'card', label: 'Carte', emoji: '💳' },
  { key: 'bank', label: 'Banque', emoji: '🏦' },
]

export default function AddTransaction() {
  const navigate = useNavigate()
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
      await api.post('/api/transactions', {
        type,
        amount: parseInt(amount),
        category,
        description,
        payment_method: paymentMethod,
        date
      })
      navigate(-1)
    } catch (err) {
      // Mode démo : on redirige quand même
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-seka-dark">
      <header className="sticky top-0 z-10 bg-seka-dark/95 backdrop-blur-xl border-b border-seka-border px-4 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-seka-card flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-seka-text"/>
          </button>
          <h1 className="text-xl font-bold text-seka-text">
            {type === 'expense' ? 'Nouvelle dépense' : 'Nouveau revenu'}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-5">
        {/* Type */}
        <div className="flex gap-2 p-1 bg-seka-card rounded-xl">
          <button
            type="button"
            onClick={() => { setType('expense'); setCategory('') }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${type === 'expense' ? 'bg-seka-red text-white' : 'text-seka-text-secondary'}`}
          >
            Dépense
          </button>
          <button
            type="button"
            onClick={() => { setType('income'); setCategory('') }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${type === 'income' ? 'bg-seka-green text-seka-darker' : 'text-seka-text-secondary'}`}
          >
            Revenu
          </button>
        </div>

        {/* Montant */}
        <div>
          <label className="block text-sm font-medium text-seka-text-secondary mb-2">Montant (FCFA)</label>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            className="input-seka text-3xl font-mono font-bold text-center py-6"
          />
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium text-seka-text-secondary mb-2">Catégorie</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(categories).map(([key, cat]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  category === key
                    ? type === 'expense' 
                      ? 'bg-seka-red/15 border-seka-red' 
                      : 'bg-seka-green/15 border-seka-green'
                    : 'bg-seka-card border-seka-border'
                }`}
              >
                <span className="text-xl block mb-1">{cat.emoji}</span>
                <span className="text-[10px] text-seka-text truncate block">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-seka-text-secondary mb-2">Description (optionnel)</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Courses au marché..."
            className="input-seka"
          />
        </div>

        {/* Moyen de paiement */}
        <div>
          <label className="block text-sm font-medium text-seka-text-secondary mb-2">Moyen de paiement</label>
          <div className="grid grid-cols-4 gap-2">
            {PAYMENT_METHODS.map(pm => (
              <button
                key={pm.key}
                type="button"
                onClick={() => setPaymentMethod(pm.key)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  paymentMethod === pm.key
                    ? 'bg-seka-gold/15 border-seka-gold'
                    : 'bg-seka-card border-seka-border'
                }`}
              >
                <span className="text-lg block mb-0.5">{pm.emoji}</span>
                <span className="text-[9px] text-seka-text truncate block">{pm.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-seka-text-secondary mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="input-seka"
          />
        </div>

        {error && <div className="text-seka-red text-sm text-center bg-seka-red/10 py-3 rounded-xl">{error}</div>}

        <button
          type="submit"
          disabled={loading || !amount || !category}
          className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 ${
            type === 'expense' ? 'bg-seka-red text-white' : 'bg-seka-gradient text-seka-darker'
          }`}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Check className="w-5 h-5"/> Enregistrer</>}
        </button>
      </form>
    </div>
  )
}
