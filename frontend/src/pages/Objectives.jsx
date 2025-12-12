import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Target, Users, TrendingUp, X, Calendar, AlertCircle,
  Loader2, ChevronDown, ChevronUp, Phone, Clock, Check, Trash2
} from 'lucide-react'
import { useTheme } from '../App'
import { useCurrency } from '../currency'
import { depositsApi, loansApi } from '../utils/api'
import { 
  useObjectives, useLoans, useInvestments, useDeposits,
  useCreateObjective, useUpdateObjective, useDeleteObjective,
  useCreateLoan, useUpdateLoan, useDeleteLoan, useAddLoanPayment, useLoanPayments,
  useCreateInvestment, useDeleteInvestment, useCreateDeposit
} from '../utils/hooks'

// Icônes disponibles pour les objectifs
const ICONS = [
  { key: 'phone', emoji: '📱' },
  { key: 'car', emoji: '🚗' },
  { key: 'house', emoji: '🏠' },
  { key: 'plane', emoji: '✈️' },
  { key: 'graduation', emoji: '🎓' },
  { key: 'ring', emoji: '💍' },
  { key: 'baby', emoji: '👶' },
  { key: 'laptop', emoji: '💻' },
  { key: 'health', emoji: '🏥' },
  { key: 'gift', emoji: '🎁' },
  { key: 'tontine', emoji: '🤝' },
  { key: 'other', emoji: '🎯' },
]

// Couleurs disponibles (12 choix)
const COLORS = [
  { key: 'green', value: '#00D4AA' },
  { key: 'emerald', value: '#10B981' },
  { key: 'teal', value: '#14B8A6' },
  { key: 'cyan', value: '#06B6D4' },
  { key: 'blue', value: '#3B82F6' },
  { key: 'indigo', value: '#6366F1' },
  { key: 'purple', value: '#8B5CF6' },
  { key: 'pink', value: '#EC4899' },
  { key: 'rose', value: '#F43F5E' },
  { key: 'orange', value: '#F97316' },
  { key: 'amber', value: '#F59E0B' },
  { key: 'gold', value: '#D4AF37' },
]

// Icônes pour les investissements
const INVEST_ICONS = [
  { key: 'tontine', emoji: '🤝', label: 'Tontine' },
  { key: 'actions', emoji: '📈', label: 'Actions' },
  { key: 'crypto', emoji: '₿', label: 'Crypto' },
  { key: 'bitcoin', emoji: '🪙', label: 'Bitcoin' },
  { key: 'immobilier', emoji: '🏠', label: 'Immobilier' },
  { key: 'terrain', emoji: '🏗️', label: 'Terrain' },
  { key: 'epargne', emoji: '🏦', label: 'Épargne' },
  { key: 'or', emoji: '🥇', label: 'Or' },
  { key: 'business', emoji: '💼', label: 'Business' },
  { key: 'agriculture', emoji: '🌾', label: 'Agriculture' },
  { key: 'transport', emoji: '🚗', label: 'Transport' },
  { key: 'autre', emoji: '📦', label: 'Autre' },
]

const formatDisplayAmount = (value) => {
  if (!value) return ''
  const num = parseInt(value.toString().replace(/\D/g, '')) || 0
  if (num === 0) return ''
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const parseDisplayAmount = (displayValue) => {
  return parseInt(displayValue.replace(/\./g, '')) || 0
}

// Composant Swipeable pour glisser et supprimer
function SwipeableCard({ children, onDelete, isDark, deleteLabel = "Supprimer" }) {
  const [startX, setStartX] = useState(null)
  const [offsetX, setOffsetX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const threshold = -60

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX)
    setIsSwiping(true)
  }

  const handleTouchMove = (e) => {
    if (!isSwiping || startX === null) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startX
    if (diff < 0) {
      setOffsetX(Math.max(diff, -80))
    } else {
      setOffsetX(0)
    }
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)
    if (offsetX < threshold) {
      setOffsetX(-80)
    } else {
      setOffsetX(0)
    }
    setStartX(null)
  }

  const handleDelete = () => {
    if (confirm('Voulez-vous vraiment supprimer cet élément ?')) {
      onDelete()
    }
    setOffsetX(0)
  }

  const resetSwipe = () => {
    setOffsetX(0)
  }

  const showDeleteButton = offsetX < -10

  return (
    <div className="relative rounded-xl" style={{ overflow: 'hidden' }}>
      {showDeleteButton && (
        <div
          className="absolute right-0 top-0 bottom-0 w-20 bg-seka-red flex items-center justify-center"
          style={{ borderRadius: '0 12px 12px 0' }}
          onClick={handleDelete}
        >
          <div className="flex flex-col items-center text-white">
            <Trash2 className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">{deleteLabel}</span>
          </div>
        </div>
      )}

      <div
        className="relative transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={offsetX < 0 ? resetSwipe : undefined}
      >
        {children}
      </div>
    </div>
  )
}

export default function Objectives() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { formatMoney, symbol } = useCurrency()

  // React Query - données en cache
  const { data: objectives = [], isLoading: loadingObj } = useObjectives()
  const { data: loans = [], isLoading: loadingLoans } = useLoans()
  const { data: investments = [], isLoading: loadingInvest } = useInvestments()

  // Mutations
  const createObjective = useCreateObjective()
  const updateObjective = useUpdateObjective()
  const deleteObjective = useDeleteObjective()
  const createLoan = useCreateLoan()
  const updateLoan = useUpdateLoan()
  const deleteLoan = useDeleteLoan()
  const addLoanPayment = useAddLoanPayment()
  const createInvestment = useCreateInvestment()
  const deleteInvestment = useDeleteInvestment()
  const createDeposit = useCreateDeposit()

  const [tab, setTab] = useState('epargne')

  // Modal states
  const [showModal, setShowModal] = useState(null)
  const [selectedObjective, setSelectedObjective] = useState(null)
  const [selectedLoan, setSelectedLoan] = useState(null)

  // Historique
  const [expandedObjective, setExpandedObjective] = useState(null)
  const [expandedLoan, setExpandedLoan] = useState(null)
  const [deposits, setDeposits] = useState([])
  const [loadingDeposits, setLoadingDeposits] = useState(false)
  const [loanPayments, setLoanPayments] = useState([])
  const [loadingLoanPayments, setLoadingLoanPayments] = useState(false)

  // Form fields - Objectif
  const [objectiveName, setObjectiveName] = useState('')
  const [displayTarget, setDisplayTarget] = useState('')
  const [objectiveDeadline, setObjectiveDeadline] = useState('')
  const [objectiveIcon, setObjectiveIcon] = useState('other')
  const [objectiveColor, setObjectiveColor] = useState('green')

  // Form fields - Versement
  const [displayPayment, setDisplayPayment] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentNote, setPaymentNote] = useState('')

  // Form fields - Prêt
  const [loanType, setLoanType] = useState('lent')
  const [loanContactName, setLoanContactName] = useState('')
  const [loanContactPhone, setLoanContactPhone] = useState('')
  const [displayLoanAmount, setDisplayLoanAmount] = useState('')
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0])
  const [loanDueDate, setLoanDueDate] = useState('')
  const [loanNote, setLoanNote] = useState('')

  // Form fields - Investissement
  const [investName, setInvestName] = useState('')
  const [investType, setInvestType] = useState('tontine')
  const [displayInvestAmount, setDisplayInvestAmount] = useState('')
  const [investDate, setInvestDate] = useState(new Date().toISOString().split('T')[0])
  const [investNote, setInvestNote] = useState('')

  // Form fields - Remboursement
  const [displayRepayAmount, setDisplayRepayAmount] = useState('')
  const [repayDate, setRepayDate] = useState(new Date().toISOString().split('T')[0])
  const [repayNote, setRepayNote] = useState('')

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Skeleton au premier chargement uniquement
  const showSkeleton = (loadingObj || loadingLoans || loadingInvest) && 
    objectives.length === 0 && loans.length === 0 && investments.length === 0

  const loadDeposits = async (objectiveId) => {
    setLoadingDeposits(true)
    try {
      const data = await depositsApi.getByObjective(objectiveId)
      setDeposits(data || [])
    } catch (e) {
      console.error('Erreur chargement versements:', e)
      setDeposits([])
    } finally {
      setLoadingDeposits(false)
    }
  }

  const toggleObjectiveHistory = async (objectiveId) => {
    if (expandedObjective === objectiveId) {
      setExpandedObjective(null)
      setDeposits([])
    } else {
      setExpandedObjective(objectiveId)
      await loadDeposits(objectiveId)
    }
  }

  const loadLoanPayments = async (loanId) => {
    setLoadingLoanPayments(true)
    try {
      const data = await loansApi.getPayments(loanId)
      setLoanPayments(data || [])
    } catch (e) {
      console.error('Erreur chargement remboursements:', e)
      setLoanPayments([])
    } finally {
      setLoadingLoanPayments(false)
    }
  }

  const toggleLoanHistory = async (loanId) => {
    if (expandedLoan === loanId) {
      setExpandedLoan(null)
      setLoanPayments([])
    } else {
      setExpandedLoan(loanId)
      await loadLoanPayments(loanId)
    }
  }

  // Calculs
  const totalSaved = objectives.reduce((s, o) => s + (o.current_amount || o.saved || 0), 0)
  const lentTotal = loans.filter(l => l.type === 'lent').reduce((s, l) => s + (l.amount_remaining || 0), 0)
  const borrowedTotal = loans.filter(l => l.type === 'borrowed').reduce((s, l) => s + (l.amount_remaining || 0), 0)
  const investTotal = investments.reduce((s, i) => s + (i.amount || 0), 0)

  const resetModal = () => {
    setShowModal(null)
    setSelectedObjective(null)
    setSelectedLoan(null)
    setObjectiveName('')
    setDisplayTarget('')
    setObjectiveDeadline('')
    setObjectiveIcon('other')
    setObjectiveColor('green')
    setDisplayPayment('')
    setPaymentDate(new Date().toISOString().split('T')[0])
    setPaymentNote('')
    setLoanType('lent')
    setLoanContactName('')
    setLoanContactPhone('')
    setDisplayLoanAmount('')
    setLoanDate(new Date().toISOString().split('T')[0])
    setLoanDueDate('')
    setLoanNote('')
    setInvestName('')
    setInvestType('tontine')
    setDisplayInvestAmount('')
    setInvestDate(new Date().toISOString().split('T')[0])
    setInvestNote('')
    setDisplayRepayAmount('')
    setRepayDate(new Date().toISOString().split('T')[0])
    setRepayNote('')
    setError('')
    setSaving(false)
  }

  // === OBJECTIFS ===
  const handleCreateObjective = async () => {
    if (!objectiveName.trim()) return setError('Nom requis')
    const targetAmount = parseDisplayAmount(displayTarget)
    if (!targetAmount) return setError('Montant cible invalide')

    setSaving(true)
    try {
      await createObjective.mutateAsync({
        name: objectiveName.trim(),
        target_amount: targetAmount,
        current_amount: 0,
        deadline: objectiveDeadline || null,
        icon: objectiveIcon,
        color: objectiveColor
      })
      resetModal()
    } catch (e) {
      setError('Erreur: ' + (e.message || 'Vérifiez Supabase'))
    } finally {
      setSaving(false)
    }
  }

  const handleAddDeposit = async () => {
    const amount = parseDisplayAmount(displayPayment)
    if (!amount) return setError('Montant invalide')

    const currentSaved = selectedObjective.current_amount || selectedObjective.saved || 0
    const targetAmount = selectedObjective.target_amount || selectedObjective.target || 0
    const newSaved = Math.min(currentSaved + amount, targetAmount)

    setSaving(true)
    try {
      await createDeposit.mutateAsync({
        objective_id: selectedObjective.id,
        amount,
        date: paymentDate,
        note: paymentNote || null
      })

      const updateData = selectedObjective.current_amount !== undefined
        ? { current_amount: newSaved }
        : { saved: newSaved }

      await updateObjective.mutateAsync({ id: selectedObjective.id, updates: updateData })
      resetModal()
    } catch (e) {
      setError('Erreur: ' + (e.message || 'Échec enregistrement'))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteObjective = async (id) => {
    try {
      await deleteObjective.mutateAsync(id)
    } catch (e) {
      console.error('Erreur suppression:', e)
    }
  }

  // === PRÊTS ===
  const handleCreateLoan = async () => {
    if (!loanContactName.trim()) return setError('Nom du contact requis')
    const amount = parseDisplayAmount(displayLoanAmount)
    if (!amount) return setError('Montant invalide')

    setSaving(true)
    try {
      await createLoan.mutateAsync({
        type: loanType,
        contact_name: loanContactName.trim(),
        contact_phone: loanContactPhone || null,
        amount,
        date: loanDate,
        due_date: loanDueDate || null,
        note: loanNote || null
      })
      resetModal()
    } catch (e) {
      console.error('Erreur création prêt:', e)
      setError('Erreur: ' + (e.message || 'Vérifiez la table loans dans Supabase'))
    } finally {
      setSaving(false)
    }
  }

  const handleRepayLoan = async () => {
    const amount = parseDisplayAmount(displayRepayAmount)
    if (!amount) return setError('Montant invalide')

    const remaining = selectedLoan.amount_remaining || 0
    if (amount > remaining) return setError(`Maximum: ${formatMoney(remaining)}`)

    const newRemaining = remaining - amount
    const newStatus = newRemaining === 0 ? 'paid' : 'partial'

    setSaving(true)
    try {
      await addLoanPayment.mutateAsync({
        loanId: selectedLoan.id,
        payment: {
          amount,
          date: repayDate,
          note: repayNote || null
        }
      })

      await updateLoan.mutateAsync({
        id: selectedLoan.id,
        updates: {
          amount_remaining: newRemaining,
          status: newStatus
        }
      })
      resetModal()
    } catch (e) {
      setError('Erreur: ' + (e.message || 'Échec remboursement'))
    } finally {
      setSaving(false)
    }
  }

  // === INVESTISSEMENTS ===
  const handleCreateInvestment = async () => {
    if (!investName.trim()) return setError('Nom requis')
    const amount = parseDisplayAmount(displayInvestAmount)
    if (!amount) return setError('Montant invalide')

    setSaving(true)
    try {
      await createInvestment.mutateAsync({
        name: investName.trim(),
        type: investType,
        amount,
        date: investDate,
        note: investNote || null
      })
      resetModal()
    } catch (e) {
      console.error('Erreur création investissement:', e)
      setError('Erreur: ' + (e.message || 'Vérifiez la table investments dans Supabase'))
    } finally {
      setSaving(false)
    }
  }

  // === SUPPRESSION ===
  const handleDeleteLoan = async (id) => {
    try {
      await deleteLoan.mutateAsync(id)
      setExpandedLoan(null)
    } catch (e) {
      console.error('Erreur suppression prêt:', e)
    }
  }

  const handleDeleteInvestment = async (id) => {
    try {
      await deleteInvestment.mutateAsync(id)
    } catch (e) {
      console.error('Erreur suppression investissement:', e)
    }
  }

  // Helpers
  const getSaved = (obj) => obj.current_amount ?? obj.saved ?? 0
  const getTarget = (obj) => obj.target_amount ?? obj.target ?? 0
  const getIcon = (key) => ICONS.find(i => i.key === key)?.emoji || '🎯'
  const getColor = (key) => COLORS.find(c => c.key === key)?.value || '#00D4AA'

  const inputClass = `w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-seka-darker border-seka-border text-seka-text placeholder:text-seka-text-muted' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'}`

  // Skeleton loader
  if (showSkeleton) {
    return (
      <div className={`min-h-screen pb-24 ${isDark ? 'bg-seka-dark' : 'bg-gray-50'}`}>
        <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-4 py-4 ${isDark ? 'bg-seka-dark/95 border-seka-border' : 'bg-white/95 border-gray-200'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}></div>
            <div className={`h-6 w-24 rounded ${isDark ? 'bg-seka-card' : 'bg-gray-200'}`}></div>
          </div>
        </header>
        <div className="px-4 pt-4 space-y-4 animate-pulse">
          <div className={`h-12 rounded-xl ${isDark ? 'bg-seka-card' : 'bg-gray-200'}`}></div>
          <div className={`h-20 rounded-xl ${isDark ? 'bg-seka-card' : 'bg-gray-200'}`}></div>
          <div className={`h-12 rounded-xl ${isDark ? 'bg-seka-card' : 'bg-gray-200'}`}></div>
          <div className={`h-32 rounded-xl ${isDark ? 'bg-seka-card' : 'bg-gray-200'}`}></div>
          <div className={`h-32 rounded-xl ${isDark ? 'bg-seka-card' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen pb-24 ${isDark ? 'bg-seka-dark' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-4 py-4 ${isDark ? 'bg-seka-dark/95 border-seka-border' : 'bg-white/95 border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}>
            <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-800'}`} />
          </button>
          <h1 className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>Objectifs</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}>
          {[
            { key: 'epargne', label: 'Épargne', icon: Target },
            { key: 'prets', label: 'Prêts', icon: Users },
            { key: 'invest', label: 'Invest.', icon: TrendingUp }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${tab === t.key
                  ? 'bg-seka-green text-seka-darker'
                  : isDark ? 'text-seka-text-secondary' : 'text-gray-600'
                }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* === TAB ÉPARGNE === */}
        {tab === 'epargne' && (
          <>
            <div className={`p-4 flex items-center justify-between rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
              <div>
                <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Total épargné</p>
                <p className="text-xl font-bold text-seka-green">{formatMoney(totalSaved)}</p>
              </div>
              <div className="text-right">
                <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Objectifs</p>
                <p className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>{objectives.length}</p>
              </div>
            </div>

            <button
              onClick={() => setShowModal('new-objective')}
              className="w-full py-3 rounded-xl bg-seka-green text-seka-darker font-semibold flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Nouvel objectif
            </button>

            {objectives.length === 0 && (
              <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
                <Target className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Aucun objectif pour l'instant</p>
              </div>
            )}

            {objectives.map(obj => {
              const saved = getSaved(obj)
              const target = getTarget(obj)
              const pct = target > 0 ? (saved / target) * 100 : 0
              const color = getColor(obj.color)
              const isExpanded = expandedObjective === obj.id

              return (
                <SwipeableCard key={obj.id} isDark={isDark} onDelete={() => handleDeleteObjective(obj.id)}>
                  <div className={`p-4 ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getIcon(obj.icon)}</span>
                        <div>
                          <h3 className={`font-semibold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>{obj.name}</h3>
                          {obj.deadline && (
                            <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                              <Calendar className="w-3 h-3" />
                              {new Date(obj.deadline).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span style={{ color }}>{formatMoney(saved)}</span>
                        <span className={isDark ? 'text-seka-text-muted' : 'text-gray-500'}>{formatMoney(target)}</span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-seka-darker' : 'bg-gray-200'}`}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
                      </div>
                      <p className={`text-xs mt-1 text-right ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>{Math.round(pct)}%</p>
                    </div>

                    <div className="flex gap-2">
                      {pct < 100 ? (
                        <button
                          onClick={() => { setSelectedObjective(obj); setShowModal('versement') }}
                          className="flex-1 py-2 rounded-lg text-sm font-medium"
                          style={{ backgroundColor: color + '20', color }}
                        >
                          + Ajouter versement
                        </button>
                      ) : (
                        <div className="flex-1 text-center py-2 text-seka-green text-sm font-medium">🎉 Objectif atteint !</div>
                      )}

                      <button
                        onClick={() => toggleObjectiveHistory(obj.id)}
                        className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1 ${isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        Historique
                      </button>
                    </div>

                    {isExpanded && (
                      <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-seka-darker' : 'bg-gray-50'}`}>
                        {loadingDeposits ? (
                          <div className="flex justify-center py-2">
                            <Loader2 className="w-5 h-5 text-seka-green animate-spin" />
                          </div>
                        ) : deposits.length === 0 ? (
                          <p className={`text-xs text-center ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Aucun versement enregistré</p>
                        ) : (
                          <div className="space-y-2">
                            {deposits.map(d => (
                              <div key={d.id} className="flex justify-between text-xs">
                                <div className={isDark ? 'text-seka-text-muted' : 'text-gray-500'}>
                                  {new Date(d.date).toLocaleDateString('fr-FR')}
                                  {d.note && <span className="ml-2 italic">• {d.note}</span>}
                                </div>
                                <span className="text-seka-green font-medium">+{formatMoney(d.amount)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </SwipeableCard>
              )
            })}
          </>
        )}

        {/* === TAB PRÊTS === */}
        {tab === 'prets' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
                <p className="text-white/80 text-xs mb-1">🤝 Ils me doivent</p>
                <p className="text-xl font-bold text-white">{formatMoney(lentTotal)}</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
                <p className="text-white/80 text-xs mb-1">💸 Je dois</p>
                <p className="text-xl font-bold text-white">{formatMoney(borrowedTotal)}</p>
              </div>
            </div>

            <button
              onClick={() => setShowModal('new-loan')}
              className="w-full py-3 rounded-xl bg-seka-green text-seka-darker font-semibold flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Nouveau prêt
            </button>

            {loans.length === 0 && (
              <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
                <Users className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Aucun prêt enregistré</p>
              </div>
            )}

            {loans.filter(l => l.type === 'lent').length > 0 && (
              <>
                <h3 className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                  <span className="w-6 h-6 rounded-full bg-seka-green/20 flex items-center justify-center text-xs">🤝</span>
                  Ils me doivent
                </h3>
                {loans.filter(l => l.type === 'lent').map(loan => (
                  <SwipeableCard key={loan.id} isDark={isDark} onDelete={() => handleDeleteLoan(loan.id)}>
                    <LoanCard
                      loan={loan}
                      isDark={isDark}
                      isLent={true}
                      isExpanded={expandedLoan === loan.id}
                      onToggle={() => toggleLoanHistory(loan.id)}
                      payments={expandedLoan === loan.id ? loanPayments : []}
                      loadingPayments={expandedLoan === loan.id && loadingLoanPayments}
                      onRepay={() => { setSelectedLoan(loan); setShowModal('repay-loan') }}
                      formatMoney={formatMoney}
                    />
                  </SwipeableCard>
                ))}
              </>
            )}

            {loans.filter(l => l.type === 'borrowed').length > 0 && (
              <>
                <h3 className={`text-sm font-medium flex items-center gap-2 mt-4 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                  <span className="w-6 h-6 rounded-full bg-seka-gold/20 flex items-center justify-center text-xs">💸</span>
                  Je dois
                </h3>
                {loans.filter(l => l.type === 'borrowed').map(loan => (
                  <SwipeableCard key={loan.id} isDark={isDark} onDelete={() => handleDeleteLoan(loan.id)}>
                    <LoanCard
                      loan={loan}
                      isDark={isDark}
                      isLent={false}
                      isExpanded={expandedLoan === loan.id}
                      onToggle={() => toggleLoanHistory(loan.id)}
                      payments={expandedLoan === loan.id ? loanPayments : []}
                      loadingPayments={expandedLoan === loan.id && loadingLoanPayments}
                      onRepay={() => { setSelectedLoan(loan); setShowModal('repay-loan') }}
                      formatMoney={formatMoney}
                    />
                  </SwipeableCard>
                ))}
              </>
            )}
          </>
        )}

        {/* === TAB INVESTISSEMENTS === */}
        {tab === 'invest' && (
          <>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm'}`}>
              <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Total investi</p>
              <p className="text-xl font-bold text-purple-500">{formatMoney(investTotal)}</p>
            </div>

            <button
              onClick={() => setShowModal('new-investment')}
              className="w-full py-3 rounded-xl bg-purple-500 text-white font-semibold flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Nouvel investissement
            </button>

            {investments.length === 0 && (
              <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
                <TrendingUp className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Aucun investissement</p>
              </div>
            )}

            {investments.map(inv => {
              const investIcon = INVEST_ICONS.find(i => i.key === inv.type) || INVEST_ICONS.find(i => i.key === 'autre')
              return (
                <SwipeableCard key={inv.id} isDark={isDark} onDelete={() => handleDeleteInvestment(inv.id)}>
                  <div className={`p-4 ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                          <span className="text-lg">{investIcon?.emoji || '📦'}</span>
                        </div>
                        <div>
                          <p className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>{inv.name}</p>
                          <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                            {investIcon?.label || inv.type} • {new Date(inv.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-purple-500">{formatMoney(inv.amount)}</p>
                    </div>
                  </div>
                </SwipeableCard>
              )
            })}
          </>
        )}
      </div>

      {/* === MODALS === */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={resetModal}>
          <div
            className={`rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto ${isDark ? 'bg-seka-card' : 'bg-white'}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Nouvel Objectif */}
            {showModal === 'new-objective' && (
              <>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>Nouvel objectif</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Nom *</label>
                    <input type="text" value={objectiveName} onChange={e => setObjectiveName(e.target.value)} placeholder="Ex: iPhone, Voyage..." className={inputClass} />
                  </div>

                  <div>
                    <label className={`block text-xs mb-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Icône</label>
                    <div className="grid grid-cols-6 gap-2">
                      {ICONS.map(i => (
                        <button key={i.key} type="button" onClick={() => setObjectiveIcon(i.key)} className={`p-2 rounded-lg text-xl ${objectiveIcon === i.key ? 'bg-seka-green/20 ring-2 ring-seka-green' : isDark ? 'bg-seka-darker' : 'bg-gray-100'}`}>
                          {i.emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs mb-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Couleur</label>
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map(c => (
                        <button key={c.key} type="button" onClick={() => setObjectiveColor(c.key)} className={`w-8 h-8 rounded-full ${objectiveColor === c.key ? 'ring-2 ring-offset-2 ring-seka-green' : ''}`} style={{ backgroundColor: c.value }} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Montant cible ({symbol}) *</label>
                    <input type="text" inputMode="numeric" value={displayTarget} onChange={e => setDisplayTarget(formatDisplayAmount(e.target.value))} placeholder="500.000" className={`${inputClass} text-lg font-bold text-center`} />
                  </div>

                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Échéance (optionnel)</label>
                    <input type="date" value={objectiveDeadline} onChange={e => setObjectiveDeadline(e.target.value)} className={inputClass} />
                  </div>
                </div>

                {error && <div className="flex items-center gap-2 text-seka-red text-xs bg-seka-red/10 p-3 rounded-lg mt-4"><AlertCircle className="w-4 h-4" />{error}</div>}

                <div className="flex gap-3 mt-6">
                  <button onClick={resetModal} className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-seka-darker text-seka-text-secondary' : 'bg-gray-100 text-gray-600'}`}>Annuler</button>
                  <button onClick={handleCreateObjective} disabled={saving} className="flex-1 py-3 rounded-xl bg-seka-green text-seka-darker font-semibold flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Créer'}
                  </button>
                </div>
              </>
            )}

            {/* Modal Versement */}
            {showModal === 'versement' && selectedObjective && (
              <>
                <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>Ajouter un versement</h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>{selectedObjective.name}</p>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Montant ({symbol}) *</label>
                    <input type="text" inputMode="numeric" value={displayPayment} onChange={e => setDisplayPayment(formatDisplayAmount(e.target.value))} placeholder="10.000" className={`${inputClass} text-xl font-bold text-center`} />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Date</label>
                    <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Note (optionnel)</label>
                    <input type="text" value={paymentNote} onChange={e => setPaymentNote(e.target.value)} placeholder="Ex: Tontine décembre" className={inputClass} />
                  </div>
                </div>

                {error && <div className="flex items-center gap-2 text-seka-red text-xs bg-seka-red/10 p-3 rounded-lg mt-4"><AlertCircle className="w-4 h-4" />{error}</div>}

                <div className="flex gap-3 mt-6">
                  <button onClick={resetModal} className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-seka-darker text-seka-text-secondary' : 'bg-gray-100 text-gray-600'}`}>Annuler</button>
                  <button onClick={handleAddDeposit} disabled={saving} className="flex-1 py-3 rounded-xl bg-seka-green text-seka-darker font-semibold flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ajouter'}
                  </button>
                </div>
              </>
            )}

            {/* Modal Nouveau Prêt */}
            {showModal === 'new-loan' && (
              <>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>Nouveau prêt</h3>

                <div className="space-y-4">
                  <div className={`flex gap-2 p-1 rounded-xl ${isDark ? 'bg-seka-darker' : 'bg-gray-100'}`}>
                    <button type="button" onClick={() => setLoanType('lent')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${loanType === 'lent' ? 'bg-seka-green text-seka-darker' : ''}`}>
                      J'ai prêté
                    </button>
                    <button type="button" onClick={() => setLoanType('borrowed')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${loanType === 'borrowed' ? 'bg-seka-gold text-seka-darker' : ''}`}>
                      J'ai emprunté
                    </button>
                  </div>

                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Nom du contact *</label>
                    <input type="text" value={loanContactName} onChange={e => setLoanContactName(e.target.value)} placeholder="Ex: Jean Dupont" className={inputClass} />
                  </div>

                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Téléphone (optionnel)</label>
                    <input type="tel" value={loanContactPhone} onChange={e => setLoanContactPhone(e.target.value)} placeholder="+229 XX XX XX XX" className={inputClass} />
                  </div>

                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Montant ({symbol}) *</label>
                    <input type="text" inputMode="numeric" value={displayLoanAmount} onChange={e => setDisplayLoanAmount(formatDisplayAmount(e.target.value))} placeholder="50.000" className={`${inputClass} text-lg font-bold text-center`} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Date du prêt</label>
                      <input type="date" value={loanDate} onChange={e => setLoanDate(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Échéance</label>
                      <input type="date" value={loanDueDate} onChange={e => setLoanDueDate(e.target.value)} className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Note (optionnel)</label>
                    <input type="text" value={loanNote} onChange={e => setLoanNote(e.target.value)} placeholder="Ex: Pour les frais de scolarité" className={inputClass} />
                  </div>
                </div>

                {error && <div className="flex items-center gap-2 text-seka-red text-xs bg-seka-red/10 p-3 rounded-lg mt-4"><AlertCircle className="w-4 h-4" />{error}</div>}

                <div className="flex gap-3 mt-6">
                  <button onClick={resetModal} className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-seka-darker text-seka-text-secondary' : 'bg-gray-100 text-gray-600'}`}>Annuler</button>
                  <button onClick={handleCreateLoan} disabled={saving} className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${loanType === 'lent' ? 'bg-seka-green text-seka-darker' : 'bg-seka-gold text-seka-darker'}`}>
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Créer'}
                  </button>
                </div>
              </>
            )}

            {/* Modal Remboursement */}
            {showModal === 'repay-loan' && selectedLoan && (
              <>
                <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                  {selectedLoan.type === 'lent' ? 'Encaisser' : 'Rembourser'}
                </h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                  {selectedLoan.contact_name} • Reste: {formatMoney(selectedLoan.amount_remaining)}
                </p>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Montant *</label>
                    <input type="text" inputMode="numeric" value={displayRepayAmount} onChange={e => setDisplayRepayAmount(formatDisplayAmount(e.target.value))} placeholder="10.000" className={`${inputClass} text-xl font-bold text-center`} />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Date</label>
                    <input type="date" value={repayDate} onChange={e => setRepayDate(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Note (optionnel)</label>
                    <input type="text" value={repayNote} onChange={e => setRepayNote(e.target.value)} placeholder="Ex: Remboursement partiel" className={inputClass} />
                  </div>
                </div>

                {error && <div className="flex items-center gap-2 text-seka-red text-xs bg-seka-red/10 p-3 rounded-lg mt-4"><AlertCircle className="w-4 h-4" />{error}</div>}

                <div className="flex gap-3 mt-6">
                  <button onClick={resetModal} className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-seka-darker text-seka-text-secondary' : 'bg-gray-100 text-gray-600'}`}>Annuler</button>
                  <button onClick={handleRepayLoan} disabled={saving} className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${selectedLoan.type === 'lent' ? 'bg-seka-green text-seka-darker' : 'bg-seka-gold text-seka-darker'}`}>
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmer'}
                  </button>
                </div>
              </>
            )}

            {/* Modal Nouvel Investissement */}
            {showModal === 'new-investment' && (
              <>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>Nouvel investissement</h3>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Nom *</label>
                    <input type="text" value={investName} onChange={e => setInvestName(e.target.value)} placeholder="Ex: Tontine famille, Bitcoin..." className={inputClass} />
                  </div>

                  <div>
                    <label className={`block text-xs mb-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Type / Icône</label>
                    <div className="grid grid-cols-4 gap-2">
                      {INVEST_ICONS.map(t => (
                        <button key={t.key} type="button" onClick={() => setInvestType(t.key)} className={`p-2 rounded-lg text-center ${investType === t.key ? 'bg-purple-500/20 ring-2 ring-purple-500' : isDark ? 'bg-seka-darker' : 'bg-gray-100'}`}>
                          <span className="text-xl block">{t.emoji}</span>
                          <span className={`text-[9px] block mt-0.5 ${investType === t.key ? 'text-purple-500' : isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Montant ({symbol}) *</label>
                    <input type="text" inputMode="numeric" value={displayInvestAmount} onChange={e => setDisplayInvestAmount(formatDisplayAmount(e.target.value))} placeholder="100.000" className={`${inputClass} text-lg font-bold text-center`} />
                  </div>

                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Date</label>
                    <input type="date" value={investDate} onChange={e => setInvestDate(e.target.value)} className={inputClass} />
                  </div>

                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Note (optionnel)</label>
                    <input type="text" value={investNote} onChange={e => setInvestNote(e.target.value)} placeholder="Ex: Contribution mensuelle" className={inputClass} />
                  </div>
                </div>

                {error && <div className="flex items-center gap-2 text-seka-red text-xs bg-seka-red/10 p-3 rounded-lg mt-4"><AlertCircle className="w-4 h-4" />{error}</div>}

                <div className="flex gap-3 mt-6">
                  <button onClick={resetModal} className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-seka-darker text-seka-text-secondary' : 'bg-gray-100 text-gray-600'}`}>Annuler</button>
                  <button onClick={handleCreateInvestment} disabled={saving} className="flex-1 py-3 rounded-xl bg-purple-500 text-white font-semibold flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Créer'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Composant LoanCard
function LoanCard({ loan, isDark, isLent, isExpanded, onToggle, payments, loadingPayments, onRepay, formatMoney }) {
  const remaining = loan.amount_remaining || 0
  const total = loan.amount || 0
  const paid = total - remaining
  const pct = total > 0 ? (paid / total) * 100 : 0
  const color = isLent ? '#10B981' : '#F59E0B'

  return (
    <div className={`rounded-xl border-l-4 overflow-hidden ${isDark ? 'bg-seka-card/50 border-y border-r border-seka-border' : 'bg-white shadow-sm'}`} style={{ borderLeftColor: color }}>
      <button
        onClick={onToggle}
        className={`w-full p-4 text-left ${isDark ? 'hover:bg-seka-darker/30' : 'hover:bg-gray-50'} transition-colors`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>{loan.contact_name}</p>
              {isExpanded ? (
                <ChevronUp className={`w-4 h-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
              ) : (
                <ChevronDown className={`w-4 h-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
              )}
            </div>
            {loan.contact_phone && (
              <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                <Phone className="w-3 h-3" /> {loan.contact_phone}
              </p>
            )}
          </div>
          {loan.status === 'paid' && (
            <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-seka-green/20 text-seka-green flex items-center gap-1">
              <Check className="w-3 h-3" /> Soldé
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm mb-2">
          <span className={isDark ? 'text-seka-text-muted' : 'text-gray-500'}>
            Reste: <span style={{ color }} className="font-semibold">{formatMoney(remaining)}</span>
          </span>
          <span className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
            {formatMoney(paid)} / {formatMoney(total)}
          </span>
        </div>

        <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-seka-darker' : 'bg-gray-200'}`}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      </button>

      {isExpanded && (
        <div className={`px-4 pb-4 border-t ${isDark ? 'border-seka-border' : 'border-gray-100'}`}>
          <div className={`py-3 space-y-2 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
            {loan.note && (
              <p className="text-xs italic">📝 {loan.note}</p>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Créé le {new Date(loan.date).toLocaleDateString('fr-FR')}
              </span>
              {loan.due_date && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Échéance: {new Date(loan.due_date).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          </div>

          <div className={`p-3 rounded-lg ${isDark ? 'bg-seka-darker' : 'bg-gray-50'}`}>
            <p className={`text-xs font-medium mb-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
              📋 Historique des {isLent ? 'encaissements' : 'remboursements'}
            </p>

            {loadingPayments ? (
              <div className="flex justify-center py-2">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color }} />
              </div>
            ) : payments.length === 0 ? (
              <p className={`text-xs text-center py-2 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`}>
                Aucun {isLent ? 'encaissement' : 'remboursement'} enregistré
              </p>
            ) : (
              <div className="space-y-2">
                {payments.map(p => (
                  <div key={p.id} className={`flex justify-between items-center text-xs p-2 rounded-lg ${isDark ? 'bg-seka-card/50' : 'bg-white'}`}>
                    <div>
                      <span className={isDark ? 'text-seka-text-muted' : 'text-gray-500'}>
                        {new Date(p.date).toLocaleDateString('fr-FR')}
                      </span>
                      {p.note && (
                        <span className={`ml-2 italic ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`}>
                          • {p.note}
                        </span>
                      )}
                    </div>
                    <span className="font-medium" style={{ color }}>
                      +{formatMoney(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {remaining > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onRepay(); }}
              className="w-full mt-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              style={{ backgroundColor: color + '20', color }}
            >
              <Plus className="w-4 h-4" />
              {isLent ? 'Encaisser un paiement' : 'Enregistrer un remboursement'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
