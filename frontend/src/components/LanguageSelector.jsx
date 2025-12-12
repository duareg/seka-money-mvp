import { useState } from 'react'
import { Globe, ChevronRight } from 'lucide-react'
import { useTranslation, AVAILABLE_LANGUAGES } from '../i18n'

// ============================================
// COMPOSANT LANGUAGE SELECTOR (pour Profile)
// Style aligné avec Thème et Devise
// ============================================

export default function LanguageSelector({ isDark }) {
  const { t, language, setLanguage } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const [tempLanguage, setTempLanguage] = useState(language)
  
  const currentLang = AVAILABLE_LANGUAGES.find(l => l.code === language)

  const handleOpen = () => {
    setTempLanguage(language)
    setShowModal(true)
  }

  const handleConfirm = () => {
    setLanguage(tempLanguage)
    setShowModal(false)
  }

  const handleCancel = () => {
    setTempLanguage(language)
    setShowModal(false)
  }

  return (
    <>
      {/* Bouton - Même style que Thème et Devise */}
      <button
        onClick={handleOpen}
        className={`w-full flex items-center justify-between py-3 ${
          isDark ? 'text-seka-text' : 'text-gray-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isDark ? 'bg-seka-darker' : 'bg-gray-100'
          }`}>
            <Globe className={`w-4 h-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`} />
          </div>
          <span className="font-medium">{t.profile.language}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
            {currentLang?.label}
          </span>
          <ChevronRight className={`w-4 h-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
        </div>
      </button>

      {/* Modal centré */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleCancel}
        >
          <div 
            className={`w-full max-w-sm rounded-2xl overflow-hidden ${
              isDark ? 'bg-seka-card' : 'bg-white'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-5 py-4 border-b text-center ${
              isDark ? 'border-seka-border' : 'border-gray-200'
            }`}>
              <h3 className={`font-semibold text-lg ${
                isDark ? 'text-seka-text' : 'text-gray-900'
              }`}>
                {t.languages.title}
              </h3>
            </div>

            {/* Options */}
            <div className="p-4 space-y-2">
              {AVAILABLE_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setTempLanguage(lang.code)}
                  className={`w-full py-4 px-4 rounded-xl text-center font-medium transition-all ${
                    tempLanguage === lang.code
                      ? 'bg-seka-green text-seka-darker'
                      : isDark 
                        ? 'bg-seka-darker text-seka-text hover:bg-seka-darker/70' 
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Footer - Boutons Annuler / Confirmer */}
            <div className={`px-4 pb-4 flex gap-3`}>
              <button
                onClick={handleCancel}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  isDark 
                    ? 'bg-seka-darker text-seka-text-muted' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {t.app.cancel}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl font-medium bg-seka-green text-seka-darker"
              >
                {t.app.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
