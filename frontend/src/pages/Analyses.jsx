import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, ShoppingBag, Clock, CreditCard, AlertCircle } from 'lucide-react'
import { useTheme } from '../App'
import { useCurrency } from '../currency'
import { useTransactions } from '../utils/hooks'
import { formatDate, EXPENSE_CATEGORIES } from '../utils/api'

const PERIODS = [
  { key: 'month', label: 'Ce mois' },
  { key: '3months', label: '3 mois' },
  { key: '6months', label: '6 mois' },
  { key: 'year', label: '1 an' },
  { key: 'all', label: 'Tout' },
]

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const COLORS = ['#8B5CF6', '#00D9A5', '#F7B928', '#FF6B6B', '#3B82F6', '#EC4899', '#10B981', '#6366F1']

export default function Analyses() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { formatMoney } = useCurrency()
  const [period, setPeriod] = useState('month')

  // React Query - données cachées et instantanées
  const { data: allTransactions = [], isLoading } = useTransactions()

  const getStartDate = (p) => {
    const now = new Date()
    switch (p) {
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1)
      case '3months':
        return new Date(now.getFullYear(), now.getMonth() - 2, 1)
      case '6months':
        return new Date(now.getFullYear(), now.getMonth() - 5, 1)
      case 'year':
        return new Date(now.getFullYear() - 1, now.getMonth(), 1)
      default:
        return new Date(2020, 0, 1)
    }
  }

  const stats = useMemo(() => {
    const startDate = getStartDate(period)
    const transactions = allTransactions.filter(t => new Date(t.date) >= startDate)

    const expenses = transactions.filter(t => t.type === 'expense')
    const incomes = transactions.filter(t => t.type === 'income')
    const totalExp = expenses.reduce((s, t) => s + t.amount, 0)
    const totalInc = incomes.reduce((s, t) => s + t.amount, 0)
    const soldeNet = totalInc - totalExp

    // Par catégorie
    const byCat = {}
    expenses.forEach(t => {
      const cat = EXPENSE_CATEGORIES[t.category] || { label: t.category, emoji: '📦' }
      if (!byCat[t.category]) {
        byCat[t.category] = {
          ...cat,
          key: t.category,
          amount: 0,
          count: 0,
        }
      }
      byCat[t.category].amount += t.amount
      byCat[t.category].count++
    })
    const catArray = Object.values(byCat).sort((a, b) => b.amount - a.amount)
    const catTotal = catArray.reduce((s, c) => s + c.amount, 0)

    // Par jour de semaine
    const byDay = [0, 0, 0, 0, 0, 0, 0]
    expenses.forEach(t => {
      const d = new Date(t.date).getDay()
      byDay[d === 0 ? 6 : d - 1] += t.amount
    })
    const maxDay = Math.max(...byDay, 1)
    const topDayIdx = byDay.indexOf(Math.max(...byDay))

    // Top dépenses
    const top5 = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5)
    const topExpense = top5[0]

    // Moyenne et prévision
    const daysInPeriod = Math.max(1, Math.ceil((new Date() - startDate) / 86400000))
    const avgDaily = totalExp / daysInPeriod
    const now = new Date()
    const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()
    const projected = totalExp + avgDaily * daysLeft

    return {
      transactions,
      expenses,
      totalExp,
      totalInc,
      soldeNet,
      catArray,
      catTotal,
      byDay,
      maxDay,
      topDayIdx,
      top5,
      topExpense,
      avgDaily,
      projected,
      daysInPeriod,
    }
  }, [allTransactions, period])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-seka-green/30 border-t-seka-green rounded-full animate-spin" />
      </div>
    )
  }

  const hasData = stats.transactions.length > 0

  return (
    <div className={`min-h-screen pb-24 ${isDark ? 'bg-seka-dark' : 'bg-gray-50'}`}>
      <header
        className={`sticky top-0 z-10 backdrop-blur-xl border-b px-4 py-4 ${isDark ? 'bg-seka-dark/95 border-seka-border' : 'bg-white/95 border-gray-200'
          }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-card' : 'bg-gray-100'
              }`}
          >
            <ArrowLeft
              className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-800'}`}
            />
          </button>
          <h1
            className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'
              }`}
          >
            Analyses
          </h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${period === p.key
                ? 'bg-seka-green text-seka-darker'
                : isDark
                  ? 'bg-seka-card text-seka-text-secondary'
                  : 'bg-white text-gray-600 shadow-sm'
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {!hasData ? (
          <div
            className={`p-8 text-center rounded-xl ${isDark
              ? 'bg-seka-card/50 border border-seka-border'
              : 'bg-white shadow-sm border border-gray-100'
              }`}
          >
            <AlertCircle
              className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'
                }`}
            />
            <p
              className={`font-medium mb-1 ${isDark ? 'text-seka-text' : 'text-gray-900'
                }`}
            >
              Aucune donnée
            </p>
            <p
              className={`text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                }`}
            >
              Ajoutez des transactions pour voir vos analyses
            </p>
          </div>
        ) : (
          <>
            {/* Cartes Dépenses / Solde */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-xl p-4"
                style={{
                  background:
                    'linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%)',
                }}
              >
                <p className="text-white/80 text-xs mb-1">Dépenses Totales</p>
                <p className="text-xl font-bold text-white">
                  {formatMoney(stats.totalExp)}
                </p>
                <p className="text-white/60 text-[10px] mt-1">
                  {stats.expenses.length} transactions
                </p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{
                  background:
                    'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                }}
              >
                <p className="text-white/80 text-xs mb-1">Solde Net</p>
                <p className="text-xl font-bold text-white">
                  {stats.soldeNet >= 0 ? '+' : '-'}
                  {formatMoney(Math.abs(stats.soldeNet))}
                </p>
                <p className="text-white/60 text-[10px] mt-1">
                  Revenus: {formatMoney(stats.totalInc)}
                </p>
              </div>
            </div>

            {/* Donut Chart */}
            <div
              className={`p-4 rounded-xl ${isDark
                ? 'bg-seka-card/50 border border-seka-border'
                : 'bg-white shadow-sm border border-gray-100'
                }`}
            >
              <h3
                className={`text-sm font-medium mb-3 ${isDark ? 'text-seka-text' : 'text-gray-900'
                  }`}
              >
                Dépenses par catégorie
              </h3>
              {stats.catArray.length === 0 ? (
                <p
                  className={`text-center text-xs py-6 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                    }`}
                >
                  Aucune dépense
                </p>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <svg width="110" height="110" viewBox="0 0 110 110">
                      {(() => {
                        let cum = 0
                        return stats.catArray.slice(0, 7).map((c, i) => {
                          const pct = (c.amount / stats.catTotal) * 100
                          const start = cum * 3.6
                          cum += pct
                          const sr = (start - 90) * (Math.PI / 180)
                          const er = (cum * 3.6 - 90) * (Math.PI / 180)
                          const x1 = 55 + 45 * Math.cos(sr)
                          const y1 = 55 + 45 * Math.sin(sr)
                          const x2 = 55 + 45 * Math.cos(er)
                          const y2 = 55 + 45 * Math.sin(er)
                          return (
                            <path
                              key={i}
                              d={`M 55 55 L ${x1} ${y1} A 45 45 0 ${pct > 50 ? 1 : 0
                                } 1 ${x2} ${y2} Z`}
                              fill={COLORS[i % COLORS.length]}
                            />
                          )
                        })
                      })()}
                      <circle
                        cx="55"
                        cy="55"
                        r="28"
                        fill={isDark ? '#0D1117' : '#FFFFFF'}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span
                        className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                          }`}
                      >
                        Total
                      </span>
                      <span
                        className={`text-xs font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'
                          }`}
                      >
                        {formatMoney(stats.catTotal)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {stats.catArray.slice(0, 5).map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs"
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: COLORS[i % COLORS.length],
                          }}
                        />
                        <span className="text-lg">{c.emoji}</span>
                        <span
                          className={`flex-1 truncate ${isDark
                            ? 'text-seka-text-secondary'
                            : 'text-gray-600'
                            }`}
                        >
                          {c.label}
                        </span>
                        <span
                          className={isDark ? 'text-seka-text' : 'text-gray-900'}
                        >
                          {Math.round((c.amount / stats.catTotal) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bar chart jours */}
            <div
              className={`p-4 rounded-xl ${isDark
                ? 'bg-seka-card/50 border border-seka-border'
                : 'bg-white shadow-sm border border-gray-100'
                }`}
            >
              <h3
                className={`text-sm font-medium mb-3 ${isDark ? 'text-seka-text' : 'text-gray-900'
                  }`}
              >
                Dépenses par jour
              </h3>
              <div className="flex items-end justify-between h-28 gap-1.5">
                {stats.byDay.map((v, i) => {
                  const h = stats.maxDay > 0 ? (v / stats.maxDay) * 90 : 4
                  const op =
                    stats.maxDay > 0 ? 0.3 + (v / stats.maxDay) * 0.7 : 0.3
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full rounded-t transition-all relative group"
                        style={{
                          height: `${Math.max(h, 4)}px`,
                          backgroundColor: `rgba(139, 92, 246, ${op})`,
                        }}
                      >
                        <div
                          className={`absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${isDark
                            ? 'bg-seka-card text-seka-text'
                            : 'bg-gray-800 text-white'
                            }`}
                        >
                          {formatMoney(v)}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] mt-1 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                          }`}
                      >
                        {DAYS[i]}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p
                className={`text-[10px] mt-2 text-center ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                  }`}
              >
                Survolez les barres pour voir les montants
              </p>
            </div>

            {/* Aperçus */}
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`p-3 rounded-xl ${isDark
                  ? 'bg-seka-card/50 border border-seka-border'
                  : 'bg-white shadow-sm border border-gray-100'
                  }`}
              >
                <ShoppingBag className="w-4 h-4 text-seka-green mb-1" />
                <p
                  className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                    }`}
                >
                  Top catégories
                </p>
                {stats.catArray.slice(0, 3).map((c, i) => (
                  <p
                    key={i}
                    className={`text-xs truncate ${isDark ? 'text-seka-text' : 'text-gray-700'
                      }`}
                  >
                    {c.emoji} {c.label}
                  </p>
                ))}
              </div>
              <div
                className={`p-3 rounded-xl ${isDark
                  ? 'bg-seka-card/50 border border-seka-border'
                  : 'bg-white shadow-sm border border-gray-100'
                  }`}
              >
                <Calendar className="w-4 h-4 text-seka-gold mb-1" />
                <p
                  className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                    }`}
                >
                  Jour le plus actif
                </p>
                <p
                  className={`text-lg font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'
                    }`}
                >
                  {DAYS[stats.topDayIdx]}
                </p>
                <p
                  className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                    }`}
                >
                  {formatMoney(stats.byDay[stats.topDayIdx])}
                </p>
              </div>
              <div
                className={`p-3 rounded-xl ${isDark
                  ? 'bg-seka-card/50 border border-seka-border'
                  : 'bg-white shadow-sm border border-gray-100'
                  }`}
              >
                <TrendingUp className="w-4 h-4 text-seka-red mb-1" />
                <p
                  className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                    }`}
                >
                  Plus grosse dépense
                </p>
                <p
                  className={`text-sm font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'
                    }`}
                >
                  {stats.topExpense ? formatMoney(stats.topExpense.amount) : '-'}
                </p>
                <p
                  className={`text-[10px] truncate ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                    }`}
                >
                  {stats.topExpense?.description || ''}
                </p>
              </div>
              <div
                className={`p-3 rounded-xl ${isDark
                  ? 'bg-seka-card/50 border border-seka-border'
                  : 'bg-white shadow-sm border border-gray-100'
                  }`}
              >
                <CreditCard className="w-4 h-4 text-purple-400 mb-1" />
                <p
                  className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                    }`}
                >
                  Total transactions
                </p>
                <p
                  className={`text-lg font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'
                    }`}
                >
                  {stats.transactions.length}
                </p>
                <p
                  className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                    }`}
                >
                  {stats.expenses.length} dép. /{' '}
                  {stats.transactions.length - stats.expenses.length} rev.
                </p>
              </div>
            </div>

            {/* Moyenne & Prévision */}
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`p-4 rounded-xl ${isDark
                  ? 'bg-seka-card/50 border border-seka-border'
                  : 'bg-white shadow-sm border border-gray-100'
                  }`}
              >
                <Clock className="w-5 h-5 text-seka-gold mb-2" />
                <p
                  className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                    }`}
                >
                  Dépense quotidienne
                </p>
                <p
                  className={`text-lg font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'
                    }`}
                >
                  {formatMoney(Math.round(stats.avgDaily))}
                </p>
                <p
                  className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                    }`}
                >
                  Moyenne sur {stats.daysInPeriod} jours
                </p>
              </div>
              <div
                className={`p-4 rounded-xl ${isDark
                  ? 'bg-seka-card/50 border border-seka-border'
                  : 'bg-white shadow-sm border border-gray-100'
                  }`}
              >
                <TrendingUp className="w-5 h-5 text-seka-red mb-2" />
                <p
                  className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                    }`}
                >
                  Prévision fin de mois
                </p>
                <p className="text-lg font-bold text-seka-red">
                  {formatMoney(Math.round(stats.projected))}
                </p>
                <p
                  className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                    }`}
                >
                  Si rythme actuel maintenu
                </p>
              </div>
            </div>

            {/* Top 5 dépenses */}
            <div
              className={`p-4 rounded-xl ${isDark
                ? 'bg-seka-card/50 border border-seka-border'
                : 'bg-white shadow-sm border border-gray-100'
                }`}
            >
              <h3
                className={`text-sm font-medium mb-3 ${isDark ? 'text-seka-text' : 'text-gray-900'
                  }`}
              >
                Dépenses principales
              </h3>
              {stats.top5.length === 0 ? (
                <p
                  className={`text-xs text-center py-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                    }`}
                >
                  Aucune dépense
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.top5.map((tx, i) => {
                    const cat =
                      EXPENSE_CATEGORIES[tx.category] || {
                        emoji: '📦',
                        label: tx.category,
                      }
                    return (
                      <div
                        key={tx.id}
                        className={`flex items-center gap-3 py-2 border-b last:border-0 ${isDark ? 'border-seka-border' : 'border-gray-100'
                          }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-seka-red/20 text-seka-red text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <span className="text-lg">{cat.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm truncate ${isDark ? 'text-seka-text' : 'text-gray-900'
                              }`}
                          >
                            {tx.description || cat.label}
                          </p>
                          <p
                            className={`text-[10px] ${isDark
                              ? 'text-seka-text-muted'
                              : 'text-gray-500'
                              }`}
                          >
                            {formatDate(tx.date)}
                          </p>
                        </div>
                        <span className="text-sm text-seka-red font-semibold">
                          -{formatMoney(tx.amount)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Toutes catégories */}
            <div
              className={`p-4 rounded-xl ${isDark
                ? 'bg-seka-card/50 border border-seka-border'
                : 'bg-white shadow-sm border border-gray-100'
                }`}
            >
              <h3
                className={`text-sm font-medium mb-3 ${isDark ? 'text-seka-text' : 'text-gray-900'
                  }`}
              >
                Toutes les catégories
              </h3>
              {stats.catArray.length === 0 ? (
                <p
                  className={`text-xs text-center py-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                    }`}
                >
                  Aucune donnée
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.catArray.map((c, i) => {
                    const pct =
                      stats.catTotal > 0
                        ? (c.amount / stats.catTotal) * 100
                        : 0
                    return (
                      <div key={i}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{c.emoji}</span>
                          <span
                            className={`text-xs flex-1 ${isDark ? 'text-seka-text' : 'text-gray-700'
                              }`}
                          >
                            {c.label}
                          </span>
                          <span
                            className={`text-[10px] ${isDark
                              ? 'text-seka-text-muted'
                              : 'text-gray-500'
                              }`}
                          >
                            {c.count} trans.
                          </span>
                          <span
                            className={`text-xs w-20 text-right ${isDark ? 'text-seka-text' : 'text-gray-900'
                              }`}
                          >
                            {formatMoney(c.amount)}
                          </span>
                          <span
                            className={`text-xs w-10 text-right ${isDark ? 'text-seka-text' : 'text-gray-700'
                              }`}
                          >
                            {Math.round(pct)}%
                          </span>
                        </div>
                        <div
                          className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-seka-darker' : 'bg-gray-200'
                            }`}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}