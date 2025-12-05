import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Filter, X, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useTheme } from '../App'
import { transactionsApi, formatMoney, formatDate, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/api'

const PERIODS = [
  { key: 'all', label: 'Tout' },
  { key: 'today', label: "Aujourd'hui" },
  { key: 'week', label: 'Cette semaine' },
  { key: 'month', label: 'Ce mois' },
  { key: '3months', label: '3 mois' },
]

const PAYMENT_METHODS = [
  { key: 'all', label: 'Tous', emoji: '💳' },
  { key: 'cash', label: 'Espèces', emoji: '💵' },
  { key: 'mobile_money', label: 'Mobile Money', emoji: '📱' },
  { key: 'card', label: 'Carte', emoji: '💳' },
  { key: 'bank', label: 'Banque', emoji: '🏦' },
]

export default function Transactions() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await transactionsApi.getAll()
      setTransactions(data || [])
    } catch (e) {
      console.error('Erreur chargement transactions:', e)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const allCategories = useMemo(() => {
    const cats = {}
    transactions.forEach(t => {
      const source = t.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
      const cat = source[t.category]
      if (cat && !cats[t.category]) {
        cats[t.category] = { key: t.category, ...cat, type: t.type }
      }
    })
    return Object.values(cats).sort((a, b) => a.label.localeCompare(b.label))
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    let result = [...transactions]

    const now = new Date()
    if (period === 'today') {
      const today = now.toISOString().split('T')[0]
      result = result.filter(t => t.date === today)
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      result = result.filter(t => new Date(t.date) >= weekAgo)
    } else if (period === 'month') {
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      result = result.filter(t => t.date?.startsWith(monthKey))
    } else if (period === '3months') {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      result = result.filter(t => new Date(t.date) >= threeMonthsAgo)
    }

    if (typeFilter !== 'all') result = result.filter(t => t.type === typeFilter)
    if (categoryFilter !== 'all') result = result.filter(t => t.category === categoryFilter)
    if (paymentFilter !== 'all') result = result.filter(t => t.payment_method === paymentFilter)

    if (search.trim()) {
      const s = search.toLowerCase()
      result = result.filter(t =>
        t.description?.toLowerCase().includes(s) ||
        t.category?.toLowerCase().includes(s)
      )
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [transactions, period, typeFilter, categoryFilter, paymentFilter, search])

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const activeFiltersCount = [period !== 'all', typeFilter !== 'all', categoryFilter !== 'all', paymentFilter !== 'all'].filter(Boolean).length

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette transaction ?')) return
    try {
      await transactionsApi.delete(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
      setSelectedTransaction(null)
    } catch (e) {
      console.error('Erreur suppression:', e)
    }
  }

  const handleEdit = (transaction) => {
    navigate(`/edit/${transaction.id}`)
  }

  return (
    <div className={`min-h-screen pb-24 ${isDark ? 'bg-seka-dark' : 'bg-gray-50'}`}>
      <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-4 py-4 ${isDark ? 'bg-seka-dark/95 border-seka-border' : 'bg-white/95 border-gray-200'}`}>
        <div className="flex items-center gap-4 mb-3">
          <button onClick={() => navigate('/')} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}>
            <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-800'}`} />
          </button>
          <h1 className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>Historique</h1>
          <button onClick={() => setShowFilters(!showFilters)} className={`ml-auto w-10 h-10 rounded-xl flex items-center justify-center relative ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}>
            <Filter className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-800'}`} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-seka-green text-seka-darker text-[10px] font-bold flex items-center justify-center">{activeFiltersCount}</span>
            )}
          </button>
        </div>

        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className={`w-full pl-10 py-2.5 text-sm rounded-xl border ${isDark ? 'bg-seka-darker border-seka-border text-seka-text placeholder:text-seka-text-muted' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className={`w-4 h-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
            </button>
          )}
        </div>
      </header>

      {/* Filtres */}
      {showFilters && (
        <div className={`px-4 py-4 border-b space-y-4 ${isDark ? 'bg-seka-card border-seka-border' : 'bg-white border-gray-200'}`}>
          <div>
            <p className={`text-xs mb-2 font-medium ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Période</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {PERIODS.map(p => (
                <button key={p.key} onClick={() => setPeriod(p.key)} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${period === p.key ? 'bg-seka-green text-seka-darker font-medium' : isDark ? 'bg-seka-darker text-seka-text-secondary' : 'bg-gray-100 text-gray-600'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className={`text-xs mb-2 font-medium ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Type</p>
            <div className="flex gap-2">
              {[{ key: 'all', label: 'Tous' }, { key: 'income', label: '↓ Revenus' }, { key: 'expense', label: '↑ Dépenses' }].map(t => (
                <button key={t.key} onClick={() => { setTypeFilter(t.key); if (t.key !== 'all') setCategoryFilter('all') }} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${typeFilter === t.key ? t.key === 'income' ? 'bg-seka-green/20 text-seka-green border border-seka-green' : t.key === 'expense' ? 'bg-purple-500/20 text-purple-500 border border-purple-500' : 'bg-seka-green text-seka-darker' : isDark ? 'bg-seka-darker text-seka-text-secondary' : 'bg-gray-100 text-gray-600'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <button onClick={() => { setPeriod('all'); setTypeFilter('all'); setCategoryFilter('all'); setPaymentFilter('all') }} className="w-full py-2 rounded-lg border border-seka-red/30 text-seka-red text-xs">
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-3 grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
          <p className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Revenus ({filteredTransactions.filter(t => t.type === 'income').length})</p>
          <p className="text-sm font-bold text-seka-green">+{formatMoney(totalIncome)}</p>
        </div>
        <div className={`p-3 rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
          <p className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Dépenses ({filteredTransactions.filter(t => t.type === 'expense').length})</p>
          <p className="text-sm font-bold text-seka-red">-{formatMoney(totalExpense)}</p>
        </div>
      </div>

      {/* Liste */}
      <div className="px-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-seka-green animate-spin" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className={`p-8 text-center rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
            <p className={isDark ? 'text-seka-text-muted' : 'text-gray-500'}>Aucune transaction trouvée</p>
          </div>
        ) : (
          filteredTransactions.map(t => {
            const isExp = t.type === 'expense'
            const cats = isExp ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
            const cat = cats[t.category] || { emoji: '📦', label: t.category }
            const isSelected = selectedTransaction?.id === t.id

            return (
              <div key={t.id}>
                <div
                  onClick={() => setSelectedTransaction(isSelected ? null : t)}
                  className={`p-3 flex items-center gap-3 rounded-xl cursor-pointer transition-all ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'} ${isSelected ? 'ring-2 ring-seka-green' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isDark ? 'bg-seka-darker' : 'bg-gray-100'}`}>{cat.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>{cat.label}</p>
                    <p className={`text-[10px] truncate ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                      {t.description || formatDate(t.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${isExp ? 'text-seka-red' : 'text-seka-green'}`}>{isExp ? '-' : '+'}{formatMoney(t.amount)}</p>
                    {t.description && <p className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>{formatDate(t.date)}</p>}
                  </div>
                </div>

                {/* Actions (modifier/supprimer) */}
                {isSelected && (
                  <div className="flex gap-2 mt-2 mb-2">
                    <button onClick={() => handleEdit(t)} className="flex-1 py-2 rounded-lg bg-seka-green/20 text-seka-green text-sm font-medium flex items-center justify-center gap-2">
                      <Pencil className="w-4 h-4" /> Modifier
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="flex-1 py-2 rounded-lg bg-seka-red/20 text-seka-red text-sm font-medium flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" /> Supprimer
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
