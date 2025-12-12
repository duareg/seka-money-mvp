import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Plus, RefreshCw, Trash2, Edit2, Calendar,
  TrendingUp, TrendingDown, Check, X, ChevronRight
} from 'lucide-react'
import { useAuth, useTheme } from '../App'
import { useRecurringTransactions } from '../utils/useNotifications'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/api'

export default function RecurringTransactions() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const {
    recurring,
    loading,
    createRecurring,
    updateRecurring,
    toggleRecurring,
    deleteRecurring
  } = useRecurringTransactions(user?.id)

  // Form state
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    frequency: 'monthly',
    next_date: new Date().toISOString().split('T')[0],
    payment_method: 'mobile_money'
  })

  const frequencies = [
    { value: 'weekly', label: 'Hebdomadaire', desc: 'Chaque semaine' },
    { value: 'monthly', label: 'Mensuel', desc: 'Chaque mois' },
    { value: 'yearly', label: 'Annuel', desc: 'Chaque année' }
  ]

  const paymentMethods = [
    { value: 'cash', label: 'Espèces' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'bank', label: 'Banque' },
    { value: 'card', label: 'Carte' }
  ]

  const categoriesObj = form.type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
  const categories = Object.entries(categoriesObj).map(([id, cat]) => ({ id, ...cat }))

  const resetForm = () => {
    setForm({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      frequency: 'monthly',
      next_date: new Date().toISOString().split('T')[0],
      payment_method: 'mobile_money'
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async () => {
    if (!form.amount || !form.category) return

    const data = {
      ...form,
      amount: parseFloat(form.amount)
    }

    if (editingId) {
      await updateRecurring(editingId, data)
    } else {
      await createRecurring(data)
    }
    resetForm()
  }

  const handleEdit = (item) => {
    setForm({
      type: item.type,
      amount: item.amount.toString(),
      category: item.category,
      description: item.description || '',
      frequency: item.frequency,
      next_date: item.next_date,
      payment_method: item.payment_method || 'mobile_money'
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Supprimer cette transaction récurrente ?')) {
      await deleteRecurring(id)
    }
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F'
  }

  const formatNextDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return 'Demain'
    if (diffDays < 7) return `Dans ${diffDays} jours`
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const getFrequencyLabel = (freq) => {
    return frequencies.find(f => f.value === freq)?.label || freq
  }

  const getCategoryInfo = (category, type) => {
    const catsObj = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
    const cats = Object.entries(catsObj).map(([id, cat]) => ({ id, ...cat }))
    return cats.find(c => c.id === category) || { icon: '📦', label: category }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-seka-green/30 border-t-seka-green rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen pb-24 ${isDark ? 'bg-seka-dark' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-4 py-4 ${isDark ? 'bg-seka-dark/95 border-seka-border' : 'bg-white/95 border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}
            >
              <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-800'}`} />
            </button>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                Transactions récurrentes
              </h1>
              <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                {recurring.length} transaction{recurring.length > 1 ? 's' : ''} automatique{recurring.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="w-10 h-10 rounded-xl bg-seka-green flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-seka-darker" />
          </button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Liste des récurrences */}
        {recurring.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
            <RefreshCw className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
            <p className={`font-medium mb-1 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
              Aucune transaction récurrente
            </p>
            <p className={`text-sm mb-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
              Ajoute ton loyer, salaire ou abonnements
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-xl bg-seka-green text-seka-darker font-medium"
            >
              Ajouter une récurrence
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recurring.map((item) => {
              const catInfo = getCategoryInfo(item.category, item.type)
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl ${
                    item.is_active
                      ? isDark
                        ? 'bg-seka-card border border-seka-border'
                        : 'bg-white shadow-sm border border-gray-100'
                      : isDark
                        ? 'bg-seka-card/50 border border-seka-border opacity-60'
                        : 'bg-gray-100 border border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                      item.type === 'income' ? 'bg-seka-green/15' : 'bg-seka-red/15'
                    }`}>
                      {catInfo.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                            {item.description || catInfo.label}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                            {getFrequencyLabel(item.frequency)} • {formatNextDate(item.next_date)}
                          </p>
                        </div>
                        <p className={`font-bold ${item.type === 'income' ? 'text-seka-green' : 'text-seka-red'}`}>
                          {item.type === 'income' ? '+' : '-'}{formatAmount(item.amount)}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => toggleRecurring(item.id, !item.is_active)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            item.is_active
                              ? 'bg-seka-green/15 text-seka-green'
                              : isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {item.is_active ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          {item.is_active ? 'Actif' : 'Inactif'}
                        </button>
                        
                        <button
                          onClick={() => handleEdit(item)}
                          className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-seka-darker' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className={`w-4 h-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(item.id)}
                          className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-seka-darker' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className={`w-4 h-4 ${isDark ? 'text-seka-red/70' : 'text-red-400'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Explication */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-blue-50 border border-blue-100'}`}>
          <div className="flex gap-3">
            <RefreshCw className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-seka-green' : 'text-blue-500'}`} />
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-seka-text' : 'text-blue-900'}`}>
                Comment ça marche ?
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-seka-text-muted' : 'text-blue-700'}`}>
                Les transactions sont automatiquement ajoutées à la date prévue. Tu recevras une notification à chaque ajout.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Formulaire */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={resetForm}
        >
          <div
            className={`w-full max-w-lg rounded-t-3xl overflow-hidden max-h-[90vh] overflow-y-auto ${isDark ? 'bg-seka-card' : 'bg-white'}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className={`sticky top-0 px-5 py-4 border-b ${isDark ? 'border-seka-border bg-seka-card' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-bold text-lg ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                  {editingId ? 'Modifier' : 'Nouvelle récurrence'}
                </h3>
                <button onClick={resetForm}>
                  <X className={`w-6 h-6 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Type */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setForm({ ...form, type: 'expense', category: '' })}
                  className={`py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    form.type === 'expense'
                      ? 'bg-seka-red text-white'
                      : isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  Dépense
                </button>
                <button
                  onClick={() => setForm({ ...form, type: 'income', category: '' })}
                  className={`py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    form.type === 'income'
                      ? 'bg-seka-green text-seka-darker'
                      : isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Revenu
                </button>
              </div>

              {/* Montant */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>
                  Montant
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0"
                    className={`w-full px-4 py-3 rounded-xl text-lg font-bold ${
                      isDark
                        ? 'bg-seka-darker text-seka-text placeholder-seka-text-muted border border-seka-border'
                        : 'bg-gray-100 text-gray-900 placeholder-gray-400 border border-gray-200'
                    }`}
                  />
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 font-medium ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                    FCFA
                  </span>
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>
                  Catégorie
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.slice(0, 8).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setForm({ ...form, category: cat.id })}
                      className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                        form.category === cat.id
                          ? 'bg-seka-green text-seka-darker'
                          : isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-[10px] truncate w-full text-center">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>
                  Description (optionnel)
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex: Loyer appartement"
                  className={`w-full px-4 py-3 rounded-xl ${
                    isDark
                      ? 'bg-seka-darker text-seka-text placeholder-seka-text-muted border border-seka-border'
                      : 'bg-gray-100 text-gray-900 placeholder-gray-400 border border-gray-200'
                  }`}
                />
              </div>

              {/* Fréquence */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>
                  Fréquence
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {frequencies.map((freq) => (
                    <button
                      key={freq.value}
                      onClick={() => setForm({ ...form, frequency: freq.value })}
                      className={`p-3 rounded-xl text-center transition-all ${
                        form.frequency === freq.value
                          ? 'bg-seka-green text-seka-darker'
                          : isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <p className="font-medium text-sm">{freq.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date de début */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>
                  Prochaine date
                </label>
                <input
                  type="date"
                  value={form.next_date}
                  onChange={(e) => setForm({ ...form, next_date: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl ${
                    isDark
                      ? 'bg-seka-darker text-seka-text border border-seka-border'
                      : 'bg-gray-100 text-gray-900 border border-gray-200'
                  }`}
                />
              </div>

              {/* Méthode de paiement */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>
                  Méthode de paiement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setForm({ ...form, payment_method: method.value })}
                      className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                        form.payment_method === method.value
                          ? 'bg-seka-green text-seka-darker'
                          : isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bouton Submit */}
              <button
                onClick={handleSubmit}
                disabled={!form.amount || !form.category}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  form.amount && form.category
                    ? 'bg-seka-green text-seka-darker'
                    : isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {editingId ? 'Modifier' : 'Créer la récurrence'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
