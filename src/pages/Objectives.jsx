import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Target,
  Users,
  TrendingUp,
  X,
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react'
import { useTheme } from '../App'
import api, { formatMoney, objectivesApi, DEMO_LOANS, DEMO_INVESTMENTS } from '../utils/api'

export default function Objectives() {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const [tab, setTab] = useState('epargne')
  const [objectives, setObjectives] = useState([])
  const [loans, setLoans] = useState(DEMO_LOANS)
  const [investments, setInvestments] = useState(DEMO_INVESTMENTS)

  const [showModal, setShowModal] = useState(null) // 'details' | 'encaisser' | 'rembourser' | 'versement'
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [selectedObjective, setSelectedObjective] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentNote, setPaymentNote] = useState('')
  const [error, setError] = useState('')

  // ===== CHARGEMENT OBJECTIFS SUPABASE =====
  useEffect(() => {
    const loadObjectives = async () => {
      try {
        const data = await objectivesApi.getAll()
        setObjectives(data || [])
      } catch (e) {
        console.error('Erreur chargement objectifs:', e)
        setObjectives([])
      }
    }
    loadObjectives()
  }, [])

  const totalSaved = objectives.reduce((s, o) => s + (o.saved || 0), 0)
  const lentTotal = loans.filter(l => l.type === 'lent').reduce((s, l) => s + (l.amount - l.paid), 0)
  const borrowedTotal = loans.filter(l => l.type === 'borrowed').reduce((s, l) => s + (l.amount - l.paid), 0)
  const investTotal = investments.reduce((s, i) => s + i.amount, 0)

  // ===== HELPERS MODALS =====
  const resetModal = () => {
    setShowModal(null)
    setSelectedLoan(null)
    setSelectedObjective(null)
    setPaymentAmount('')
    setPaymentDate(new Date().toISOString().split('T')[0])
    setPaymentNote('')
    setError('')
  }

  const handlePayment = () => {
    if (!paymentAmount || parseInt(paymentAmount) <= 0) {
      setError('Montant invalide')
      return
    }
    if (!paymentDate) {
      setError('Date requise')
      return
    }
    const amount = parseInt(paymentAmount)
    const rest = selectedLoan.amount - selectedLoan.paid
    if (amount > rest) {
      setError(`Max: ${formatMoney(rest)}`)
      return
    }

    setLoans(prev =>
      prev.map(l =>
        l.id === selectedLoan.id
          ? {
            ...l,
            paid: l.paid + amount,
            payments: [...l.payments, { date: paymentDate, amount, note: paymentNote }]
          }
          : l
      )
    )
    resetModal()
  }

  const handleAddToObjective = async () => {
    if (!paymentAmount || parseInt(paymentAmount) <= 0) {
      setError('Montant invalide')
      return
    }
    const amount = parseInt(paymentAmount)
    const newSaved = Math.min((selectedObjective.saved || 0) + amount, selectedObjective.target)

    try {
      const updated = await objectivesApi.update(selectedObjective.id, { saved: newSaved })
      setObjectives(prev => prev.map(o => (o.id === selectedObjective.id ? updated : o)))
      resetModal()
    } catch (e) {
      console.error('Erreur update objective:', e)
      setError("Erreur lors de la mise à jour de l'objectif")
    }
  }

  // ===== RENDER =====
  return (
    <div className={`min-h-screen pb-24 ${isDark ? 'bg-seka-dark' : 'bg-gray-50'}`}>
      {/* HEADER */}
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
            <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-800'}`} />
          </button>
          <h1 className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
            Objectifs
          </h1>
        </div>
      </header>

      {/* TABS */}
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
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 ${tab === t.key
                  ? 'bg-seka-green text-seka-darker'
                  : isDark
                    ? 'text-seka-text-secondary'
                    : 'text-gray-600'
                }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* ===== TAB ÉPARGNE ===== */}
        {tab === 'epargne' && (
          <>
            <div
              className={`p-4 flex items-center justify-between rounded-xl ${isDark
                  ? 'bg-seka-card/50 border border-seka-border'
                  : 'bg-white shadow-sm border border-gray-100'
                }`}
            >
              <div>
                <p
                  className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                    }`}
                >
                  Total épargné
                </p>
                <p className="text-xl font-bold text-seka-green font-mono">
                  {formatMoney(totalSaved)}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                    }`}
                >
                  Objectifs
                </p>
                <p
                  className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'
                    }`}
                >
                  {objectives.length}
                </p>
              </div>
            </div>

            {objectives.length === 0 && (
              <div
                className={`p-4 rounded-xl flex items-center gap-2 ${isDark
                    ? 'bg-seka-card/50 border border-seka-border'
                    : 'bg-white shadow-sm border border-gray-100'
                  }`}
              >
                <AlertCircle
                  className={`w-4 h-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'
                    }`}
                />
                <p
                  className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                    }`}
                >
                  Aucun objectif pour l’instant. Tu peux en créer dans Supabase (table
                  <span className="font-mono"> objectives</span>) ou plus tard via une interface.
                </p>
              </div>
            )}

            {objectives.map(obj => {
              const saved = obj.saved || 0
              const pct = obj.target > 0 ? (saved / obj.target) * 100 : 0
              return (
                <div
                  key={obj.id}
                  className={`p-4 rounded-xl ${isDark
                      ? 'bg-seka-card/50 border border-seka-border'
                      : 'bg-white shadow-sm border border-gray-100'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p
                      className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'
                        }`}
                    >
                      {obj.name}
                    </p>
                    <span
                      className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                        }`}
                    >
                      {obj.deadline}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-seka-green font-mono">
                      {formatMoney(saved)}
                    </span>
                    <span
                      className={isDark ? 'text-seka-text-muted' : 'text-gray-500'}
                    >
                      sur {formatMoney(obj.target)}
                    </span>
                  </div>

                  <div
                    className={`h-2.5 rounded-full overflow-hidden mb-2 ${isDark ? 'bg-seka-darker' : 'bg-gray-200'
                      }`}
                  >
                    <div
                      className="h-full rounded-full bg-seka-green"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${isDark ? 'text-seka-text' : 'text-gray-900'
                        }`}
                    >
                      {Math.round(pct)}%
                    </span>
                    {pct < 100 && (
                      <button
                        onClick={() => {
                          setSelectedObjective(obj)
                          setShowModal('versement')
                        }}
                        className="text-xs text-seka-green bg-seka-green/10 px-3 py-1 rounded-lg"
                      >
                        + Ajouter
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            <button
              className={`w-full p-4 flex items-center justify-center gap-2 text-seka-green rounded-xl ${isDark
                  ? 'bg-seka-card/50 border border-seka-border'
                  : 'bg-white shadow-sm border border-gray-100'
                }`}
            >
              <Plus className="w-5 h-5" />
              Nouvel objectif (à venir)
            </button>
          </>
        )}

        {/* ===== TAB PRÊTS ===== */}
        {tab === 'prets' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-xl p-4"
                style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
              >
                <p className="text-white/80 text-xs mb-1">🤝 Ils me doivent</p>
                <p className="text-xl font-bold text-white font-mono">
                  {formatMoney(lentTotal)}
                </p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}
              >
                <p className="text-white/80 text-xs mb-1">💸 Je dois</p>
                <p className="text-xl font-bold text-white font-mono">
                  {formatMoney(borrowedTotal)}
                </p>
              </div>
            </div>

            <h3
              className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-seka-text' : 'text-gray-900'
                }`}
            >
              <span className="w-6 h-6 rounded-full bg-seka-green/20 flex items-center justify-center text-xs">
                🤝
              </span>
              Ils me doivent
            </h3>

            {loans
              .filter(l => l.type === 'lent')
              .map(loan => {
                const rest = loan.amount - loan.paid
                const pct = (loan.paid / loan.amount) * 100
                return (
                  <div
                    key={loan.id}
                    className={`p-4 border-l-4 border-seka-green rounded-xl ${isDark
                        ? 'bg-seka-card/50 border-y border-r border-seka-border'
                        : 'bg-white shadow-sm'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p
                          className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'
                            }`}
                        >
                          {loan.person}
                        </p>
                        <p
                          className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                            }`}
                        >
                          {loan.note}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedLoan(loan)
                          setShowModal('details')
                        }}
                        className="text-xs text-seka-green"
                      >
                        Détails →
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-2">
                      <span
                        className={isDark ? 'text-seka-text-muted' : 'text-gray-500'}
                      >
                        Reste:{' '}
                        <span className="text-seka-green font-mono">
                          {formatMoney(rest)}
                        </span>
                      </span>
                      <span
                        className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                          }`}
                      >
                        {formatMoney(loan.paid)} / {formatMoney(loan.amount)}
                      </span>
                    </div>

                    <div
                      className={`h-1.5 rounded-full overflow-hidden mb-2 ${isDark ? 'bg-seka-darker' : 'bg-gray-200'
                        }`}
                    >
                      <div
                        className="h-full bg-seka-green rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {rest > 0 && (
                      <button
                        onClick={() => {
                          setSelectedLoan(loan)
                          setShowModal('encaisser')
                        }}
                        className="w-full py-2 rounded-lg bg-seka-green/15 text-seka-green text-xs font-medium"
                      >
                        Encaisser
                      </button>
                    )}
                  </div>
                )
              })}

            <h3
              className={`text-sm font-medium flex items-center gap-2 mt-4 ${isDark ? 'text-seka-text' : 'text-gray-900'
                }`}
            >
              <span className="w-6 h-6 rounded-full bg-seka-gold/20 flex items-center justify-center text-xs">
                💸
              </span>
              Je dois
            </h3>

            {loans
              .filter(l => l.type === 'borrowed')
              .map(loan => {
                const rest = loan.amount - loan.paid
                const pct = (loan.paid / loan.amount) * 100
                return (
                  <div
                    key={loan.id}
                    className={`p-4 border-l-4 border-seka-gold rounded-xl ${isDark
                        ? 'bg-seka-card/50 border-y border-r border-seka-border'
                        : 'bg-white shadow-sm'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p
                          className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'
                            }`}
                        >
                          {loan.person}
                        </p>
                        <p
                          className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                            }`}
                        >
                          {loan.note}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedLoan(loan)
                          setShowModal('details')
                        }}
                        className="text-xs text-seka-gold"
                      >
                        Détails →
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-2">
                      <span
                        className={isDark ? 'text-seka-text-muted' : 'text-gray-500'}
                      >
                        Reste:{' '}
                        <span className="text-seka-red font-mono">
                          {formatMoney(rest)}
                        </span>
                      </span>
                      <span
                        className={`text-[10px] ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                          }`}
                      >
                        {formatMoney(loan.paid)} / {formatMoney(loan.amount)}
                      </span>
                    </div>

                    <div
                      className={`h-1.5 rounded-full overflow-hidden mb-2 ${isDark ? 'bg-seka-darker' : 'bg-gray-200'
                        }`}
                    >
                      <div
                        className="h-full bg-seka-gold rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {rest > 0 && (
                      <button
                        onClick={() => {
                          setSelectedLoan(loan)
                          setShowModal('rembourser')
                        }}
                        className="w-full py-2 rounded-lg bg-seka-gold/15 text-seka-gold text-xs font-medium"
                      >
                        Rembourser
                      </button>
                    )}
                  </div>
                )
              })}

            <button
              className={`w-full p-4 flex items-center justify-center gap-2 rounded-xl ${isDark
                  ? 'bg-seka-card/50 border border-seka-border text-seka-text-secondary'
                  : 'bg-white shadow-sm border border-gray-100 text-gray-600'
                }`}
            >
              <Plus className="w-5 h-5" />
              Nouveau prêt (démo)
            </button>
          </>
        )}

        {/* ===== TAB INVEST ===== */}
        {tab === 'invest' && (
          <>
            <div
              className={`p-4 rounded-xl ${isDark
                  ? 'bg-seka-card/50 border border-seka-border'
                  : 'bg-white shadow-sm border border-gray-100'
                }`}
            >
              <p
                className={`text-xs mb-1 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                  }`}
              >
                Total investi
              </p>
              <p className="text-xl font-bold text-seka-gold font-mono">
                {formatMoney(investTotal)}
              </p>
            </div>

            {investments.map(inv => (
              <div
                key={inv.id}
                className={`p-4 flex items-center gap-3 rounded-xl ${isDark
                    ? 'bg-seka-card/50 border border-seka-border'
                    : 'bg-white shadow-sm border border-gray-100'
                  }`}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: inv.color }}
                >
                  {inv.category === 'actions'
                    ? '📈'
                    : inv.category === 'crypto'
                      ? '₿'
                      : '💰'}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'
                      }`}
                  >
                    {inv.name}
                  </p>
                  <p
                    className={`text-xs capitalize ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                      }`}
                  >
                    {inv.category}
                  </p>
                </div>
                <p className="text-seka-gold font-mono font-semibold">
                  {formatMoney(inv.amount)}
                </p>
              </div>
            ))}

            <button
              className={`w-full p-4 flex items-center justify-center gap-2 text-seka-gold rounded-xl ${isDark
                  ? 'bg-seka-card/50 border border-seka-border'
                  : 'bg-white shadow-sm border border-gray-100'
                }`}
            >
              <Plus className="w-5 h-5" />
              Nouvel investissement (démo)
            </button>
          </>
        )}
      </div>

      {/* ===== MODAL DÉTAILS PRÊT ===== */}
      {showModal === 'details' && selectedLoan && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={resetModal}
        >
          <div
            className={`rounded-t-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto ${isDark ? 'bg-seka-card' : 'bg-white'
              }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-lg font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'
                  }`}
              >
                {selectedLoan.person}
              </h3>
              <button onClick={resetModal}>
                <X
                  className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'
                    }`}
                />
              </button>
            </div>

            <div
              className={`space-y-2 mb-4 p-3 rounded-xl ${isDark ? 'bg-seka-darker' : 'bg-gray-100'
                }`}
            >
              <div className="flex justify-between text-sm">
                <span
                  className={
                    isDark ? 'text-seka-text-muted' : 'text-gray-500'
                  }
                >
                  Initial:
                </span>
                <span
                  className={`font-mono ${isDark ? 'text-seka-text' : 'text-gray-900'
                    }`}
                >
                  {formatMoney(selectedLoan.amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span
                  className={
                    isDark ? 'text-seka-text-muted' : 'text-gray-500'
                  }
                >
                  Payé:
                </span>
                <span className="text-seka-green font-mono">
                  {formatMoney(selectedLoan.paid)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span
                  className={
                    isDark ? 'text-seka-text-muted' : 'text-gray-500'
                  }
                >
                  Reste:
                </span>
                <span
                  className={`font-mono ${selectedLoan.type === 'lent'
                      ? 'text-seka-green'
                      : 'text-seka-red'
                    }`}
                >
                  {formatMoney(selectedLoan.amount - selectedLoan.paid)}
                </span>
              </div>
            </div>

            <h4
              className={`text-sm font-medium mb-2 ${isDark ? 'text-seka-text' : 'text-gray-900'
                }`}
            >
              Historique
            </h4>

            {selectedLoan.payments.length === 0 ? (
              <p
                className={`text-xs text-center py-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                  }`}
              >
                Aucun paiement
              </p>
            ) : (
              <div className="space-y-2">
                {selectedLoan.payments.map((p, i) => (
                  <div
                    key={i}
                    className={`flex justify-between py-2 px-3 rounded-lg ${isDark ? 'bg-seka-darker' : 'bg-gray-100'
                      }`}
                  >
                    <div>
                      <span
                        className={`text-xs ${isDark ? 'text-seka-text' : 'text-gray-700'
                          }`}
                      >
                        {p.date}
                      </span>
                      {p.note && (
                        <p
                          className={`text-[10px] ${isDark
                              ? 'text-seka-text-muted'
                              : 'text-gray-500'
                            }`}
                        >
                          {p.note}
                        </p>
                      )}
                    </div>
                    <span className="text-seka-green font-mono">
                      +{formatMoney(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {selectedLoan.amount - selectedLoan.paid > 0 && (
              <button
                onClick={() =>
                  setShowModal(
                    selectedLoan.type === 'lent' ? 'encaisser' : 'rembourser'
                  )
                }
                className={`w-full mt-4 py-3 rounded-xl font-semibold ${selectedLoan.type === 'lent'
                    ? 'bg-seka-green'
                    : 'bg-seka-gold'
                  } text-seka-darker`}
              >
                {selectedLoan.type === 'lent' ? 'Encaisser' : 'Rembourser'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===== MODAL PAIEMENT PRÊT ===== */}
      {(showModal === 'encaisser' || showModal === 'rembourser') &&
        selectedLoan && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={resetModal}
          >
            <div
              className={`rounded-2xl p-6 w-full max-w-sm ${isDark ? 'bg-seka-card' : 'bg-white'
                }`}
              onClick={e => e.stopPropagation()}
            >
              <h3
                className={`text-lg font-bold mb-1 ${isDark ? 'text-seka-text' : 'text-gray-900'
                  }`}
              >
                {showModal === 'encaisser' ? 'Encaisser' : 'Rembourser'}
              </h3>
              <p
                className={`text-sm mb-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                  }`}
              >
                {selectedLoan.person} • Reste:{' '}
                {formatMoney(selectedLoan.amount - selectedLoan.paid)}
              </p>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'
                      }`}
                  >
                    Montant *
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    placeholder="0"
                    className={`w-full px-4 py-3 rounded-xl border text-xl font-mono text-center ${isDark
                        ? 'bg-seka-darker border-seka-border text-seka-text'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs mb-1 flex items-center gap-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'
                      }`}
                  >
                    <Calendar className="w-3 h-3" />
                    Date *
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${isDark
                        ? 'bg-seka-darker border-seka-border text-seka-text'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs mb-1 flex items-center gap-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'
                      }`}
                  >
                    <FileText className="w-3 h-3" />
                    Note
                  </label>
                  <input
                    type="text"
                    value={paymentNote}
                    onChange={e => setPaymentNote(e.target.value)}
                    placeholder="Optionnel"
                    className={`w-full px-4 py-3 rounded-xl border ${isDark
                        ? 'bg-seka-darker border-seka-border text-seka-text placeholder:text-seka-text-muted'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                      }`}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-seka-red text-xs bg-seka-red/10 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={resetModal}
                  className={`flex-1 py-3 rounded-xl font-medium ${isDark
                      ? 'bg-seka-darker text-seka-text-secondary'
                      : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  Annuler
                </button>
                <button
                  onClick={handlePayment}
                  className={`flex-1 py-3 rounded-xl font-semibold ${showModal === 'encaisser'
                      ? 'bg-seka-green'
                      : 'bg-seka-gold'
                    } text-seka-darker`}
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ===== MODAL VERSEMENT ÉPARGNE ===== */}
      {showModal === 'versement' && selectedObjective && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={resetModal}
        >
          <div
            className={`rounded-2xl p-6 w-full max-w-sm ${isDark ? 'bg-seka-card' : 'bg-white'
              }`}
            onClick={e => e.stopPropagation()}
          >
            <h3
              className={`text-lg font-bold mb-1 ${isDark ? 'text-seka-text' : 'text-gray-900'
                }`}
            >
              Ajouter un versement
            </h3>
            <p
              className={`text-sm mb-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'
                }`}
            >
              {selectedObjective.name}
            </p>

            <div>
              <label
                className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'
                  }`}
              >
                Montant
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                placeholder="0"
                className={`w-full px-4 py-3 rounded-xl border text-xl font-mono text-center ${isDark
                    ? 'bg-seka-darker border-seka-border text-seka-text'
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-seka-red text-xs bg-seka-red/10 p-2 rounded-lg mt-4">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={resetModal}
                className={`flex-1 py-3 rounded-xl font-medium ${isDark
                    ? 'bg-seka-darker text-seka-text-secondary'
                    : 'bg-gray-100 text-gray-600'
                  }`}
              >
                Annuler
              </button>
              <button
                onClick={handleAddToObjective}
                className="flex-1 py-3 rounded-xl bg-seka-green text-seka-darker font-semibold"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}