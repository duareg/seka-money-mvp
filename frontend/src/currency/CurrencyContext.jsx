import { createContext, useContext, useState, useEffect } from 'react'

// ============================================
// CURRENCY CONTEXT - SEKA MONEY
// ============================================

const CurrencyContext = createContext()

// Clé localStorage pour persister la devise
const CURRENCY_KEY = 'seka_currency'

// Devise par défaut
const DEFAULT_CURRENCY = 'FCFA'

// Devises disponibles (ordre: FCFA, Naira, Cedis, Euro, Dollar)
// supportsDecimals: true = permet les centimes (EUR, USD)
export const AVAILABLE_CURRENCIES = [
  { code: 'FCFA', symbol: 'F', label: 'Franc CFA', labelShort: 'FCFA', position: 'after', supportsDecimals: false, locale: 'fr-FR' },
  { code: 'NGN', symbol: '₦', label: 'Naira', labelShort: 'NGN', position: 'before', supportsDecimals: false, locale: 'en-NG' },
  { code: 'GHS', symbol: '₵', label: 'Cedi', labelShort: 'GHS', position: 'before', supportsDecimals: false, locale: 'en-GH' },
  { code: 'EUR', symbol: '€', label: 'Euro', labelShort: 'EUR', position: 'after', supportsDecimals: true, locale: 'fr-FR' },
  { code: 'USD', symbol: '$', label: 'Dollar', labelShort: 'USD', position: 'before', supportsDecimals: true, locale: 'en-US' },
]

// ============================================
// CURRENCY PROVIDER
// ============================================

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CURRENCY_KEY)
      if (saved && AVAILABLE_CURRENCIES.find(c => c.code === saved)) {
        return saved
      }
    }
    return DEFAULT_CURRENCY
  })

  // Sauvegarder quand la devise change
  useEffect(() => {
    localStorage.setItem(CURRENCY_KEY, currency)
  }, [currency])

  // Fonction pour changer la devise
  const setCurrency = (code) => {
    if (AVAILABLE_CURRENCIES.find(c => c.code === code)) {
      setCurrencyState(code)
    } else {
      console.warn(`Currency "${code}" not available`)
    }
  }

  // Obtenir les infos de la devise actuelle
  const currentCurrency = AVAILABLE_CURRENCIES.find(c => c.code === currency) || AVAILABLE_CURRENCIES[0]

  // Formater un montant avec la devise actuelle
  const formatMoney = (amount) => {
    if (amount === null || amount === undefined) return '0 ' + currentCurrency.symbol
    
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    const absNum = Math.abs(num)
    
    let formatted
    if (currentCurrency.supportsDecimals) {
      // EUR et USD : avec décimales (1 850,70 € ou $1,850.70)
      formatted = absNum.toLocaleString(currentCurrency.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    } else {
      // FCFA, NGN, GHS : sans décimales (50 000 F)
      formatted = Math.round(absNum).toLocaleString(currentCurrency.locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
    }
    
    if (currentCurrency.position === 'before') {
      return `${currentCurrency.symbol}${formatted}`
    } else {
      return `${formatted} ${currentCurrency.symbol}`
    }
  }

  // Formater avec signe (pour les transactions)
  const formatMoneyWithSign = (amount, type) => {
    const formatted = formatMoney(Math.abs(amount))
    if (type === 'expense') {
      return `-${formatted}`
    } else if (type === 'income') {
      return `+${formatted}`
    }
    return formatted
  }

  // Parser un montant entré par l'utilisateur (gère les virgules et points)
  const parseAmount = (input) => {
    if (!input) return 0
    // Remplacer les virgules par des points pour le parsing
    let cleaned = input.toString().replace(/\s/g, '')
    
    if (currentCurrency.supportsDecimals) {
      // Pour EUR/USD: convertir virgule en point décimal
      // 1.850,70 → 1850.70 ou 1,850.70 → 1850.70
      if (cleaned.includes(',') && cleaned.includes('.')) {
        // Format européen 1.850,70
        if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
          cleaned = cleaned.replace(/\./g, '').replace(',', '.')
        } else {
          // Format US 1,850.70
          cleaned = cleaned.replace(/,/g, '')
        }
      } else if (cleaned.includes(',')) {
        // Juste virgule: soit séparateur milliers soit décimal
        const parts = cleaned.split(',')
        if (parts.length === 2 && parts[1].length <= 2) {
          // Décimal (1850,70)
          cleaned = cleaned.replace(',', '.')
        } else {
          // Séparateur milliers (1,850)
          cleaned = cleaned.replace(/,/g, '')
        }
      }
      return parseFloat(cleaned) || 0
    } else {
      // Pour FCFA/NGN/GHS: enlever tout sauf chiffres
      return parseInt(cleaned.replace(/\D/g, '')) || 0
    }
  }

  const value = {
    currency,
    setCurrency,
    currentCurrency,
    formatMoney,
    formatMoneyWithSign,
    parseAmount,
    availableCurrencies: AVAILABLE_CURRENCIES,
    symbol: currentCurrency.symbol,
    supportsDecimals: currentCurrency.supportsDecimals,
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

// ============================================
// HOOK useCurrency
// ============================================

export function useCurrency() {
  const context = useContext(CurrencyContext)
  
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }

  return context
}

export default CurrencyContext
