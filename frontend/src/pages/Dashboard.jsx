import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, useTheme } from '../App'
import { useCurrency } from '../currency'
import { TrendingUp, TrendingDown, Wallet, ChevronRight, Plus, ArrowUpRight, ArrowDownLeft, Sparkles, Target, PiggyBank } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, Cell } from 'recharts'
import { formatDate, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/api'
import { useTransactions, useObjectives } from '../utils/hooks'
import NotificationBell from '../components/NotificationBell'

// ============================================
// SCORE FINANCIER SIMPLE
// Basé uniquement sur le budget mensuel
// ============================================
function calculateFinancialScore(stats, transactions) {
  const today = new Date().getDate()
  const solde = stats.income - stats.expense
  
  if (stats.income === 0 && stats.expense === 0) {
    return 0
  }

  if (solde < 0) {
    if (today <= 10) return 5
    if (today <= 15) return 10
    if (today <= 20) return 15
    if (today <= 25) return 20
    return 25
  }

  let score = 0

  const tauxEpargne = stats.income > 0 ? ((stats.income - stats.expense) / stats.income) * 100 : 0
  
  if (tauxEpargne >= 40) score += 40
  else if (tauxEpargne >= 30) score += 35
  else if (tauxEpargne >= 20) score += 28
  else if (tauxEpargne >= 10) score += 20
  else if (tauxEpargne >= 5) score += 12
  else if (tauxEpargne > 0) score += 5

  if (stats.expenseTrend <= -20) score += 20
  else if (stats.expenseTrend <= -10) score += 16
  else if (stats.expenseTrend <= 0) score += 12
  else if (stats.expenseTrend <= 10) score += 6
  else if (stats.expenseTrend <= 20) score += 3

  if (stats.income > 0 && stats.incomeTrend >= 10) score += 15
  else if (stats.income > 0 && stats.incomeTrend >= 0) score += 12
  else if (stats.income > 0 && stats.incomeTrend >= -10) score += 8
  else if (stats.income > 0) score += 4

  const topCategoryPercent = stats.topCategories.length > 0 ? stats.topCategories[0].percent : 0
  
  if (topCategoryPercent <= 25) score += 10
  else if (topCategoryPercent <= 35) score += 8
  else if (topCategoryPercent <= 50) score += 6
  else if (topCategoryPercent <= 65) score += 3

  if (today >= 28) score += 15
  else if (today >= 24) score += 12
  else if (today >= 20) score += 9
  else if (today >= 15) score += 6
  else if (today >= 10) score += 3

  return Math.min(100, score)
}

export default function Dashboard() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { formatMoney } = useCurrency()
  
  // React Query - données en cache, navigation instantanée
  const { data: transactions = [], isLoading: loadingTrans } = useTransactions()
  const { data: objectives = [], isLoading: loadingObj } = useObjectives()
  
  const [animatedBalance, setAnimatedBalance] = useState(0)
  const [expensePeriod, setExpensePeriod] = useState(6)

  // Skeleton seulement au tout premier chargement
  const showSkeleton = (loadingTrans || loadingObj) && transactions.length === 0 && objectives.length === 0

  const stats = useMemo(() => {
    const now = new Date()
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`

    const currentMonthTrans = transactions.filter(t => t.date?.startsWith(currentMonthKey))
    const income = currentMonthTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = currentMonthTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const balance = income - expense

    const lastMonthTrans = transactions.filter(t => t.date?.startsWith(lastMonthKey))
    const lastIncome = lastMonthTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const lastExpense = lastMonthTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

    const incomeTrend = lastIncome > 0
      ? Math.round((income - lastIncome) / lastIncome * 100)
      : (income > 0 ? 100 : 0)

    const expenseTrend = lastExpense > 0
      ? Math.round((expense - lastExpense) / lastExpense * 100)
      : (expense > 0 ? 100 : 0)

    const expByCat = {}
    currentMonthTrans
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = EXPENSE_CATEGORIES[t.category] || { label: t.category, emoji: '📦' }
        if (!expByCat[t.category]) expByCat[t.category] = { ...cat, amount: 0 }
        expByCat[t.category].amount += t.amount
      })

    const catArray = Object.values(expByCat).sort((a, b) => b.amount - a.amount)
    const catTotal = catArray.reduce((s, c) => s + c.amount, 0)
    const topCategories = catArray.slice(0, 3).map(c => ({
      ...c,
      percent: catTotal > 0 ? (c.amount / catTotal) * 100 : 0
    }))

    const monthName = now.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    })

    return {
      income,
      expense,
      balance,
      incomeTrend,
      expenseTrend,
      topCategories,
      current_month: { month_name: monthName }
    }
  }, [transactions])

  const financialScore = useMemo(() => {
    return calculateFinancialScore(stats, transactions)
  }, [stats, transactions])

  const epargne = useMemo(() => {
    return objectives.reduce((sum, obj) => sum + (obj.current_amount || 0), 0)
  }, [objectives])

  useEffect(() => {
    const target = stats.balance
    const duration = 1000
    const start = animatedBalance
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedBalance(Math.round(start + (target - start) * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [stats.balance])

  const balanceHistory = useMemo(() => {
    const now = new Date()
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const currentDay = now.getDate()

    const monthTransactions = transactions.filter(t => t.date?.startsWith(currentMonthKey))

    if (monthTransactions.length === 0) {
      return Array.from({ length: currentDay }, (_, i) => ({
        day: i + 1,
        date: `${currentMonthKey}-${String(i + 1).padStart(2, '0')}`,
        balance: 0
      }))
    }

    const data = []
    let cumulative = 0

    for (let day = 1; day <= currentDay; day++) {
      const dayKey = `${currentMonthKey}-${String(day).padStart(2, '0')}`
      const dayTrans = monthTransactions.filter(t => t.date === dayKey)
      const dayIncome = dayTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const dayExpense = dayTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      cumulative += dayIncome - dayExpense
      data.push({ day, date: dayKey, balance: cumulative })
    }

    return data
  }, [transactions])

  const expensesByMonth = useMemo(() => {
    const data = []
    const now = new Date()

    for (let i = expensePeriod - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const monthName = d.toLocaleDateString('fr-FR', { month: 'short' })

      const monthExpenses = transactions
        .filter(t => t.type === 'expense' && t.date?.startsWith(monthKey))
        .reduce((s, t) => s + t.amount, 0)

      data.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        fullMonth: d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        amount: monthExpenses,
        hasData: monthExpenses > 0
      })
    }
    return data
  }, [transactions, expensePeriod])

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8)
  }, [transactions])

  // Skeleton loader au premier chargement uniquement
  if (showSkeleton) {
    return (
      <div className={`px-4 pt-5 pb-4 space-y-4 ${isDark ? '' : 'bg-gray-50'}`}>
        {/* Header skeleton */}
        <div className="flex items-center justify-between animate-pulse">
          <div className="space-y-2">
            <div className={`h-3 w-16 rounded ${isDark ? 'bg-seka-card' : 'bg-gray-200'}`}></div>
            <div className={`h-6 w-32 rounded ${isDark ? 'bg-seka-card' : 'bg-gray-200'}`}></div>
          </div>
          <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-seka-card' : 'bg-gray-200'}`}></div>
        </div>
        
        {/* Card skeleton */}
        <div className={`h-64 rounded-3xl ${isDark ? 'bg-seka-card' : 'bg-gray-200'} animate-pulse`}></div>
        
        {/* Buttons skeleton */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`h-20 rounded-xl ${isDark ? 'bg-seka-card' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-20 rounded-xl ${isDark ? 'bg-seka-card' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
        
        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-2">
          <div className={`h-24 rounded-xl ${isDark ? 'bg-seka-card' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-24 rounded-xl ${isDark ? 'bg-seka-card' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-24 rounded-xl ${isDark ? 'bg-seka-card' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`px-4 pt-5 pb-4 space-y-4 ${isDark ? '' : 'bg-gray-50'}`}>
      <header className="flex items-center justify-between">
        <div>
          <p className={`text-xs ${isDark ? 'text-seka-text-secondary' : 'text-gray-500'}`}>
            {new Date().getHours() < 12
              ? 'Bonjour'
              : new Date().getHours() < 18
                ? 'Bon après-midi'
                : 'Bonsoir'} 👋
          </p>
          <h1 className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
            {user?.user_metadata?.firstName || user?.email?.split("@")[0] || "Utilisateur"}
          </h1>
        </div>
      <NotificationBell isDark={isDark} />
      </header>

      {/* Carte solde */}
      <div className="relative h-64 rounded-3xl overflow-hidden shadow-2xl shadow-seka-green/20 group transition-transform hover:scale-[1.02] duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-seka-darker to-black" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
          }}
        />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-seka-green/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <div className="relative h-full p-6 flex flex-col justify-between z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-100/60 text-xs font-medium tracking-wider mb-0.5 uppercase">
                Solde Total
              </p>
              <p className="text-[10px] text-emerald-100/40 mb-1">
                Période : {stats?.current_month?.month_name}
              </p>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                {animatedBalance < 0 ? '-' : ''}{formatMoney(Math.abs(animatedBalance))}
              </h2>
            </div>
            <Link
              to="/premium"
              className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 hover:bg-white/20 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-seka-gold" />
              <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] font-bold text-white tracking-wide">PREMIUM</span>
                <span className="text-[8px] text-seka-gold">4900F/an</span>
              </div>
            </Link>
          </div>

          <div className="h-24 w-full -mx-2 opacity-80 hover:opacity-100 transition-opacity duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceHistory}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d68f" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#00d68f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 12,
                    padding: '6px 8px'
                  }}
                  itemStyle={{ color: '#ffffff' }}
                  formatter={(value) => [formatMoney(value), 'Solde']}
                  labelStyle={{ display: 'none' }}
                  cursor={{ stroke: '#ffffff', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#00d68f"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBalance)"
                  animationDuration={2000}
                  activeDot={{ r: 4, stroke: '#ffffff', strokeWidth: 1, fill: '#00d68f' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-100/50 uppercase tracking-wide">Revenus</p>
                <p className="text-sm font-bold text-white">
                  +{formatMoney(stats.income)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-red-300" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-100/50 uppercase tracking-wide">Dépenses</p>
                <p className="text-sm font-bold text-white">
                  -{formatMoney(stats.expense)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Boutons action */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/add?type=income"
          className={`p-4 flex items-center gap-3 relative overflow-hidden group rounded-xl ${isDark
            ? 'bg-seka-card/50 border border-seka-border'
            : 'bg-white shadow-sm border border-gray-100'
            }`}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-seka-green/50 to-transparent" />
          <div className="w-11 h-11 rounded-xl bg-seka-green/15 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5 text-seka-green" />
          </div>
          <div>
            <p className={`font-semibold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
              Revenu
            </p>
            <p className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
              Ajouter
            </p>
          </div>
        </Link>
        <Link
          to="/add?type=expense"
          className={`p-4 flex items-center gap-3 relative overflow-hidden group rounded-xl ${isDark
            ? 'bg-seka-card/50 border border-seka-border'
            : 'bg-white shadow-sm border border-gray-100'
            }`}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-seka-green/50 to-transparent" />
          <div className="w-11 h-11 rounded-xl bg-seka-red/15 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-seka-red" />
          </div>
          <div>
            <p className={`font-semibold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
              Dépense
            </p>
            <p className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
              Ajouter
            </p>
          </div>
        </Link>
      </div>

      {/* Score financier SIMPLE */}
      <Link to="/analyses" className="block group">
        <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 p-5 rounded-2xl relative overflow-hidden active:scale-[0.98] transition-transform duration-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="flex justify-between items-center relative z-10 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-seka-text text-sm">Score Budget</h3>
                <p className="text-xs text-indigo-200/70">
                  {financialScore >= 80
                    ? 'Excellent ! 🏆'
                    : financialScore >= 60
                      ? 'Très bien 👍'
                      : financialScore >= 40
                        ? 'Correct 📊'
                        : financialScore >= 20
                          ? 'Attention ⚠️'
                          : 'À améliorer 📉'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-bold ${
                financialScore >= 60 ? 'text-seka-green' 
                : financialScore >= 40 ? 'text-seka-gold' 
                : 'text-seka-red'
              }`}>
                {financialScore}
                <span className="text-sm text-seka-text-secondary">/100</span>
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-indigo-200/50 border-t border-indigo-500/20 pt-3">
            <span className="font-medium text-indigo-300 group-hover:text-white transition-colors">
              Voir l'analyse complète
            </span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>

      {/* Vue du mois */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className={`p-3 rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'
            }`}
        >
          <ArrowDownLeft className="w-4 h-4 text-seka-green mb-1" />
          <p className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Revenus</p>
          <p className="text-sm font-bold text-seka-green">
            {formatMoney(stats.income)}
          </p>
          <span
            className={`text-[9px] ${stats.incomeTrend >= 0 ? 'text-seka-green' : 'text-seka-red'
              }`}
          >
            {stats.incomeTrend >= 0 ? '+' : ''}
            {stats.incomeTrend}%
          </span>
        </div>
        <div
          className={`p-3 rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'
            }`}
        >
          <ArrowUpRight className="w-4 h-4 text-seka-red mb-1" />
          <p className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
            Dépenses
          </p>
          <p className="text-sm font-bold text-seka-red">
            {formatMoney(stats.expense)}
          </p>
          <span
            className={`text-[9px] ${stats.expenseTrend <= 0 ? 'text-seka-green' : 'text-seka-red'
              }`}
          >
            {stats.expenseTrend >= 0 ? '+' : ''}
            {stats.expenseTrend}%
          </span>
        </div>
        <div
          className={`p-3 rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'
            }`}
        >
          <PiggyBank className="w-4 h-4 mb-1 text-purple-500" />
          <p className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
            Épargne
          </p>
          <p className="text-sm font-bold text-purple-500">
            {formatMoney(epargne)}
          </p>
        </div>
      </div>

      {/* Top catégories */}
      {stats.topCategories.length > 0 && (
        <div
          className={`p-4 rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'
            }`}
        >
          <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
            Dépenses par catégorie
          </h3>
          <div className="space-y-3">
            {stats.topCategories.map((cat, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{cat.emoji}</span>
                  <span
                    className={`text-xs flex-1 ${isDark ? 'text-seka-text' : 'text-gray-700'
                      }`}
                  >
                    {cat.label}
                  </span>
                  <span
                    className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                      }`}
                  >
                    {formatMoney(cat.amount)}
                  </span>
                  <span
                    className={`text-xs w-10 text-right ${isDark ? 'text-seka-text' : 'text-gray-700'
                      }`}
                  >
                    {Math.round(cat.percent)}%
                  </span>
                </div>
                <div
                  className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-seka-darker' : 'bg-gray-200'
                    }`}
                >
                  <div
                    className="h-full rounded-full bg-purple-500"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/analyses"
            className="block text-center text-seka-green text-xs mt-3"
          >
            Voir toutes les catégories →
          </Link>
        </div>
      )}

      {/* Graphique dépenses par mois */}
      <div
        className={`p-4 rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'
          }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
            Évolution des dépenses
          </h3>
          <div className="flex gap-1">
            {[3, 6, 12].map(p => (
              <button
                key={p}
                onClick={() => setExpensePeriod(p)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${expensePeriod === p
                  ? 'bg-purple-500 text-white'
                  : isDark
                    ? 'bg-seka-darker text-seka-text-muted hover:text-seka-text'
                    : 'bg-gray-100 text-gray-500 hover:text-gray-700'
                  }`}
              >
                {p}M
              </button>
            ))}
          </div>
        </div>

        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expensesByMonth} barCategoryGap="20%">
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: isDark ? '#6B7280' : '#9CA3AF',
                  fontSize: 10
                }}
              />
              <YAxis hide />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  border: isDark ? '1px solid #374151' : '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 12,
                  padding: '8px 12px'
                }}
                itemStyle={{ color: isDark ? '#ffffff' : '#111827' }}
                formatter={(value, name, props) => [
                  formatMoney(value),
                  props.payload.fullMonth
                ]}
                labelStyle={{ display: 'none' }}
                cursor={{
                  fill: isDark
                    ? 'rgba(139,92,246,0.1)'
                    : 'rgba(139,92,246,0.05)'
                }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} animationDuration={1500}>
                {expensesByMonth.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.hasData ? '#8B5CF6' : 'rgba(107,114,128,0.3)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-4 mt-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-purple-500" />
            <span className={isDark ? 'text-seka-text-muted' : 'text-gray-500'}>
              Mois avec dépenses
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gray-600/30" />
            <span className={isDark ? 'text-seka-text-muted' : 'text-gray-500'}>
              Aucune dépense
            </span>
          </div>
        </div>
      </div>

      {/* Dernières transactions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2
            className={`font-medium text-sm ${isDark ? 'text-seka-text' : 'text-gray-900'
              }`}
          >
            Dernières transactions
          </h2>
          <Link
            to="/transactions"
            className="text-seka-green text-xs flex items-center gap-1"
          >
            Voir tout <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-1.5">
          {recentTransactions.length === 0 ? (
            <div
              className={`p-6 text-center rounded-xl ${isDark
                ? 'bg-seka-card/50 border border-seka-border'
                : 'bg-white shadow-sm border border-gray-100'
                }`}
            >
              <Wallet
                className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'
                  }`}
              />
              <p
                className={`text-sm ${isDark ? 'text-seka-text-secondary' : 'text-gray-500'
                  }`}
              >
                Aucune transaction
              </p>
            </div>
          ) : (
            recentTransactions.slice(0, 5).map(t => {
              const isExp = t.type === 'expense'
              const cats = isExp ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
              const cat = cats[t.category] || { emoji: '📦', label: t.category }
              return (
                <div
                  key={t.id}
                  className={`py-3 px-3 flex items-center justify-between rounded-xl ${isDark
                    ? 'bg-seka-card/50 border border-seka-border'
                    : 'bg-white shadow-sm border border-gray-100'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${isDark ? 'bg-seka-darker' : 'bg-gray-100'
                        }`}
                    >
                      {cat.emoji}
                    </div>
                    <div>
                      <p
                        className={`font-medium text-xs ${isDark ? 'text-seka-text' : 'text-gray-900'
                          }`}
                      >
                        {cat.label}
                      </p>
                      <p
                        className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                          }`}
                      >
                        {t.description || formatDate(t.date)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold text-xs ${isExp ? 'text-seka-red' : 'text-seka-green'
                      }`}
                  >
                    {isExp ? '-' : '+'}
                    {formatMoney(t.amount)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
