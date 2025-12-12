import { useState } from 'react'
import { ChevronRight, Check, X, Coins } from 'lucide-react'
import { useCurrency, AVAILABLE_CURRENCIES } from '../currency'
import { useLanguage } from '../i18n'

export default function CurrencySelector({ isDark }) {
  const { currency, setCurrency } = useCurrency()
  const { t, language } = useLanguage()
  const [showModal, setShowModal] = useState(false)
  const [tempCurrency, setTempCurrency] = useState(currency)

  const currentCurrencyData = AVAILABLE_CURRENCIES.find(c => c.code === currency)

  const openModal = () => {
    setTempCurrency(currency)
    setShowModal(true)
  }

  const confirmCurrency = () => {
    setCurrency(tempCurrency)
    setShowModal(false)
  }

  const cancelModal = () => {
    setTempCurrency(currency)
    setShowModal(false)
  }

  return (
    <>
      {/* Bouton dans le menu Profile - style cohérent avec les autres MenuItem */}
      <button
        onClick={openModal}
        className={`w-full px-4 py-3.5 flex items-center gap-3 border-b last:border-b-0 ${isDark ? 'border-seka-border hover:bg-seka-darker/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
      >
        {/* Icône Coins comme les autres éléments du menu */}
        <span className={isDark ? 'text-seka-text-secondary' : 'text-gray-500'}>
          <Coins className="w-5 h-5" />
        </span>
        <span className={`flex-1 text-left text-sm font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
          {t('profile.currency') || 'Devise'}
        </span>
        <span className={`text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`}>
          {currentCurrencyData?.code} ({currentCurrencyData?.symbol})
        </span>
        <ChevronRight className={`w-4 h-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
      </button>

      {/* Modal de sélection */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={cancelModal}
        >
          <div
            className={`w-full max-w-sm rounded-2xl overflow-hidden ${isDark ? 'bg-seka-card' : 'bg-white'}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-seka-border' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-green/20' : 'bg-green-100'}`}>
                  <Coins className="w-5 h-5 text-seka-green" />
                </div>
                <h3 className={`font-semibold text-lg ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                  {t('profile.currency') || 'Devise'}
                </h3>
              </div>
              <button onClick={cancelModal} className={`p-2 rounded-xl ${isDark ? 'hover:bg-seka-darker' : 'hover:bg-gray-100'}`}>
                <X className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`} />
              </button>
            </div>

            {/* Liste des devises */}
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {AVAILABLE_CURRENCIES.map(curr => (
                <button
                  key={curr.code}
                  onClick={() => setTempCurrency(curr.code)}
                  className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 transition-all ${tempCurrency === curr.code
                      ? 'bg-seka-green text-seka-darker'
                      : isDark
                        ? 'bg-seka-darker text-seka-text hover:bg-seka-darker/70'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                >
                  {/* Icône circulaire avec symbole de la devise */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    tempCurrency === curr.code 
                      ? 'bg-seka-darker/20 text-seka-darker' 
                      : isDark 
                        ? 'bg-seka-card text-seka-green' 
                        : 'bg-white text-green-600'
                  }`}>
                    {curr.symbol}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{curr.code}</p>
                    <p className={`text-xs ${tempCurrency === curr.code ? 'text-seka-darker/70' : isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                      {curr.name}
                    </p>
                  </div>
                  {tempCurrency === curr.code && (
                    <div className="w-6 h-6 rounded-full bg-seka-darker/20 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className={`px-4 pb-4 pt-2 flex gap-3 border-t ${isDark ? 'border-seka-border' : 'border-gray-200'}`}>
              <button
                onClick={cancelModal}
                className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-100 text-gray-600'}`}
              >
                {t('app.cancel') || 'Annuler'}
              </button>
              <button
                onClick={confirmCurrency}
                className="flex-1 py-3 rounded-xl font-medium bg-seka-green text-seka-darker"
              >
                {t('app.confirm') || 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
