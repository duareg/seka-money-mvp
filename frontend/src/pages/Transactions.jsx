import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Filter, X, Pencil, Trash2, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { useTheme } from '../App'
import { useCurrency } from '../currency'
import { useTransactions, useDeleteTransaction } from '../utils/hooks'
import { formatDate, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/api'

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
  const { formatMoney } = useCurrency()
  
  // React Query - données en cache, navigation instantanée
  const { data: transactions = [], isLoading } = useTransactions()
  const deleteTransaction = useDeleteTransaction()
  
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  // Catégories utilisées par l'utilisateur
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

  // Catégories les plus fréquentes (top 6)
  const frequentCategories = useMemo(() => {
    const catCount = {}
    transactions.forEach(t => {
      catCount[t.category] = (catCount[t.category] || 0) + 1
    })
    
    return Object.entries(catCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([key, count]) => {
        const isExpense = transactions.find(t => t.category === key)?.type === 'expense'
        const source = isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
        const cat = source[key] || { emoji: '📦', label: key }
        return { key, ...cat, count, type: isExpense ? 'expense' : 'income' }
      })
  }, [transactions])

  // Dernières catégories utilisées (5 dernières uniques)
  const recentCategories = useMemo(() => {
    const seen = new Set()
    const recent = []
    
    const sortedByDate = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))
    
    for (const t of sortedByDate) {
      if (!seen.has(t.category) && recent.length < 5) {
        seen.add(t.category)
        const isExpense = t.type === 'expense'
        const source = isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
        const cat = source[t.category] || { emoji: '📦', label: t.category }
        recent.push({ key: t.category, ...cat, type: t.type })
      }
    }
    
    return recent
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
      await deleteTransaction.mutateAsync(id)
      setSelectedTransaction(null)
    } catch (e) {
      console.error('Erreur suppression:', e)
    }
  }

  const handleEdit = (transaction) => {
    navigate(`/edit/${transaction.id}`)
  }

  const handleCategoryFilter = (key) => {
    if (categoryFilter === key) {
      setCategoryFilter('all')
    } else {
      setCategoryFilter(key)
    }
  }

  // Skeleton loader pour le premier chargement uniquement
  const showSkeleton = isLoading && transactions.length === 0

  return (
    <div className={`min-h-screen pb-24 ${isDark ? 'bg-seka-dark' : 'bg-gray-50'}`}>
      <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-4 py-4 ${isDark ? 'bg-seka-dark/95 border-seka-border' : 'bg-white/95 border-gray-200'}`}>
        <div className="flex items-center gap-4 mb-3">
          <button onClick={() => navigate('/')} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}>
            <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-800'}`} />
          </button>
          <h1 className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>Historique</h1>
          <button onClick={() => setShowFilters(!showFilters)} className={`ml-auto w-10 h-10 rounded-xl flex items-center justify-center relative ${showFilters ? 'bg-seka-green' : isDark ? 'bg-seka-card' : 'bg-gray-100'}`}>
            <Filter className={`w-5 h-5 ${showFilters ? 'text-seka-darker' : isDark ? 'text-seka-text' : 'text-gray-800'}`} />
            {activeFiltersCount > 0 && !showFilters && (
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
            placeholder="Rechercher une transaction..."
            className={`w-full pl-10 py-2.5 text-sm rounded-xl border ${isDark ? 'bg-seka-darker border-seka-border text-seka-text placeholder:text-seka-text-muted' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className={`w-4 h-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
            </button>
          )}
        </div>
      </header>

      {/* Filtres rapides par catégories (toujours visible) */}
      {!showSkeleton && transactions.length > 0 && (
        <div className={`px-4 py-3 border-b ${isDark ? 'border-seka-border' : 'border-gray-200'}`}>
          {/* Catégories récentes */}
          {recentCategories.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`w-3 h-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                <p className={`text-[10px] font-medium ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Récents</p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {recentCategories.map(cat => (
                  <button
                    key={`recent-${cat.key}`}
                    onClick={() => handleCategoryFilter(cat.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                      categoryFilter === cat.key
                        ? 'bg-seka-green text-seka-darker font-medium'
                        : isDark
                          ? 'bg-seka-card border border-seka-border text-seka-text hover:bg-seka-darker'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Catégories les plus utilisées */}
          {frequentCategories.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className={`w-3 h-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                <p className={`text-[10px] font-medium ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Les plus utilisées</p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {frequentCategories.map(cat => (
                  <button
                    key={`freq-${cat.key}`}
                    onClick={() => handleCategoryFilter(cat.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                      categoryFilter === cat.key
                        ? 'bg-seka-green text-seka-darker font-medium'
                        : isDark
                          ? 'bg-seka-card border border-seka-border text-seka-text hover:bg-seka-darker'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                      categoryFilter === cat.key
                        ? 'bg-seka-darker/20 text-seka-darker'
                        : isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Indicateur de filtre actif */}
          {categoryFilter !== 'all' && (
            <button
              onClick={() => setCategoryFilter('all')}
              className="mt-2 flex items-center gap-1 text-xs text-seka-green"
            >
              <X className="w-3 h-3" />
              <span>Effacer le filtre catégorie</span>
            </button>
          )}
        </div>
      )}

      {/* Filtres avancés */}
      {showFilters && (
        <div className={`px-4 py-4 border-b space-y-4 ${isDark ? 'bg-seka-card border-seka-border' : 'bg-white border-gray-200'}`}>
          {/* Période */}
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

          {/* Type */}
          <div>
            <p className={`text-xs mb-2 font-medium ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Type</p>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'Tous', icon: null },
                { key: 'income', label: 'Revenus', icon: <TrendingDown className="w-3 h-3" /> },
                { key: 'expense', label: 'Dépenses', icon: <TrendingUp className="w-3 h-3" /> }
              ].map(t => (
                <button 
                  key={t.key} 
                  onClick={() => { setTypeFilter(t.key); if (t.key !== 'all') setCategoryFilter('all') }} 
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    typeFilter === t.key 
                      ? t.key === 'income' 
                        ? 'bg-seka-green/20 text-seka-green border border-seka-green' 
                        : t.key === 'expense' 
                          ? 'bg-seka-red/20 text-seka-red border border-seka-red' 
                          : 'bg-seka-green text-seka-darker' 
                      : isDark 
                        ? 'bg-seka-darker text-seka-text-secondary' 
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Moyen de paiement */}
          <div>
            <p className={`text-xs mb-2 font-medium ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Moyen de paiement</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {PAYMENT_METHODS.map(p => (
                <button 
                  key={p.key} 
                  onClick={() => setPaymentFilter(p.key)} 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                    paymentFilter === p.key 
                      ? 'bg-seka-green text-seka-darker font-medium' 
                      : isDark 
                        ? 'bg-seka-darker text-seka-text-secondary' 
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <span>{p.emoji}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Catégories (toutes) */}
          {allCategories.length > 0 && (
            <div>
              <p className={`text-xs mb-2 font-medium ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Catégorie</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    categoryFilter === 'all'
                      ? 'bg-seka-green text-seka-darker font-medium'
                      : isDark ? 'bg-seka-darker text-seka-text-secondary' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Toutes
                </button>
                {allCategories.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setCategoryFilter(cat.key)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all ${
                      categoryFilter === cat.key
                        ? 'bg-seka-green text-seka-darker font-medium'
                        : isDark ? 'bg-seka-darker text-seka-text-secondary' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bouton reset */}
          {activeFiltersCount > 0 && (
            <button 
              onClick={() => { setPeriod('all'); setTypeFilter('all'); setCategoryFilter('all'); setPaymentFilter('all') }} 
              className="w-full py-2.5 rounded-xl border border-seka-red/30 text-seka-red text-xs font-medium flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Réinitialiser tous les filtres
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-3 grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-3 h-3 text-seka-green" />
            <p className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
              Revenus ({filteredTransactions.filter(t => t.type === 'income').length})
            </p>
          </div>
          <p className="text-sm font-bold text-seka-green mt-1">+{formatMoney(totalIncome)}</p>
        </div>
        <div className={`p-3 rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-seka-red" />
            <p className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
              Dépenses ({filteredTransactions.filter(t => t.type === 'expense').length})
            </p>
          </div>
          <p className="text-sm font-bold text-seka-red mt-1">-{formatMoney(totalExpense)}</p>
        </div>
      </div>

      {/* Résumé des filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="px-4 pb-2">
          <div className={`px-3 py-2 rounded-lg flex items-center gap-2 text-xs ${isDark ? 'bg-seka-green/10 text-seka-green' : 'bg-green-50 text-green-700'}`}>
            <Filter className="w-3 h-3" />
            <span>
              {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''} 
              {period !== 'all' && ` • ${PERIODS.find(p => p.key === period)?.label}`}
              {typeFilter !== 'all' && ` • ${typeFilter === 'income' ? 'Revenus' : 'Dépenses'}`}
              {categoryFilter !== 'all' && ` • ${allCategories.find(c => c.key === categoryFilter)?.label || categoryFilter}`}
              {paymentFilter !== 'all' && ` • ${PAYMENT_METHODS.find(p => p.key === paymentFilter)?.label}`}
            </span>
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="px-4 space-y-2">
        {showSkeleton ? (
          // Skeleton loader - affiché seulement au premier chargement
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`p-3 flex items-center gap-3 rounded-xl ${isDark ? 'bg-seka-card/30' : 'bg-gray-200'}`}>
                <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-seka-darker' : 'bg-gray-300'}`}></div>
                <div className="flex-1 space-y-2">
                  <div className={`h-4 rounded ${isDark ? 'bg-seka-darker' : 'bg-gray-300'} w-24`}></div>
                  <div className={`h-3 rounded ${isDark ? 'bg-seka-darker' : 'bg-gray-300'} w-16`}></div>
                </div>
                <div className={`h-4 rounded ${isDark ? 'bg-seka-darker' : 'bg-gray-300'} w-20`}></div>
              </div>
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className={`p-8 text-center rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-seka-darker' : 'bg-gray-100'}`}>
              <Search className={`w-8 h-8 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
            </div>
            <p className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>Aucune transaction trouvée</p>
            <p className={`text-sm mt-1 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
              {activeFiltersCount > 0 ? 'Essayez de modifier vos filtres' : 'Commencez par ajouter une transaction'}
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={() => { setPeriod('all'); setTypeFilter('all'); setCategoryFilter('all'); setPaymentFilter('all'); setSearch('') }}
                className="mt-4 px-4 py-2 rounded-lg bg-seka-green text-seka-darker text-sm font-medium"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          filteredTransactions.map(t => {
            const isExp = t.type === 'expense'
            const cats = isExp ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
            const cat = cats[t.category] || { emoji: '📦', label: t.category }
            const isSelected = selectedTransaction?.id === t.id
            const paymentMethod = PAYMENT_METHODS.find(p => p.key === t.payment_method)

            return (
              <div key={t.id}>
                <div
                  onClick={() => setSelectedTransaction(isSelected ? null : t)}
                  className={`p-3 flex items-center gap-3 rounded-xl cursor-pointer transition-all ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'} ${isSelected ? 'ring-2 ring-seka-green' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isDark ? 'bg-seka-darker' : 'bg-gray-100'}`}>{cat.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>{cat.label}</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-[10px] truncate ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                        {t.description || formatDate(t.date)}
                      </p>
                      {paymentMethod && paymentMethod.key !== 'all' && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-100 text-gray-500'}`}>
                          {paymentMethod.emoji}
                        </span>
                      )}
                    </div>
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

      {/* Style pour cacher la scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
