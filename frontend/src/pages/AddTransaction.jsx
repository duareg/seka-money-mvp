import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Loader2, RefreshCw, ChevronDown } from 'lucide-react'
import { transactionsApi, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/api'
import { useTheme } from '../App'
import { useCurrency } from '../currency'

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Espèces', emoji: '💵' },
  { key: 'mobile_money', label: 'Mobile Money', emoji: '📱' },
  { key: 'card', label: 'Carte', emoji: '💳' },
  { key: 'bank', label: 'Banque', emoji: '🏦' },
]

const RECURRENCE_OPTIONS = [
  { key: 'none', label: 'Une seule fois' },
  { key: 'weekly', label: 'Chaque semaine' },
  { key: 'monthly', label: 'Chaque mois' },
  { key: 'yearly', label: 'Chaque année' },
]

// ============================================
// COMPOSANT WHEEL PICKER PREMIUM
// ============================================
function WheelPicker({ options, value, onChange, onClose, isDark }) {
  const containerRef = useRef(null)
  const [selectedIndex, setSelectedIndex] = useState(
    options.findIndex(o => o.key === value) || 0
  )
  const [startY, setStartY] = useState(null)
  const [currentY, setCurrentY] = useState(null)
  const [scrollOffset, setScrollOffset] = useState(0)
  
  const ITEM_HEIGHT = 50
  const VISIBLE_ITEMS = 5
  const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2)

  useEffect(() => {
    const idx = options.findIndex(o => o.key === value)
    setSelectedIndex(idx >= 0 ? idx : 0)
    setScrollOffset(0)
  }, [value, options])

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY)
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchMove = (e) => {
    if (startY === null) return
    const y = e.touches[0].clientY
    setCurrentY(y)
    const diff = y - startY
    setScrollOffset(diff)
  }

  const handleTouchEnd = () => {
    if (startY === null) return
    const itemsScrolled = Math.round(-scrollOffset / ITEM_HEIGHT)
    let newIndex = selectedIndex + itemsScrolled
    newIndex = Math.max(0, Math.min(options.length - 1, newIndex))
    setSelectedIndex(newIndex)
    setScrollOffset(0)
    setStartY(null)
    setCurrentY(null)
  }

  const handleConfirm = () => {
    onChange(options[selectedIndex].key)
    onClose()
  }

  const getItemStyle = (index) => {
    const baseOffset = (index - selectedIndex) * ITEM_HEIGHT
    const currentOffset = baseOffset - scrollOffset
    const normalizedOffset = currentOffset / ITEM_HEIGHT
    const scale = Math.max(0.7, 1 - Math.abs(normalizedOffset) * 0.15)
    const opacity = Math.max(0.3, 1 - Math.abs(normalizedOffset) * 0.3)
    const rotateX = normalizedOffset * 20
    
    return {
      transform: `translateY(${currentOffset}px) scale(${scale}) rotateX(${rotateX}deg)`,
      opacity,
      transition: startY ? 'none' : 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className={`w-full max-w-md rounded-t-3xl overflow-hidden ${isDark ? 'bg-seka-card' : 'bg-white'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-seka-border' : 'border-gray-200'}`}>
          <button 
            onClick={onClose}
            className={`text-sm font-medium ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}
          >
            Annuler
          </button>
          <span className={`font-semibold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
            Fréquence
          </span>
          <button 
            onClick={handleConfirm}
            className="text-sm font-semibold text-seka-green"
          >
            Confirmer
          </button>
        </div>

        {/* Wheel Container */}
        <div 
          ref={containerRef}
          className="relative overflow-hidden"
          style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Highlight bar */}
          <div 
            className={`absolute left-4 right-4 rounded-xl pointer-events-none ${isDark ? 'bg-seka-green/10' : 'bg-green-50'}`}
            style={{ 
              top: ITEM_HEIGHT * CENTER_INDEX,
              height: ITEM_HEIGHT,
            }}
          />
          
          {/* Gradient overlays */}
          <div 
            className="absolute top-0 left-0 right-0 pointer-events-none z-10"
            style={{ 
              height: ITEM_HEIGHT * 1.5,
              background: isDark 
                ? 'linear-gradient(to bottom, #1E1E2E 0%, transparent 100%)' 
                : 'linear-gradient(to bottom, white 0%, transparent 100%)'
            }}
          />
          <div 
            className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
            style={{ 
              height: ITEM_HEIGHT * 1.5,
              background: isDark 
                ? 'linear-gradient(to top, #1E1E2E 0%, transparent 100%)' 
                : 'linear-gradient(to top, white 0%, transparent 100%)'
            }}
          />

          {/* Items */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ 
              perspective: '1000px',
              transformStyle: 'preserve-3d',
            }}
          >
            {options.map((option, index) => (
              <div
                key={option.key}
                className={`absolute w-full text-center font-medium ${
                  index === selectedIndex 
                    ? 'text-seka-green' 
                    : isDark ? 'text-seka-text-muted' : 'text-gray-400'
                }`}
                style={{
                  ...getItemStyle(index),
                  height: ITEM_HEIGHT,
                  lineHeight: `${ITEM_HEIGHT}px`,
                  fontSize: index === selectedIndex ? '18px' : '16px',
                  top: `${ITEM_HEIGHT * CENTER_INDEX}px`,
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  )
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function AddTransaction() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { symbol, formatMoney, supportsDecimals } = useCurrency()
  const [searchParams] = useSearchParams()
  const { id } = useParams()
  const initialType = searchParams.get('type') || 'expense'

  const [type, setType] = useState(initialType)
  const [displayAmount, setDisplayAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [recurrence, setRecurrence] = useState('none')
  const [showRecurrencePicker, setShowRecurrencePicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState('')

  const isEditMode = !!id

  // Formater le montant selon la devise
  const formatDisplayAmount = (value) => {
    if (!value) return ''
    
    if (supportsDecimals) {
      // Pour EUR/USD : permet les décimales (virgule ou point)
      // Garde les chiffres, virgules et points
      let cleaned = value.replace(/[^\d,\.]/g, '')
      
      // Remplacer le point par virgule pour uniformiser (format français)
      cleaned = cleaned.replace('.', ',')
      
      // S'assurer qu'il n'y a qu'une seule virgule
      const parts = cleaned.split(',')
      if (parts.length > 2) {
        cleaned = parts[0] + ',' + parts.slice(1).join('')
      }
      
      // Limiter à 2 décimales
      if (parts.length === 2 && parts[1].length > 2) {
        cleaned = parts[0] + ',' + parts[1].substring(0, 2)
      }
      
      // Formater la partie entière avec espaces
      if (parts[0]) {
        const intPart = parseInt(parts[0].replace(/\s/g, '')) || 0
        const formattedInt = intPart.toLocaleString('fr-FR')
        cleaned = formattedInt + (parts.length > 1 ? ',' + parts[1] : '')
      }
      
      return cleaned
    } else {
      // Pour FCFA/NGN/GHS : seulement des entiers
      const num = parseInt(value.replace(/\D/g, '')) || 0
      if (num === 0) return ''
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    }
  }

  // Parser le montant pour l'API
  const parseDisplayAmount = (displayValue) => {
    if (!displayValue) return 0
    
    if (supportsDecimals) {
      // Pour EUR/USD : parser avec décimales
      const cleaned = displayValue.replace(/\s/g, '').replace(',', '.')
      return parseFloat(cleaned) || 0
    } else {
      // Pour FCFA/NGN/GHS : entier seulement
      return parseInt(displayValue.replace(/\D/g, '')) || 0
    }
  }

  useEffect(() => {
    if (isEditMode) {
      loadTransaction()
    }
  }, [id])

  const loadTransaction = async () => {
    setLoadingData(true)
    try {
      const transaction = await transactionsApi.getById(id)
      if (transaction) {
        setType(transaction.type)
        setDisplayAmount(formatDisplayAmount(transaction.amount.toString()))
        setCategory(transaction.category)
        setDescription(transaction.description || '')
        setPaymentMethod(transaction.payment_method || 'cash')
        setDate(transaction.date)
        setRecurrence(transaction.recurrence || 'none')
      }
    } catch (e) {
      console.error('Erreur chargement transaction:', e)
      setError('Transaction introuvable')
    } finally {
      setLoadingData(false)
    }
  }

  const handleAmountChange = (e) => {
    const formatted = formatDisplayAmount(e.target.value)
    setDisplayAmount(formatted)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const amount = parseDisplayAmount(displayAmount)
    if (!amount || amount <= 0) return setError('Montant invalide')
    if (!category) return setError('Sélectionnez une catégorie')

    setLoading(true)
    setError('')

    try {
      const transactionData = {
        type,
        amount,
        category,
        description: description || null,
        payment_method: paymentMethod,
        date,
        
      }

      if (isEditMode) {
        await transactionsApi.update(id, transactionData)
      } else {
        await transactionsApi.create(transactionData)
      }
      isEditMode ? navigate('/transactions') : navigate('/')
    } catch (e) {
      console.error('Erreur:', e)
      setError('Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
  const selectedRecurrence = RECURRENCE_OPTIONS.find(r => r.key === recurrence)

  if (loadingData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-seka-dark' : 'bg-gray-50'}`}>
        <Loader2 className="w-8 h-8 text-seka-green animate-spin" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen pb-8 ${isDark ? 'bg-seka-dark' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-4 py-4 ${isDark ? 'bg-seka-dark/95 border-seka-border' : 'bg-white/95 border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => isEditMode ? navigate('/transactions') : isEditMode ? navigate('/transactions') : navigate('/')} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}>
            <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-800'}`} />
          </button>
          <h1 className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
            {isEditMode ? 'Modifier' : type === 'expense' ? 'Nouvelle dépense' : 'Nouveau revenu'}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 pt-6 space-y-6">
        {/* Type Toggle */}
        <div className={`p-1 rounded-xl ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}>
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(''); setRecurrence('none'); }}
              className={`py-3 rounded-lg font-medium transition-all ${type === 'expense' ? 'bg-seka-red text-white' : isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}
            >
              Dépense
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(''); }}
              className={`py-3 rounded-lg font-medium transition-all ${type === 'income' ? 'bg-seka-green text-seka-darker' : isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}
            >
              Revenu
            </button>
          </div>
        </div>

        {/* Montant */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
            Montant ({symbol})
          </label>
          <input
            type="text"
            inputMode={supportsDecimals ? "decimal" : "numeric"}
            value={displayAmount}
            onChange={handleAmountChange}
            placeholder={supportsDecimals ? "0,00" : "0"}
            className={`w-full px-4 py-5 rounded-xl border text-center text-3xl font-bold ${isDark ? 'bg-seka-darker border-seka-border text-seka-text placeholder:text-seka-text-muted' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-300'} focus:outline-none focus:border-seka-green`}
          />
          {displayAmount && (
            <p className={`text-center mt-2 text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
              {formatMoney(parseDisplayAmount(displayAmount))}
            </p>
          )}
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

        {/* Récurrence avec Wheel Picker (uniquement pour les revenus) */}
        {type === 'income' && (
          <div>
            <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
              <RefreshCw className="w-4 h-4" />
              Fréquence du revenu
            </label>
            
            <button
              type="button"
              onClick={() => setShowRecurrencePicker(true)}
              className={`w-full px-4 py-4 rounded-xl border flex items-center justify-between transition-all ${
                recurrence !== 'none'
                  ? 'bg-seka-green/10 border-seka-green'
                  : isDark ? 'bg-seka-card border-seka-border' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  recurrence !== 'none' ? 'bg-seka-green/20' : isDark ? 'bg-seka-darker' : 'bg-gray-100'
                }`}>
                  <RefreshCw className={`w-5 h-5 ${recurrence !== 'none' ? 'text-seka-green' : isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                </div>
                <div className="text-left">
                  <p className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                    {selectedRecurrence?.label}
                  </p>
                  {recurrence !== 'none' && (
                    <p className={`text-xs ${isDark ? 'text-seka-green' : 'text-green-600'}`}>
                      Revenu récurrent activé
                    </p>
                  )}
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
            </button>

            {recurrence !== 'none' && (
              <p className={`text-xs mt-3 p-3 rounded-lg flex items-start gap-2 ${isDark ? 'bg-seka-green/10 text-seka-green' : 'bg-green-50 text-green-700'}`}>
                <span className="text-base">💡</span>
                <span>Ce revenu sera automatiquement ajouté {recurrence === 'weekly' ? 'chaque semaine' : recurrence === 'monthly' ? 'chaque mois' : 'chaque année'}</span>
              </p>
            )}
          </div>
        )}

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
          disabled={loading || !displayAmount || !category}
          className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 ${type === 'expense' ? 'bg-seka-red text-white' : 'bg-seka-green text-seka-darker'}`}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> {isEditMode ? 'Modifier' : 'Enregistrer'}</>}
        </button>
      </form>

      {/* Wheel Picker Modal */}
      {showRecurrencePicker && (
        <WheelPicker
          options={RECURRENCE_OPTIONS}
          value={recurrence}
          onChange={setRecurrence}
          onClose={() => setShowRecurrencePicker(false)}
          isDark={isDark}
        />
      )}
    </div>
  )
}
